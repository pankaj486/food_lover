import { NextResponse } from "next/server";
import { verifyUserAccess } from "@/app/api/_lib/adminAuth";
import * as orderService from "@/app/api/_services/orderService";

/**
 * GET /api/orders
 * Get all orders for the logged-in user
 */
export async function GET(request) {
  try {
    const user = await verifyUserAccess(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");
    const skip = searchParams.get("skip");

    const filters = {};
    if (status) filters.status = status;
    if (limit) filters.limit = parseInt(limit);
    if (skip) filters.skip = parseInt(skip);

    const orders = await orderService.getUserOrders(user.id, filters);

    return NextResponse.json({ orders });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json(
      { message: error.message || "Failed to fetch orders" },
      { status }
    );
  }
}

/**
 * POST /api/orders
 * Create a new order
 */
export async function POST(request) {
  try {
    const user = await verifyUserAccess(request);
    const body = await request.json();

    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "Missing or invalid field: items" },
        { status: 400 }
      );
    }

    const order = await orderService.createOrder({
      userId: user.id,
      items,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json(
      { message: error.message || "Failed to create order" },
      { status }
    );
  }
}
