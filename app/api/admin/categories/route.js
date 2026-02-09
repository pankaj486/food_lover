import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/app/api/_lib/adminAuth";
import * as categoryService from "@/app/api/_services/categoryService";

/**
 * GET /api/admin/categories
 * Get all categories (admin only)
 */
export async function GET(request) {
  try {
    await verifyAdminAccess(request);

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const parentId = searchParams.get("parentId");
    const type = searchParams.get("type");

    const filters = {};
    if (isActive !== null) filters.isActive = isActive === "true";
    if (parentId !== null) filters.parentId = parentId === "null" ? null : parentId;
    if (type) filters.type = type;

    const categories = await categoryService.getCategories(filters);

    return NextResponse.json({ categories });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json(
      { message: error.message || "Failed to fetch categories" },
      { status }
    );
  }
}

/**
 * POST /api/admin/categories
 * Create a new category (admin only)
 */
export async function POST(request) {
  try {
    const admin = await verifyAdminAccess(request);
    const body = await request.json();

    const { name, slug, type, parentId } = body;

    if (!name || !slug || !type) {
      return NextResponse.json(
        { message: "Missing required fields: name, slug, type" },
        { status: 400 }
      );
    }

    const category = await categoryService.createCategory({
      name,
      slug,
      type,
      parentId: parentId || null,
      createdBy: admin.id,
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json(
      { message: error.message || "Failed to create category" },
      { status }
    );
  }
}
