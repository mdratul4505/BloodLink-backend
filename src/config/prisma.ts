import { PrismaClient } from "../../prisma/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import config from "./index.js";

declare global {
  var __prismaPool: pg.Pool | undefined;
  var __prismaClient: any | undefined;
}

const cleanDatabaseUrl = (config.database_url || "")
  .replace(/([?&])sslmode=[^&]+(&|$)/, "$1")
  .replace(/[?&]$/, "");

const pool =
  globalThis.__prismaPool ||
  new pg.Pool({
    connectionString: cleanDatabaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
  });

pool.on("error", (err) => {
  console.warn("Postgres pool idle client closed/reset:", err.message);
});

pool.on("connect", (client) => {
  client.on("error", (err) => {
    console.warn("Postgres pool client socket reset:", err.message);
  });
});

globalThis.__prismaPool = pool;

const adapter = new PrismaPg(pool);

const basePrisma = new PrismaClient({ adapter });

export const prisma: any =
  globalThis.__prismaClient ||
  basePrisma.$extends({
    query: {
      $allOperations: async ({ operation, model, args, query }: any) => {
        let retries = 3;
        while (retries >= 0) {
          try {
            return await query(args);
          } catch (error: any) {
            const msg = error?.message || "";
            const isConnError =
              msg.includes("Connection terminated") ||
              msg.includes("connection timeout") ||
              msg.includes("server conn crashed") ||
              msg.includes("Failed to connect to upstream database") ||
              error?.code === "08P01" ||
              error?.code === "57P01" ||
              error?.code === "P1001" ||
              error?.code === "53300";

            if (isConnError && retries > 0) {
              console.warn(
                `[Prisma Retrying] Transient DB error (${msg.slice(0, 80)}...). Retries remaining: ${retries}`,
              );
              retries--;
              await new Promise((r) => setTimeout(r, 800));
              continue;
            }
            throw error;
          }
        }
      },
    },
  });

globalThis.__prismaClient = prisma;


export default prisma;
