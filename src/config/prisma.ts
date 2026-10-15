import { PrismaClient } from "../../prisma/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import config from "./index.js";

// Clean database URL to ensure robust SSL handshake on serverless/cloud environments
const cleanDatabaseUrl = config.database_url
  ? config.database_url
      .replace(/([?&])sslmode=[^&]+(&|$)/, "$1")
      .replace(/[?&]$/, "")
  : "";

const pool = new pg.Pool({
  connectionString: cleanDatabaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

export default prisma;
