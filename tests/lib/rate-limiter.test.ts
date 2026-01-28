import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  checkRateLimit,
  clearRateLimit,
  clearAllRateLimits,
} from "@/lib/rate-limiter";

beforeEach(() => {
  clearAllRateLimits();
});

describe("checkRateLimit", () => {
  it("allows requests within the limit", () => {
    expect(() => checkRateLimit("user1", 3, 60000)).not.toThrow();
    expect(() => checkRateLimit("user1", 3, 60000)).not.toThrow();
    expect(() => checkRateLimit("user1", 3, 60000)).not.toThrow();
  });

  it("throws when limit is exceeded", () => {
    checkRateLimit("user1", 2, 60000);
    checkRateLimit("user1", 2, 60000);
    expect(() => checkRateLimit("user1", 2, 60000)).toThrow(
      /rate limit exceeded/
    );
  });

  it("tracks users independently", () => {
    checkRateLimit("user1", 1, 60000);
    expect(() => checkRateLimit("user1", 1, 60000)).toThrow();
    expect(() => checkRateLimit("user2", 1, 60000)).not.toThrow();
  });

  it("resets after window expires", () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    checkRateLimit("user1", 1, 1000);
    expect(() => checkRateLimit("user1", 1, 1000)).toThrow();

    // advance time past window
    vi.spyOn(Date, "now").mockReturnValue(now + 1001);
    expect(() => checkRateLimit("user1", 1, 1000)).not.toThrow();

    vi.restoreAllMocks();
  });

  it("includes reset time in error message", () => {
    checkRateLimit("user1", 1, 30000);
    try {
      checkRateLimit("user1", 1, 30000);
    } catch (e) {
      expect((e as Error).message).toMatch(/try again in \d+ seconds/);
    }
  });
});

describe("clearRateLimit", () => {
  it("clears limit for specific user", () => {
    checkRateLimit("user1", 1, 60000);
    expect(() => checkRateLimit("user1", 1, 60000)).toThrow();

    clearRateLimit("user1");
    expect(() => checkRateLimit("user1", 1, 60000)).not.toThrow();
  });
});

describe("clearAllRateLimits", () => {
  it("clears limits for all users", () => {
    checkRateLimit("user1", 1, 60000);
    checkRateLimit("user2", 1, 60000);

    clearAllRateLimits();

    expect(() => checkRateLimit("user1", 1, 60000)).not.toThrow();
    expect(() => checkRateLimit("user2", 1, 60000)).not.toThrow();
  });
});
