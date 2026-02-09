import prisma from "../_lib/prisma";

/**
 * Create a new order
 */
export async function createOrder({ userId, items }) {
  if (!userId || !items || items.length === 0) {
    throw new Error("Missing required fields: userId, items");
  }

  // Verify user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  // Fetch all food items and validate
  const foodItemIds = items.map((item) => item.foodItemId);
  const foodItems = await prisma.foodItem.findMany({
    where: { id: { in: foodItemIds } },
  });

  if (foodItems.length !== foodItemIds.length) {
    throw new Error("One or more food items not found");
  }

  // Check availability
  const unavailable = foodItems.filter((item) => !item.isAvailable);
  if (unavailable.length > 0) {
    throw new Error(`Food items not available: ${unavailable.map((i) => i.name).join(", ")}`);
  }

  // Create food item map for quick lookup
  const foodItemMap = {};
  foodItems.forEach((item) => {
    foodItemMap[item.id] = item;
  });

  // Calculate total and prepare order items
  let totalAmount = 0;
  const orderItemsData = items.map((item) => {
    const foodItem = foodItemMap[item.foodItemId];
    const quantity = item.quantity || 1;
    
    if (quantity <= 0) {
      throw new Error("Quantity must be positive");
    }

    const itemTotal = foodItem.price * quantity;
    totalAmount += itemTotal;

    return {
      foodItemId: foodItem.id,
      foodName: foodItem.name, // Snapshot
      price: foodItem.price, // Snapshot
      quantity,
    };
  });

  // Create order with items in a transaction
  return prisma.order.create({
    data: {
      userId,
      totalAmount,
      status: "pending",
      items: {
        create: orderItemsData,
      },
    },
    include: {
      items: {
        include: {
          foodItem: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
      },
    },
  });
}

/**
 * Get all orders for a user
 */
export async function getUserOrders(userId, { status, limit, skip } = {}) {
  const where = { userId };

  if (status) {
    where.status = status;
  }

  return prisma.order.findMany({
    where,
    include: {
      items: {
        include: {
          foodItem: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: skip,
  });
}

/**
 * Get a single order by ID
 */
export async function getOrderById(orderId, userId) {
  const where = { id: orderId };
  
  // If userId provided, ensure order belongs to user
  if (userId) {
    where.userId = userId;
  }

  return prisma.order.findUnique({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          foodItem: {
            include: {
              category: true,
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
      },
    },
  });
}

/**
 * Get all orders (admin)
 */
export async function getAllOrders({ status, limit, skip } = {}) {
  const where = {};

  if (status) {
    where.status = status;
  }

  return prisma.order.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          foodItem: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: skip,
  });
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, status) {
  const validStatuses = ["pending", "confirmed", "preparing", "delivered", "cancelled"];
  
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error("Order not found");
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      items: true,
    },
  });
}

/**
 * Cancel an order
 */
export async function cancelOrder(orderId, userId) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  
  if (!order) {
    throw new Error("Order not found");
  }

  // If userId provided, verify order belongs to user
  if (userId && order.userId !== userId) {
    throw new Error("Unauthorized to cancel this order");
  }

  // Only pending or confirmed orders can be cancelled
  if (!["pending", "confirmed"].includes(order.status)) {
    throw new Error(`Cannot cancel order with status: ${order.status}`);
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: "cancelled" },
  });
}
