import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/app/api/_lib/adminAuth";
import * as foodItemService from "@/app/api/_services/foodItemService";

/**
 * GET /api/admin/food-items/[id]
 * Get a single food item by ID (admin only)
 */
export async function GET(request, { params }) {
  try {
    await verifyAdminAccess(request);
    const { id } = await params;

    const foodItem = await foodItemService.getFoodItemById(id);

    if (!foodItem) {
      return NextResponse.json({ message: "Food item not found" }, { status: 404 });
    }

    return NextResponse.json({ foodItem });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json(
      { message: error.message || "Failed to fetch food item" },
      { status }
    );
  }
}

/**
 * PATCH /api/admin/food-items/[id]
 * Update a food item (admin only)
 */
export async function PATCH(request, { params }) {
  try {
    await verifyAdminAccess(request);
    const { id } = await params;
    const body = await request.json();

    const { name, description, price, isVeg, isAvailable, categoryId } = body;

    const foodItem = await foodItemService.updateFoodItem(id, {
      name,
      description,
      price,
      isVeg,
      isAvailable,
      categoryId,
    });

    return NextResponse.json({ foodItem });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json(
      { message: error.message || "Failed to update food item" },
      { status }
    );
  }
}

/**
 * DELETE /api/admin/food-items/[id]
 * Delete a food item (admin only)
 */
export async function DELETE(request, { params }) {
  try {
    await verifyAdminAccess(request);
    const { id } = await params;

    await foodItemService.deleteFoodItem(id);

    return NextResponse.json({ message: "Food item deleted successfully" });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json(
      { message: error.message || "Failed to delete food item" },
      { status }
    );
  }
}
