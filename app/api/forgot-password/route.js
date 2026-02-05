import { NextResponse } from "next/server";
import { issueOtp } from "../_services/otpService";
import { findUserByEmail } from "../_services/userService";
import { isValidEmail, normalizeEmail } from "../_lib/validation";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body || {};

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return NextResponse.json({ message: "No account found with that email" }, { status: 404 });
    }

    const otpResult = await issueOtp({ userId: user.id, email: user.email, purpose: "reset" });
    if (!otpResult.ok) {
      return NextResponse.json({ message: otpResult.message }, { status: otpResult.status });
    }

    const response = NextResponse.json({
      message: "OTP sent",
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
