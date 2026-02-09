import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/app/api/_lib/adminAuth";
import * as foodItemService from "@/app/api/_services/foodItemService";

/**
 * GET /api/admin/food-items
 * Get all food items (admin only)
 */
export async function GET(request) {
  try {
    await verifyAdminAccess(request);

    const { searchParams } = new URL(request.url);
    const isAvailable = searchParams.get("isAvailable");
    const isVeg = searchParams.get("isVeg");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");
    const skip = searchParams.get("skip");

    const filters = {};
    if (isAvailable !== null) filters.isAvailable = isAvailable === "true";
    if (isVeg !== null) filters.isVeg = isVeg === "true";
    if (categoryId) filters.categoryId = categoryId;
    if (search) filters.search = search;
    if (limit) filters.limit = parseInt(limit);
    if (skip) filters.skip = parseInt(skip);

    const foodItems = await foodItemService.getFoodItems(filters);

    return NextResponse.json({ foodItems });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json(
      { message: error.message || "Failed to fetch food items" },
      { status }
    );
  }
}

/**
 * POST /api/admin/food-items
 * Create a new food item (admin only)
 */
export async function POST(request) {
  try {
    const admin = await verifyAdminAccess(request);
    const body = await request.json();

    const { name, description, price, isVeg, isAvailable, categoryId } = body;

    if (!name || price === undefined || !categoryId) {
      return NextResponse.json(
        { message: "Missing required fields: name, price, categoryId" },
        { status: 400 }
      );
    }

    const foodItem = await foodItemService.createFoodItem({
      name,
      description,
      price,
      isVeg,
      isAvailable,
      categoryId,
      createdBy: admin.id,
    });

    return NextResponse.json({ foodItem }, { status: 201 });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json(
      { message: error.message || "Failed to create food item" },
      { status }
    );
  }
}
