import type { Server } from "http";
import app from "./app.js";
import config from "./config/index.js";
import prisma from "./config/prisma.js";
import initScheduledJobs from "./utils/cron.js";
import seedSuperAdmin from "./utils/seed.js";
import { connectRedis } from "./config/redis.js";
import { verifySmtpConnection } from "./utils/email.js";

let server: Server;

const main = async () => {
  try {
    // 1. Connect to PostgreSQL via Prisma
    await prisma.$connect();
    console.log("Connected to PostgreSQL database successfully.");

    // 2. Connect to Redis (graceful fallback if offline)
    await connectRedis();

    // 3. Verify Email SMTP connection
    await verifySmtpConnection();

    // 4. Seed initial Super Admin if not present
    await seedSuperAdmin();

    // 5. Start scheduled cron tasks (blood request expiration)
    initScheduledJobs();

    // 5. Start HTTP server
    server = app.listen(config.port, () => {
      console.log(`BloodLink Server is running on port ${config.port}`);
      console.log(`Environment: ${config.env}`);
      console.log(`API Docs: http://localhost:${config.port}/api/v1`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection detected:", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception detected:", error);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Gracefully shutting down...");
  if (server) server.close();
  await prisma.$disconnect();
  process.exit(0);
});

main();