import prisma from "../_lib/prisma";

/**
 * Create a new food item
 */
export async function createFoodItem({
  name,
  description,
  price,
  isVeg,
  isAvailable,
  categoryId,
  createdBy,
}) {
  if (!name || price === undefined || !categoryId || !createdBy) {
    throw new Error("Missing required fields: name, price, categoryId, createdBy");
  }

  // Verify category exists
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    throw new Error("Category not found");
  }

  if (price < 0) {
    throw new Error("Price cannot be negative");
  }

  return prisma.foodItem.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      price: parseFloat(price),
      isVeg: isVeg !== false,
      isAvailable: isAvailable !== false,
      categoryId,
      createdBy,
    },
    include: {
      category: true,
      images: true,
    },
  });
}

/**
 * Get all food items with optional filters
 */
export async function getFoodItems({
  isAvailable,
  isVeg,
  categoryId,
  search,
  limit,
  skip,
} = {}) {
  const where = {};

  if (typeof isAvailable === "boolean") {
    where.isAvailable = isAvailable;
  }

  if (typeof isVeg === "boolean") {
    where.isVeg = isVeg;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  return prisma.foodItem.findMany({
    where,
    include: {
      category: true,
      images: {
        orderBy: { isPrimary: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: skip,
  });
}

/**
 * Get a single food item by ID
 */
export async function getFoodItemById(id) {
  return prisma.foodItem.findUnique({
    where: { id },
    include: {
      category: true,
      images: {
        orderBy: { isPrimary: "desc" },
      },
    },
  });
}

/**
 * Update a food item
 */
export async function updateFoodItem(
  id,
  { name, description, price, isVeg, isAvailable, categoryId }
) {
  const foodItem = await prisma.foodItem.findUnique({ where: { id } });
  if (!foodItem) {
    throw new Error("Food item not found");
  }

  // If categoryId is being updated, verify it exists
  if (categoryId && categoryId !== foodItem.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new Error("Category not found");
    }
  }

  const data = {};
  if (name !== undefined) data.name = name.trim();
  if (description !== undefined) data.description = description?.trim() || null;
  if (price !== undefined) {
    if (price < 0) throw new Error("Price cannot be negative");
    data.price = parseFloat(price);
  }
  if (typeof isVeg === "boolean") data.isVeg = isVeg;
  if (typeof isAvailable === "boolean") data.isAvailable = isAvailable;
  if (categoryId !== undefined) data.categoryId = categoryId;

  return prisma.foodItem.update({
    where: { id },
    data,
    include: {
      category: true,
      images: true,
    },
  });
}

/**
 * Delete a food item
 */
export async function deleteFoodItem(id) {
  const foodItem = await prisma.foodItem.findUnique({ where: { id } });
  if (!foodItem) {
    throw new Error("Food item not found");
  }

  // Cascade delete will handle images via Prisma schema
  return prisma.foodItem.delete({ where: { id } });
}
