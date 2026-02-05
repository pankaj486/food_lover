import { NextResponse } from "next/server";
import { issueOtp } from "../_services/otpService";
import { findUserByEmail, verifyPassword } from "../_services/userService";
import { isValidEmail, normalizeEmail } from "../_lib/validation";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const passwordMatches = await verifyPassword(user, password);

    if (!passwordMatches) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const otpResult = await issueOtp({ userId: user.id, email: user.email, purpose: "login" });
    if (!otpResult.ok) {
      return NextResponse.json({ message: otpResult.message }, { status: otpResult.status });
    }

    const response = NextResponse.json({
      message: "OTP resent",
      requiresOtp: true,
      otpId: otpResult.otpId,
    });
    if (otpResult.devCode) {
      response.headers.set("x-otp-dev-code", otpResult.devCode);
    }

    return response;
  } catch (error) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
}
