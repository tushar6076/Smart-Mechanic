import Redis from "ioredis";

// Centralized connection instance leveraging your environment matrix
const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

// --- OTP PARAMETER LOGIC (Mirrors your Python FastAPI Engine) ---

/**
 * Stores the OTP verification code mapped to the user email with an explicit expiration window.
 * @param email - Target system identifier channel
 * @param code - 6-8 digit generated alphanumeric/numeric token string
 * @param expireSeconds - Time to live in seconds (default: 600 seconds / 10 mins)
 */
export async function setOtp(email: string, code: string, expireSeconds: number = 600): Promise<void> {
  await redis.set(`otp:${email}`, code, "EX", expireSeconds);
}

/**
 * Retrieves the live verification code string currently allocated to the target email.
 */
export async function getOtp(email: string): Promise<string | null> {
  return await redis.get(`otp:${email}`);
}

/**
 * Evict the token from memory immediately upon successful validation.
 */
export async function deleteOtp(email: string): Promise<number> {
  return await redis.del(`otp:${email}`);
}