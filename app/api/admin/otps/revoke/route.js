import { NextResponse } from "next/server";
import prisma from "../../../_lib/prisma";
import { requireAdmin } from "../../../_lib/admin";

export async function POST(request) {
  const auth = requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  const body = await request.json();
  const { id } = body || {};

  if (!id) {
    return NextResponse.json({ message: "OTP id required" }, { status: 400 });
  }

  const otpId = String(id);
  const otp = await prisma.otp.findUnique({ where: { id: otpId } });

  if (!otp) {
    return NextResponse.json({ message: "OTP not found" }, { status: 404 });
  }

  if (otp.usedAt) {
    return NextResponse.json({ message: "OTP already used" }, { status: 409 });
  }

  const updated = await prisma.otp.update({
    where: { id: otpId },
    data: { usedAt: new Date() },
    select: { id: true, usedAt: true },
  });

  return NextResponse.json({ message: "OTP revoked", otp: updated });
}
