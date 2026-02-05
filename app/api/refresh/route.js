import { NextResponse } from "next/server";
import {
  signAccessToken,
  signRefreshToken,
  tokenConfig,
  verifyRefreshToken,
} from "../_lib/auth";
import prisma from "../_lib/prisma";

export async function POST(request) {
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "Missing refresh token" }, { status: 401 });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 403 });
    }

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    const response = NextResponse.json({
      accessToken: newAccessToken,
      expiresIn: tokenConfig.accessTtlSeconds,
    });

    response.cookies.set({
      name: "refreshToken",
      value: newRefreshToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: tokenConfig.refreshTtlDays * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ message: "Refresh token invalid" }, { status: 403 });
  }
}
