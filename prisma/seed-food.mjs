import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@foodlover.com";
  const adminPassword = "Admin@123";
  
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  
  if (!admin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin User",
        passwordHash,
        isAdmin: true,
      },
    });
    console.log(`✓ Created admin user: ${adminEmail}`);
  } else {
    // Update existing user to be admin
    admin = await prisma.user.update({
      where: { email: adminEmail },
      data: { isAdmin: true },
    });
    console.log(`✓ Updated existing user to admin: ${adminEmail}`);
  }

  // Create sample categories
  const vegCategory = await prisma.category.upsert({
    where: { slug: "veg" },
    update: {},
    create: {
      name: "Vegetarian",
      slug: "veg",
      type: "Veg",
      isActive: true,
      createdBy: admin.id,
    },
  });
  console.log("✓ Created/Updated Veg category");

  const nonVegCategory = await prisma.category.upsert({
    where: { slug: "non-veg" },
    update: {},
    create: {
      name: "Non-Vegetarian",
      slug: "non-veg",
      type: "Non-Veg",
      isActive: true,
      createdBy: admin.id,
    },
  });
  console.log("✓ Created/Updated Non-Veg category");

  // Create sub-categories
  const northIndian = await prisma.category.upsert({
    where: { slug: "north-indian" },
    update: {},
    create: {
      name: "North Indian",
      slug: "north-indian",
      type: "Veg",
      parentId: vegCategory.id,
      isActive: true,
      createdBy: admin.id,
    },
  });
  console.log("✓ Created/Updated North Indian category");

  const chicken = await prisma.category.upsert({
    where: { slug: "chicken" },
    update: {},
    create: {
      name: "Chicken",
      slug: "chicken",
      type: "Non-Veg",
      parentId: nonVegCategory.id,
      isActive: true,
      createdBy: admin.id,
    },
  });
  console.log("✓ Created/Updated Chicken category");

  // Create sample food items
  const existingPaneer = await prisma.foodItem.findFirst({
    where: { name: "Paneer Tikka", categoryId: northIndian.id },
  });
  
  if (!existingPaneer) {
    await prisma.foodItem.create({
      data: {
        name: "Paneer Tikka",
        description: "Grilled cottage cheese marinated in spices",
        price: 12.99,
        isVeg: true,
        isAvailable: true,
        categoryId: northIndian.id,
        createdBy: admin.id,
      },
    });
    console.log("✓ Created Paneer Tikka");
  } else {
    console.log("✓ Paneer Tikka already exists");
  }

  const existingChicken = await prisma.foodItem.findFirst({
    where: { name: "Butter Chicken", categoryId: chicken.id },
  });
  
  if (!existingChicken) {
    await prisma.foodItem.create({
      data: {
        name: "Butter Chicken",
        description: "Creamy tomato-based curry with tender chicken pieces",
        price: 15.99,
        isVeg: false,
        isAvailable: true,
        categoryId: chicken.id,
        createdBy: admin.id,
      },
    });
    console.log("✓ Created Butter Chicken");
  } else {
    console.log("✓ Butter Chicken already exists");
  }

  const existingDal = await prisma.foodItem.findFirst({
    where: { name: "Dal Makhani", categoryId: northIndian.id },
  });
  
  if (!existingDal) {
    await prisma.foodItem.create({
      data: {
        name: "Dal Makhani",
        description: "Slow-cooked black lentils in buttery tomato gravy",
        price: 10.99,
        isVeg: true,
        isAvailable: true,
        categoryId: northIndian.id,
        createdBy: admin.id,
      },
    });
    console.log("✓ Created Dal Makhani");
  } else {
    console.log("✓ Dal Makhani already exists");
  }

  console.log("\n✅ Seed completed successfully!");
  console.log(`\nAdmin credentials:`);
  console.log(`  Email: ${adminEmail}`);
  console.log(`  Password: ${adminPassword}`);
  console.log(`\nRemember to change the admin password after first login!`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
