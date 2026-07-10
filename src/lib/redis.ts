import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

/**
 * Utility to save an OTP temporarily
 */
export async function setTemporaryOTP(email: string, otp: string, expiresInSeconds: number = 300) {
  // Store OTP with an expiration (default 5 mins)
  await redis.set(`otp:${email}`, otp, { ex: expiresInSeconds });
}

/**
 * Utility to retrieve an OTP
 */
export async function getTemporaryOTP(email: string): Promise<string | null> {
  return await redis.get(`otp:${email}`);
}
