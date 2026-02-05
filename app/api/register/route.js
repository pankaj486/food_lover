import { NextResponse } from "next/server";
import prisma from "../_lib/prisma";
import { issueOtp } from "../_services/otpService";
import { createUser, findUserByEmail } from "../_services/userService";
import { isValidEmail, isValidPassword, normalizeEmail } from "../_lib/validation";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name } = body || {};

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const trimmedName = name ? String(name).trim() : "";
    if (trimmedName && trimmedName.length > 60) {
      return NextResponse.json({ message: "Name is too long" }, { status: 400 });
    }

    const existing = await findUserByEmail(normalizedEmail);

    if (existing) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    const user = await createUser({ email: normalizedEmail, name: trimmedName, password });

    const otpResult = await issueOtp({
      userId: user.id,
      email: user.email,
      purpose: "login",
      onSendFail: async () => {
        await prisma.user.delete({ where: { id: user.id } });
      },
    });

    if (!otpResult.ok) {
      return NextResponse.json({ message: otpResult.message }, { status: otpResult.status });
    }

    const response = NextResponse.json({
      message: "Registration successful. OTP sent.",
      requiresOtp: true,
      otpId: otpResult.otpId,
    });
    if (otpResult.devCode) {
      response.headers.set("x-otp-dev-code", otpResult.devCode);
    }

    return response;
  } catch (error) {
    return NextResponse.json({ message: "Registration failed" }, { status: 400 });
  }
}
