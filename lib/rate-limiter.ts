/**
 * simple in-memory rate limiter
 * tracks request counts per user within time windows
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

/**
 * checks if user has exceeded rate limit
 * @param userId - user identifier
 * @param limit - max requests allowed in window
 * @param windowMs - time window in milliseconds
 * @throws Error if rate limit exceeded
 */
export function checkRateLimit(
  userId: string,
  limit: number = 10,
  windowMs: number = 60000
): void {
  const now = Date.now();
  const userLimit = rateLimits.get(userId);

  // no existing limit or window has reset
  if (!userLimit || now > userLimit.resetAt) {
    rateLimits.set(userId, { count: 1, resetAt: now + windowMs });
    return;
  }

  // check if limit exceeded
  if (userLimit.count >= limit) {
    const resetInSeconds = Math.ceil((userLimit.resetAt - now) / 1000);
    throw new Error(
      `rate limit exceeded. try again in ${resetInSeconds} seconds`
    );
  }

  // increment count
  userLimit.count++;
}

/**
 * clears rate limit for a user (useful for testing)
 */
export function clearRateLimit(userId: string): void {
  rateLimits.delete(userId);
}

/**
 * clears all rate limits (useful for testing)
 */
export function clearAllRateLimits(): void {
  rateLimits.clear();
}
