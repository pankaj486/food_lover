import { NextResponse } from "next/server";
import * as categoryService from "@/app/api/_services/categoryService";

/**
 * GET /api/categories/[slug]
 * Get a single category by slug (public)
 */
export async function GET(request, { params }) {
  try {
    const { slug } = params;

    const category = await categoryService.getCategoryBySlug(slug);

    if (!category || !category.isActive) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch category" },
      { status: 500 }
    );
  }
}
