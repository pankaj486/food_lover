import { NextResponse } from "next/server";
import { tokenConfig } from "../_lib/auth";
import { isAdminEmail } from "../_lib/admin";
import { issueTokens } from "../_services/tokenService";
import { resolveOtpForVerification, markOtpUsed, verifyOtpCode } from "../_services/otpService";
import { findUserByEmail } from "../_services/userService";
import { isValidEmail, isValidOtp, normalizeEmail, normalizeOtp } from "../_lib/validation";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, code, otpId } = body || {};

    if (!email || !code) {
      return NextResponse.json({ message: "Email and code required" }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    const normalizedCode = normalizeOtp(code);
    if (!isValidOtp(normalizedCode)) {
      return NextResponse.json({ message: "OTP must be 6 digits" }, { status: 400 });
    }
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return NextResponse.json({ message: "Invalid verification attempt" }, { status: 401 });
    }

    const otpResult = await resolveOtpForVerification({
      userId: user.id,
      otpId,
      purpose: "login",
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

    await markOtpUsed(otpResult.otp.id);
    const { accessToken, refreshToken } = issueTokens(user);

    const response = NextResponse.json({
      accessToken,
      expiresIn: tokenConfig.accessTtlSeconds,
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? "",
        imageUrl: user.imageUrl ?? "",
        isAdmin: isAdminEmail(user.email),
      },
    });

    response.cookies.set({
      name: "refreshToken",
      value: refreshToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: tokenConfig.refreshTtlDays * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ message: "OTP verification failed" }, { status: 400 });
  }
}
