import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const email = (process.env.SEED_USER_EMAIL || "admin-demo@yopmail.com").toLowerCase();
const password = process.env.SEED_USER_PASSWORD || "password";
const name = process.env.SEED_USER_NAME || "Demo Admin";

try {
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name },
    create: { email, passwordHash, name },
  });

  console.log(`Seeded user: ${email}`);
} catch (error) {
  console.error("Seed failed:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
