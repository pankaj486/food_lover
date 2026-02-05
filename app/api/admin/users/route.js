import { NextResponse } from "next/server";
import prisma from "../../_lib/prisma";
import { requireAdmin } from "../../_lib/admin";

export async function GET(request) {
  const auth = requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, email: true, name: true, createdAt: true },
  });

  return NextResponse.json({ users });
}
