import { PrismaClient } from "../../prisma/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import config from "./index.js";

declare global {
  var __prismaPool: pg.Pool | undefined;
  var __prismaClient: PrismaClient | undefined;
}

const cleanDatabaseUrl = config.database_url
  ? config.database_url
      .replace(/([?&])sslmode=[^&]+(&|$)/, "$1")
      .replace(/[?&]$/, "")
  : "";

const pool =
  globalThis.__prismaPool ||
  new pg.Pool({
    connectionString: cleanDatabaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
    max: process.env.VERCEL ? 2 : 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });

globalThis.__prismaPool = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalThis.__prismaClient || new PrismaClient({ adapter });

globalThis.__prismaClient = prisma;

export default prisma;
