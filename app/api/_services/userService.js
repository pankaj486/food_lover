import bcrypt from "bcryptjs";
import prisma from "../_lib/prisma";
import { normalizeEmail } from "../_lib/validation";

export async function findUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;
  return prisma.user.findUnique({ where: { email: normalizedEmail } });
}

export async function createUser({ email, password, name }) {
  const normalizedEmail = normalizeEmail(email);
  const passwordHash = await bcrypt.hash(password, 10);
  const trimmedName = name ? String(name).trim() : "";

  return prisma.user.create({
    data: {
      email: normalizedEmail,
      name: trimmedName || null,
      passwordHash,
    },
  });
}

export async function verifyPassword(user, password) {
  if (!user) return false;
  return bcrypt.compare(password, user.passwordHash);
}

export async function updateUserPassword(userId, newPassword) {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

export async function updateUserProfile(userId, { name, imageUrl }) {
  const data = {};
  if (typeof name === "string") {
    const trimmedName = name.trim();
    data.name = trimmedName || null;
  }
  if (typeof imageUrl === "string") {
    const trimmedUrl = imageUrl.trim();
    data.imageUrl = trimmedUrl || null;
  }

  return prisma.user.update({
    where: { id: userId },
    data,
  });
}
