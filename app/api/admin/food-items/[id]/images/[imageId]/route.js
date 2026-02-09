import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/app/api/_lib/adminAuth";
import * as foodImageService from "@/app/api/_services/foodImageService";

/**
 * PATCH /api/admin/food-items/[id]/images/[imageId]
 * Set an image as primary (admin only)
 */
export async function PATCH(request, { params }) {
  try {
    await verifyAdminAccess(request);
    const { id, imageId } = await params;

    const image = await foodImageService.setPrimaryImage(imageId, id);

    return NextResponse.json({ image });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json(
      { message: error.message || "Failed to set primary image" },
      { status }
    );
  }
}

/**
 * DELETE /api/admin/food-items/[id]/images/[imageId]
 * Delete an image (admin only)
 */
export async function DELETE(request, { params }) {
  try {
    await verifyAdminAccess(request);
    const { imageId } = await params;

    await foodImageService.deleteFoodImage(imageId);

    return NextResponse.json({ message: "Image deleted successfully" });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json(
      { message: error.message || "Failed to delete image" },
      { status }
    );
  }
}
