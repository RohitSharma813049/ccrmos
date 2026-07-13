import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 10 requests per 10 seconds
// By default we use this if we cannot load the global setting
export const getRateLimiter = (limit: number = 1000) => {
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(limit, "60 s"),
    analytics: true,
  });
};
