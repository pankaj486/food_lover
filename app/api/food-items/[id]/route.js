import { NextResponse } from "next/server";
import * as foodItemService from "@/app/api/_services/foodItemService";

/**
 * GET /api/food-items/[id]
 * Get a single food item by ID (public)
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const foodItem = await foodItemService.getFoodItemById(id);

    if (!foodItem || !foodItem.isAvailable) {
      return NextResponse.json({ message: "Food item not found" }, { status: 404 });
    }

    return NextResponse.json({ foodItem });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch food item" },
      { status: 500 }
    );
  }
}
