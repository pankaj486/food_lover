import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../_lib/prisma";
import { otpConfig, signAccessToken, signRefreshToken, tokenConfig } from "../_lib/auth";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, code, otpId } = body || {};

    if (!email || !code) {
      return NextResponse.json({ message: "Email and code required" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    const normalizedCode = String(code).trim();
    if (!/^\d{6}$/.test(normalizedCode)) {
      return NextResponse.json({ message: "OTP must be 6 digits" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid verification attempt" }, { status: 401 });
    }

    let otp = null;
    const now = new Date();

    console.log("Looking for OTP with ID:", { otpId, userId: user.id });

    if (otpId) {
      otp = await prisma.otp.findFirst({
        where: {
          id: String(otpId),
          userId: user.id,
          purpose: "login",
        },
      });
      console.log("OTP found by ID:", otp ? { id: otp.id, expiresAt: otp.expiresAt, usedAt: otp.usedAt } : null);
      
      // Check if OTP was already used
      if (otp && otp.usedAt) {
        return NextResponse.json(
          { message: "OTP already used. Please request a new code." },
          { status: 401 }
        );
      }
    }

    if (!otp) {
      otp = await prisma.otp.findFirst({
        where: {
          userId: user.id,
          purpose: "login",
          expiresAt: { gt: now },
        },
        orderBy: { createdAt: "desc" },
      });
      console.log("OTP found by user query:", otp ? { id: otp.id, expiresAt: otp.expiresAt, usedAt: otp.usedAt } : null);
      
      // Check if OTP was already used
      if (otp && otp.usedAt) {
        return NextResponse.json(
          { message: "OTP already used. Please request a new code." },
          { status: 401 }
        );
      }
    }

    if (otp && otp.expiresAt <= now) {
      console.log("OTP expired:", { expiresAt: otp.expiresAt, now });
      return NextResponse.json(
        {
          message: "OTP expired. Please request a new code.",
          expiresAt: process.env.NODE_ENV === "production" ? undefined : otp.expiresAt,
          serverTime: process.env.NODE_ENV === "production" ? undefined : now,
        },
        { status: 401 }
      );
    }

    if (!otp) {
      console.log("No valid OTP found for user");
      return NextResponse.json(
        {
          message: "No valid OTP found. Please request a new code.",
          serverTime: process.env.NODE_ENV === "production" ? undefined : now,
        },
        { status: 401 }
      );
    }

    const matches = await bcrypt.compare(normalizedCode, otp.codeHash);

    if (!matches) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 401 });
    }

    await prisma.otp.update({
      where: { id: otp.id },
      data: { usedAt: new Date() },
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    const response = NextResponse.json({
      accessToken,
      expiresIn: tokenConfig.accessTtlSeconds,
      user: { id: user.id, email: user.email, name: user.name ?? "" },
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
