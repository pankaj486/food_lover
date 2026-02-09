import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/app/api/_lib/adminAuth";
import * as orderService from "@/app/api/_services/orderService";

/**
 * GET /api/admin/orders
 * Get all orders (admin only)
 */
export async function GET(request) {
  try {
    await verifyAdminAccess(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");
    const skip = searchParams.get("skip");

    const filters = {};
    if (status) filters.status = status;
    if (limit) filters.limit = parseInt(limit);
    if (skip) filters.skip = parseInt(skip);

    const orders = await orderService.getAllOrders(filters);

    return NextResponse.json({ orders });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json(
      { message: error.message || "Failed to fetch orders" },
      { status }
    );
  }
}
