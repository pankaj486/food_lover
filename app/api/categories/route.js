import { NextResponse } from "next/server";
import * as categoryService from "@/app/api/_services/categoryService";

/**
 * GET /api/categories
 * Get all active categories (public)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const type = searchParams.get("type");

    const filters = { isActive: true };
    if (parentId !== null) filters.parentId = parentId === "null" ? null : parentId;
    if (type) filters.type = type;

    const categories = await categoryService.getCategories(filters);

    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
