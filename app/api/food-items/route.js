import { NextResponse } from "next/server";
import * as foodItemService from "@/app/api/_services/foodItemService";

/**
 * GET /api/food-items
 * Get all available food items (public)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const isVeg = searchParams.get("isVeg");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");
    const skip = searchParams.get("skip");

    const filters = { isAvailable: true };
    if (isVeg !== null) filters.isVeg = isVeg === "true";
    if (categoryId) filters.categoryId = categoryId;
    if (search) filters.search = search;
    if (limit) filters.limit = parseInt(limit);
    if (skip) filters.skip = parseInt(skip);

    const foodItems = await foodItemService.getFoodItems(filters);

    return NextResponse.json({ foodItems });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch food items" },
      { status: 500 }
    );
  }
}
