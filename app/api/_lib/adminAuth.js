import { verifyAccessToken } from "./auth";
import prisma from "./prisma";

/**
 * Verify admin access token and return user
 */
export async function verifyAdminAccess(request) {
  const authHeader = request.headers.get("authorization") || "";
  const [, token] = authHeader.split(" ");

  if (!token) {
    const error = new Error("Missing access token");
    error.status = 401;
    throw error;
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user) {
      const error = new Error("User not found");
      error.status = 401;
      throw error;
    }

    if (!user.isAdmin) {
      const error = new Error("Admin access required");
      error.status = 403;
      throw error;
    }

    return user;
  } catch (err) {
    if (err.status) throw err;
    const error = new Error("Invalid or expired access token");
    error.status = 401;
    throw error;
  }
}

/**
 * Verify user access token and return user
 */
export async function verifyUserAccess(request) {
  const authHeader = request.headers.get("authorization") || "";
  const [, token] = authHeader.split(" ");

  if (!token) {
    const error = new Error("Missing access token");
    error.status = 401;
    throw error;
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user) {
      const error = new Error("User not found");
      error.status = 401;
      throw error;
    }

    return user;
  } catch (err) {
    if (err.status) throw err;
    const error = new Error("Invalid or expired access token");
    error.status = 401;
    throw error;
  }
}
