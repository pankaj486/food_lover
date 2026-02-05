import { NextResponse } from "next/server";
import { verifyAccessToken } from "../_lib/auth";
import prisma from "../_lib/prisma";
import { isValidPassword } from "../_lib/validation";
import { updateUserPassword, verifyPassword } from "../_services/userService";

export async function POST(request) {
  const authHeader = request.headers.get("authorization") || "";
  const [, token] = authHeader.split(" ");

  if (!token) {
    return NextResponse.json({ message: "Missing access token" }, { status: 401 });
  }

  try {
    const payload = verifyAccessToken(token);
    const body = await request.json();
    const { currentPassword, newPassword } = body || {};

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (!isValidPassword(newPassword)) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    const matches = await verifyPassword(user, currentPassword);
    if (!matches) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
    }

    await updateUserPassword(user.id, newPassword);

    return NextResponse.json({ message: "Password updated" });
  } catch (error) {
    return NextResponse.json({ message: "Access token invalid or expired" }, { status: 401 });
  }
}
