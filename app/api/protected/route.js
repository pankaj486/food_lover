import { NextResponse } from "next/server";
import { verifyAccessToken } from "../_lib/auth";
import prisma from "../_lib/prisma";

export async function GET(request) {
  const authHeader = request.headers.get("authorization") || "";
  const [, token] = authHeader.split(" ");

  if (!token) {
    return NextResponse.json({ message: "Missing access token" }, { status: 401 });
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    return NextResponse.json({
      message: "Protected data delivered",
      userId: user.id,
      userEmail: user.email,
      scope: payload.scope,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ message: "Access token invalid or expired" }, { status: 401 });
  }
}
