import { NextResponse } from "next/server";
import {
  markOtpUsed,
  resolveOtpForVerification,
  verifyOtpCode,
} from "../_services/otpService";
import { findUserByEmail, updateUserPassword } from "../_services/userService";
import {
  isValidEmail,
  isValidOtp,
  isValidPassword,
  normalizeEmail,
  normalizeOtp,
} from "../_lib/validation";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, code, otpId, newPassword } = body || {};

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { message: "Email, code, and new password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    const normalizedCode = normalizeOtp(code);
    if (!isValidOtp(normalizedCode)) {
      return NextResponse.json({ message: "OTP must be 6 digits" }, { status: 400 });
    }

    if (!isValidPassword(newPassword)) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return NextResponse.json({ message: "No account found with that email" }, { status: 404 });
    }

    const otpResult = await resolveOtpForVerification({
      userId: user.id,
      otpId,
      purpose: "reset",
    });

    if (!otpResult.ok) {
      const details = process.env.NODE_ENV === "production" ? undefined : otpResult.details;
      return NextResponse.json(
        {
          message: otpResult.message,
          ...(details || {}),
        },
        { status: otpResult.status }
      );
    }

    const matches = await verifyOtpCode(otpResult.otp, normalizedCode);
    if (!matches) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 401 });
    }

    await updateUserPassword(user.id, newPassword);
    await markOtpUsed(otpResult.otp.id);

    return NextResponse.json({ message: "Password updated" });
  } catch (error) {
    return NextResponse.json({ message: "Password reset failed" }, { status: 400 });
  }
}
