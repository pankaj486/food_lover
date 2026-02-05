import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../_lib/prisma";
import { otpConfig } from "../_lib/auth";
import { sendOtpEmail, smtpReady } from "../_lib/mailer";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    if (!smtpReady()) {
      return NextResponse.json(
        { message: "SMTP is not configured. Please contact support." },
        { status: 500 }
      );
    }

    const rawOtp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(rawOtp, 10);
    const expiresAt = new Date(Date.now() + otpConfig.ttlMinutes * 60 * 1000);

    const otpRecord = await prisma.otp.create({
      data: {
        userId: user.id,
        codeHash: otpHash,
        expiresAt,
        purpose: "login",
      },
    });

    const response = NextResponse.json({
      message: "OTP resent",
      requiresOtp: true,
      otpId: otpRecord.id,
    });

    try {
      await sendOtpEmail({ to: user.email, code: rawOtp, expiresAt });
    } catch (error) {
      await prisma.otp.delete({ where: { id: otpRecord.id } });
      return NextResponse.json(
        { message: "Failed to send OTP email. Try again later." },
        { status: 500 }
      );
    }

    if (otpConfig.devMode) {
      response.headers.set("x-otp-dev-code", rawOtp);
    }

    return response;
  } catch (error) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
}
