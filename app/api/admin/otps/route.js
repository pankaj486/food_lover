import { NextResponse } from "next/server";
import prisma from "../../_lib/prisma";
import { requireAdmin } from "../../_lib/admin";

export async function GET(request) {
  const auth = requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  const otps = await prisma.otp.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      userId: true,
      purpose: true,
      expiresAt: true,
      usedAt: true,
      createdAt: true,
      user: {
        select: { email: true, name: true },
      },
    },
  });

  return NextResponse.json({ otps });
}
