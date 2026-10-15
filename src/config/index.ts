import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const smtpUser = process.env.SMTP_USER || process.env.smtp_user || "";
const smtpPassword = process.env.SMTP_PASSWORD || process.env.smtp_password || "";

export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  database_url: (process.env.DATABASE_URL || "").trim(),
  backend_url: (process.env.BACKEND_URL || "http://localhost:5000").trim(),
  frontend_url: (process.env.FRONTEND_URL || "http://localhost:3000").trim(),


  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  jwt: {
    access_secret:
      process.env.JWT_ACCESS_SECRET || "default_bloodlink_access_secret_key",
    refresh_secret:
      process.env.JWT_REFRESH_SECRET || "default_bloodlink_refresh_secret_key",
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  google: {
    client_id: process.env.GOOGLE_CLIENT_ID || "",
  },
  admin: {
    name: process.env.ADMIN_NAME || "BloodLink Super Admin",
    email: process.env.ADMIN_EMAIL || "admin@bloodlink.org",
    password: process.env.ADMIN_PASSWORD || "Admin@123456",
  },
  redis: {
    url: process.env.REDIS_URL || undefined,
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    user: process.env.REDIS_USER || "default",
  },
  email: {
    smtp_user: smtpUser,
    smtp_password: smtpPassword,
    from: process.env.SMTP_FROM || `"BloodLink" <${smtpUser}>`,
  },
  smtp_user: smtpUser,
  smtp_password: smtpPassword,
  bkash: {
    app_key: (process.env.BKASH_APP_KEY || "4f6o0cjiki2rfm34kfdadl1eqq").trim(),
    app_secret: (
      process.env.BKASH_APP_SECRET ||
      "2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b"
    ).trim(),
    username: (process.env.BKASH_USERNAME || "sandboxTokenizedUser02").trim(),
    password: (process.env.BKASH_PASSWORD || "sandboxTokenizedUser02@12345").trim(),
    base_url: (
      process.env.BKASH_BASE_URL ||
      "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout"
    ).trim(),
    callback_url: (
      process.env.BKASH_CALLBACK_URL ||
      "https://blood-link-backend-one.vercel.app/api/v1/payments/bkash/callback"
    ).trim(),
  },
};

export default config;
