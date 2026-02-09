import { NextResponse } from "next/server";
import { verifyUserAccess } from "@/app/api/_lib/adminAuth";
import * as orderService from "@/app/api/_services/orderService";

/**
 * GET /api/orders/[id]
 * Get a single order by ID (user can only see their own orders)
 */
export async function GET(request, { params }) {
  try {
    const user = await verifyUserAccess(request);
    const { id } = params;

    const order = await orderService.getOrderById(id, user.id);

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
 * PATCH /api/orders/[id]
 * Cancel an order (user can only cancel their own orders)
 */
export async function PATCH(request, { params }) {
  try {
    const user = await verifyUserAccess(request);
    const { id } = params;
    const body = await request.json();

    const { action } = body;

    if (action !== "cancel") {
      return NextResponse.json(
        { message: "Invalid action. Use 'cancel' to cancel an order" },
        { status: 400 }
      );
    }

    const order = await orderService.cancelOrder(id, user.id);

    return NextResponse.json({ order });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json(
      { message: error.message || "Failed to update order" },
      { status }
    );
  }
}
