import { NextResponse } from "next/server";
import prisma from "../../_lib/prisma";
import { requireAdmin } from "../../_lib/admin";

export async function GET(request) {
  const auth = requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  const now = new Date();

  const [totalUsers, totalOtps, activeOtps, latestOtp, latestUser] = await Promise.all([
    prisma.user.count(),
    prisma.otp.count(),
    prisma.otp.count({ where: { expiresAt: { gt: now }, usedAt: null } }),
    prisma.otp.findFirst({
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, expiresAt: true, usedAt: true },
    }),
    prisma.user.findFirst({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({
    totals: {
      users: totalUsers,
      otps: totalOtps,
      activeOtps,
    },
    latestOtp,
    latestUser,
  });
}
