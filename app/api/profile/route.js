import { NextResponse } from "next/server";
import { verifyAccessToken } from "../_lib/auth";
import prisma from "../_lib/prisma";
import { updateUserProfile } from "../_services/userService";

export async function PATCH(request) {
  const authHeader = request.headers.get("authorization") || "";
  const [, token] = authHeader.split(" ");

  if (!token) {
    return NextResponse.json({ message: "Missing access token" }, { status: 401 });
  }

  try {
    const payload = verifyAccessToken(token);
    const body = await request.json();
    const { name, imageUrl } = body || {};

    const hasName = typeof name === "string";
    const hasImage = typeof imageUrl === "string";

    if (!hasName && !hasImage) {
      return NextResponse.json({ message: "Nothing to update" }, { status: 400 });
    }

    if (hasName && String(name).trim().length > 60) {
      return NextResponse.json({ message: "Name is too long" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    const updated = await updateUserProfile(user.id, { name, imageUrl });

    return NextResponse.json({
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name ?? "",
        imageUrl: updated.imageUrl ?? "",
        isAdmin: false,
      },
    });
  } catch (error) {
    console.error("Profile API error:", error.message, error.code);
    return NextResponse.json(
      { 
        message: error.code === "TokenExpiredError" ? "Access token expired" : "Access token invalid",
        error: error.message 
      }, 
      { status: 401 }
    );
  }
}
