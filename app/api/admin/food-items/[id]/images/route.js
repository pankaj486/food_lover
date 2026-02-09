import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/app/api/_lib/adminAuth";
import * as foodImageService from "@/app/api/_services/foodImageService";

/**
 * GET /api/admin/food-items/[id]/images
 * Get all images for a food item (admin only)
 */
export async function GET(request, { params }) {
  try {
    await verifyAdminAccess(request);
    const { id } = await params;

    const images = await foodImageService.getFoodImages(id);

    return NextResponse.json({ images });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json(
      { message: error.message || "Failed to fetch images" },
      { status }
    );
  }
}

/**
 * POST /api/admin/food-items/[id]/images
 * Add an image to a food item (admin only)
 */
export async function POST(request, { params }) {
  try {
    await verifyAdminAccess(request);
    const { id } = await params;
    const body = await request.json();

    const { imageUrl, isPrimary } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { message: "Missing required field: imageUrl" },
        { status: 400 }
      );
    }

    const image = await foodImageService.addFoodImage({
      foodItemId: id,
      imageUrl,
      isPrimary: isPrimary || false,
    });

    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json(
      { message: error.message || "Failed to add image" },
      { status }
    );
  }
}
