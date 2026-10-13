import { getCache, setCache } from "./cache.js";

const BLACKLIST_PREFIX = "token:blacklist:";

export const blacklistToken = async (
  token: string,
  ttlSeconds = 86400,
): Promise<void> => {
  await setCache(`${BLACKLIST_PREFIX}${token}`, "true", ttlSeconds);
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const result = await getCache<string>(`${BLACKLIST_PREFIX}${token}`);
  return result === "true";
};

export default {
  blacklistToken,
  isTokenBlacklisted,
};
