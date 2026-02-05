import bcrypt from "bcryptjs";
import prisma from "../_lib/prisma";
import { otpConfig } from "../_lib/auth";
import { sendOtpEmail, smtpReady } from "../_lib/mailer";

export async function issueOtp({ userId, email, purpose = "login", onSendFail }) {
  if (!smtpReady()) {
    return { ok: false, status: 500, message: "SMTP is not configured. Please contact support." };
  }

  const rawOtp = String(Math.floor(100000 + Math.random() * 900000));
  const otpHash = await bcrypt.hash(rawOtp, 10);
  const expiresAt = new Date(Date.now() + otpConfig.ttlMinutes * 60 * 1000);

  const otpRecord = await prisma.otp.create({
    data: {
      userId,
      codeHash: otpHash,
      expiresAt,
      purpose,
    },
  });

  try {
    await sendOtpEmail({ to: email, code: rawOtp, expiresAt });
  } catch (error) {
    await prisma.otp.delete({ where: { id: otpRecord.id } });
    if (onSendFail) {
      await onSendFail(error);
    }
    return {
      ok: false,
      status: 500,
      message: "Failed to send OTP email. Try again later.",
    };
  }

  return {
    ok: true,
    otpId: otpRecord.id,
    expiresAt,
    devCode: otpConfig.devMode ? rawOtp : null,
  };
}

export async function resolveOtpForVerification({ userId, otpId, purpose = "login" }) {
  const now = new Date();
  let otp = null;

  if (otpId) {
    otp = await prisma.otp.findFirst({
      where: {
        id: String(otpId),
        userId,
        purpose,
      },
    });

    if (otp?.usedAt) {
      return { ok: false, status: 401, message: "OTP already used. Please request a new code." };
    }
  }

  if (!otp) {
    otp = await prisma.otp.findFirst({
      where: {
        userId,
        purpose,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: "desc" },
    });

    if (otp?.usedAt) {
      return { ok: false, status: 401, message: "OTP already used. Please request a new code." };
    }
  }

  if (otp && otp.expiresAt <= now) {
    return {
      ok: false,
      status: 401,
      message: "OTP expired. Please request a new code.",
      details: { expiresAt: otp.expiresAt, serverTime: now },
    };
  }

  if (!otp) {
    return {
      ok: false,
      status: 401,
      message: "No valid OTP found. Please request a new code.",
      details: { serverTime: now },
    };
  }

  return { ok: true, otp };
}

export async function verifyOtpCode(otp, code) {
  if (!otp) return false;
  return bcrypt.compare(code, otp.codeHash);
}

export async function markOtpUsed(id) {
  return prisma.otp.update({
    where: { id },
    data: { usedAt: new Date() },
  });
}
