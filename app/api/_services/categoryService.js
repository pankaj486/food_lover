import prisma from "../_lib/prisma";

/**
 * Create a new category
 */
export async function createCategory({ name, slug, type, parentId, createdBy }) {
  if (!name || !slug || !type || !createdBy) {
    throw new Error("Missing required fields: name, slug, type, createdBy");
  }

  // Check if slug already exists
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    throw new Error("Category with this slug already exists");
  }

  // If parentId is provided, verify parent exists
  if (parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) {
      throw new Error("Parent category not found");
    }
  }

  return prisma.category.create({
    data: {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      type: type.trim(),
      parentId: parentId || null,
      createdBy,
      isActive: true,
    },
    include: {
      parent: true,
    },
  });
}

/**
 * Get all categories with optional filters
 */
export async function getCategories({ isActive, parentId, type } = {}) {
  const where = {};

  if (typeof isActive === "boolean") {
    where.isActive = isActive;
  }

  if (parentId !== undefined) {
    where.parentId = parentId;
  }

  if (type) {
    where.type = type;
  }

  return prisma.category.findMany({
    where,
    include: {
      parent: true,
      children: {
        where: typeof isActive === "boolean" ? { isActive } : undefined,
      },
      _count: {
        select: { foodItems: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get a single category by ID
 */
export async function getCategoryById(id) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      parent: true,
      children: true,
      _count: {
        select: { foodItems: true },
      },
    },
  });
}

/**
 * Get a single category by slug
 */
export async function getCategoryBySlug(slug) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: true,
      _count: {
        select: { foodItems: true },
      },
    },
  });
}

/**
 * Update a category
 */
export async function updateCategory(id, { name, slug, type, parentId, isActive }) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new Error("Category not found");
  }

  // If slug is being updated, check for uniqueness
  if (slug && slug !== category.slug) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new Error("Category with this slug already exists");
    }
  }

  // Prevent setting self as parent
  if (parentId && parentId === id) {
    throw new Error("Category cannot be its own parent");
  }

  // If parentId is provided, verify parent exists
  if (parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) {
      throw new Error("Parent category not found");
    }
  }

  const data = {};
  if (name !== undefined) data.name = name.trim();
  if (slug !== undefined) data.slug = slug.trim().toLowerCase();
  if (type !== undefined) data.type = type.trim();
  if (parentId !== undefined) data.parentId = parentId;
  if (typeof isActive === "boolean") data.isActive = isActive;

  return prisma.category.update({
    where: { id },
    data,
    include: {
      parent: true,
      children: true,
    },
  });
}

/**
 * Delete a category (only if no food items associated)
 */
export async function deleteCategory(id) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { foodItems: true, children: true },
      },
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  if (category._count.foodItems > 0) {
    throw new Error("Cannot delete category with associated food items");
  }

  if (category._count.children > 0) {
    throw new Error("Cannot delete category with child categories");
  }

  return prisma.category.delete({ where: { id } });
}
