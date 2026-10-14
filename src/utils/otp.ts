import crypto from "crypto";
import { deleteCache, getCache, setCache } from "./cache.js";

const OTP_PREFIX = "otp:password_reset:";
const OTP_EXPIRY_SECONDS = 600; // 10 minutes

export const generateOtp = (): string => {
  // Generate a secure 6-digit numeric OTP
  return crypto.randomInt(100000, 999999).toString();
};

export const storeOtp = async (email: string, otp: string): Promise<void> => {
  const key = `${OTP_PREFIX}${email.toLowerCase()}`;
  await setCache(key, otp, OTP_EXPIRY_SECONDS);
};

export const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
  const key = `${OTP_PREFIX}${email.toLowerCase()}`;
  const storedOtp = await getCache<string>(key);
  if (!storedOtp) {
    return false;
  }
  return String(storedOtp).trim() === String(otp).trim();
};

export const removeOtp = async (email: string): Promise<void> => {
  const key = `${OTP_PREFIX}${email.toLowerCase()}`;
  await deleteCache(key);
};

export default {
  generateOtp,
  storeOtp,
  verifyOtp,
  removeOtp,
};
