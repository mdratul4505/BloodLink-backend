import { seedSuperAdmin } from "../src/utils/seed.js";
import prisma from "../src/config/prisma.js";

async function main() {
  console.log("Starting database seeding...");
  await seedSuperAdmin();
  console.log("Database seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
