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

export async function consumeOtp(email: string, code: string): Promise<boolean> {
  const result = await redis.eval(
    "local value = redis.call('GET', KEYS[1]); if value and value == ARGV[1] then return redis.call('DEL', KEYS[1]) end; return 0",
    1,
    `otp:${email}`,
    code,
  );
  return Number(result) === 1;
}

/**
 * Evict the token from memory immediately upon successful validation.
 */
export async function deleteOtp(email: string): Promise<number> {
  return await redis.del(`otp:${email}`);
}

export async function setPasswordResetToken(
  token: string,
  email: string,
  expireSeconds: number = 600,
): Promise<void> {
  await redis.set(`password-reset:${token}`, email, "EX", expireSeconds);
}

export async function getPasswordResetEmail(token: string): Promise<string | null> {
  return await redis.get(`password-reset:${token}`);
}

export async function deletePasswordResetToken(token: string): Promise<number> {
  return await redis.del(`password-reset:${token}`);
}

export async function consumePasswordResetToken(token: string, email: string): Promise<boolean> {
  const result = await redis.eval(
    "local value = redis.call('GET', KEYS[1]); if value and value == ARGV[1] then return redis.call('DEL', KEYS[1]) end; return 0",
    1,
    `password-reset:${token}`,
    email,
  );
  return Number(result) === 1;
}