import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../_lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name } = body || {};

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name ? String(name).trim() : null,
        passwordHash,
      },
    });

    return NextResponse.json({
      message: "Registration successful",
      user: { id: user.id, email: user.email, name: user.name ?? "" },
    });
  } catch (error) {
    return NextResponse.json({ message: "Registration failed" }, { status: 400 });
  }
}
