import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/app/api/_lib/adminAuth";
import * as orderService from "@/app/api/_services/orderService";

/**
 * GET /api/admin/orders/[id]
 * Get a single order by ID (admin only)
 */
export async function GET(request, { params }) {
  try {
    await verifyAdminAccess(request);
    const { id } = await params;

    const order = await orderService.getOrderById(id);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json(
      { message: error.message || "Failed to fetch order" },
      { status }
    );
  }
}

/**
 * PATCH /api/admin/orders/[id]
 * Update order status (admin only)
 */
export async function PATCH(request, { params }) {
  try {
    await verifyAdminAccess(request);
    const { id } = await params;
    const body = await request.json();

    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { message: "Missing required field: status" },
        { status: 400 }
      );
    }

    const order = await orderService.updateOrderStatus(id, status);

    return NextResponse.json({ order });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json(
      { message: error.message || "Failed to update order status" },
      { status }
    );
  }
}
