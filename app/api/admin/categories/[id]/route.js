import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/app/api/_lib/adminAuth";
import * as categoryService from "@/app/api/_services/categoryService";

/**
 * GET /api/admin/categories/[id]
 * Get a single category by ID (admin only)
 */
export async function GET(request, { params }) {
  try {
    await verifyAdminAccess(request);
    const { id } = await params;

    const category = await categoryService.getCategoryById(id);

    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json(
      { message: error.message || "Failed to fetch category" },
      { status }
    );
  }
}

/**
 * PATCH /api/admin/categories/[id]
 * Update a category (admin only)
 */
export async function PATCH(request, { params }) {
  try {
    await verifyAdminAccess(request);
    const { id } = await params;
    const body = await request.json();

    const { name, slug, type, parentId, isActive } = body;

    const category = await categoryService.updateCategory(id, {
      name,
      slug,
      type,
      parentId,
      isActive,
    });

    return NextResponse.json({ category });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json(
      { message: error.message || "Failed to update category" },
      { status }
    );
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Delete a category (admin only)
 */
export async function DELETE(request, { params }) {
  try {
    await verifyAdminAccess(request);
    const { id } = await params;

    await categoryService.deleteCategory(id);

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json(
      { message: error.message || "Failed to delete category" },
      { status }
    );
  }
}
