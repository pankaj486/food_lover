import prisma from "../_lib/prisma";

/**
 * Add an image to a food item
 */
export async function addFoodImage({ foodItemId, imageUrl, isPrimary }) {
  if (!foodItemId || !imageUrl) {
    throw new Error("Missing required fields: foodItemId, imageUrl");
  }

  // Verify food item exists
  const foodItem = await prisma.foodItem.findUnique({ where: { id: foodItemId } });
  if (!foodItem) {
    throw new Error("Food item not found");
  }

  // If setting as primary, unset other primary images
  if (isPrimary) {
    await prisma.foodImage.updateMany({
      where: { foodItemId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  return prisma.foodImage.create({
    data: {
      foodItemId,
      imageUrl: imageUrl.trim(),
      isPrimary: isPrimary || false,
    },
  });
}

/**
 * Get all images for a food item
 */
export async function getFoodImages(foodItemId) {
  return prisma.foodImage.findMany({
    where: { foodItemId },
    orderBy: [{ isPrimary: "desc" }, { uploadedAt: "desc" }],
  });
}

/**
 * Set an image as primary
 */
export async function setPrimaryImage(imageId, foodItemId) {
  const image = await prisma.foodImage.findUnique({ where: { id: imageId } });
  if (!image) {
    throw new Error("Image not found");
  }

  if (image.foodItemId !== foodItemId) {
    throw new Error("Image does not belong to this food item");
  }

  // Unset other primary images
  await prisma.foodImage.updateMany({
    where: { foodItemId, isPrimary: true },
    data: { isPrimary: false },
  });

  // Set this image as primary
  return prisma.foodImage.update({
    where: { id: imageId },
    data: { isPrimary: true },
  });
}

/**
 * Delete a food image
 */
export async function deleteFoodImage(imageId) {
  const image = await prisma.foodImage.findUnique({ where: { id: imageId } });
  if (!image) {
    throw new Error("Image not found");
  }

  return prisma.foodImage.delete({ where: { id: imageId } });
}
