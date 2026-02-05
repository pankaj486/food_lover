import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../_lib/prisma";
import { signAccessToken, signRefreshToken, tokenConfig } from "../_lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
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
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
}
