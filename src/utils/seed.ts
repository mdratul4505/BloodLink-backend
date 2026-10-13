import bcrypt from "bcryptjs";
import config from "../config/index.js";
import prisma from "../config/prisma.js";

export const seedSuperAdmin = async (): Promise<void> => {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
      },
    });

    if (existingAdmin) {
      console.log("Admin account already exists. Skipping admin seed.");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      config.admin.password,
      config.bcrypt_salt_rounds,
    );

    const admin = await prisma.user.create({
      data: {
        name: config.admin.name,
        email: config.admin.email,
        password: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
        isVerified: true,
      },
    });

    // Create Audit Log for seed initialization
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: "INITIAL_ADMIN_SEED",
        targetType: "User",
        targetId: admin.id,
        details: { email: admin.email, role: "ADMIN" },
      },
    });

    console.log(`Super Admin seeded successfully: ${admin.email}`);
  } catch (error) {
    console.error("Error seeding super admin:", error);
  }
};

export default seedSuperAdmin;
