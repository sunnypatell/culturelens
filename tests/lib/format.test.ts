import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  formatRelativeDate,
  formatDuration,
  parseCreatedAt,
} from "@/lib/format";

describe("formatRelativeDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for less than an hour ago", () => {
    const date = new Date("2025-06-15T11:30:00Z");
    expect(formatRelativeDate(date)).toBe("just now");
  });

  it("returns hours ago for 1-23 hours", () => {
    const date = new Date("2025-06-15T09:00:00Z");
    expect(formatRelativeDate(date)).toBe("3 hours ago");
  });

  it("returns short hours format", () => {
    const date = new Date("2025-06-15T09:00:00Z");
    expect(formatRelativeDate(date, { short: true })).toBe("3h ago");
  });

  it("returns 'yesterday' for exactly 1 day ago", () => {
    const date = new Date("2025-06-14T12:00:00Z");
    expect(formatRelativeDate(date)).toBe("yesterday");
  });

  it("returns days ago for 2-6 days", () => {
    const date = new Date("2025-06-12T12:00:00Z");
    expect(formatRelativeDate(date)).toBe("3 days ago");
  });

  it("returns short days format", () => {
    const date = new Date("2025-06-12T12:00:00Z");
    expect(formatRelativeDate(date, { short: true })).toBe("3d ago");
  });

  it("returns weeks ago for 7+ days", () => {
    const date = new Date("2025-06-01T12:00:00Z");
    expect(formatRelativeDate(date)).toBe("2 weeks ago");
  });

  it("returns singular week", () => {
    const date = new Date("2025-06-08T12:00:00Z");
    expect(formatRelativeDate(date)).toBe("1 week ago");
  });

  it("returns days in short mode even for 7+ days", () => {
    const date = new Date("2025-06-01T12:00:00Z");
    expect(formatRelativeDate(date, { short: true })).toBe("14d ago");
  });

  it("returns months as weeks in long mode", () => {
    const date = new Date("2025-04-15T12:00:00Z");
    // 61 days = 8 weeks
    expect(formatRelativeDate(date)).toBe("8 weeks ago");
  });
});

describe("formatDuration", () => {
  it("formats zero milliseconds", () => {
    expect(formatDuration(0)).toBe("0:00");
  });

  it("formats seconds only", () => {
    expect(formatDuration(5000)).toBe("0:05");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(125000)).toBe("2:05");
  });

  it("formats hours, minutes and seconds", () => {
    expect(formatDuration(3661000)).toBe("1:01:01");
  });

  it("pads minutes and seconds in hour format", () => {
    expect(formatDuration(3600000)).toBe("1:00:00");
  });
});

describe("parseCreatedAt", () => {
  it("parses an ISO date string", () => {
    const result = parseCreatedAt("2025-01-15T10:00:00Z");
    expect(result.toISOString()).toBe("2025-01-15T10:00:00.000Z");
  });

  it("parses a Firestore timestamp object", () => {
    const result = parseCreatedAt({ _seconds: 1700000000 });
    expect(result.getTime()).toBe(1700000000 * 1000);
  });

  it("returns current date for undefined", () => {
    const before = Date.now();
    const result = parseCreatedAt(undefined);
    const after = Date.now();
    expect(result.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.getTime()).toBeLessThanOrEqual(after);
  });

  it("returns current date for null", () => {
    const before = Date.now();
    const result = parseCreatedAt(null);
    const after = Date.now();
    expect(result.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.getTime()).toBeLessThanOrEqual(after);
  });

  it("returns current date for invalid string", () => {
    const before = Date.now();
    const result = parseCreatedAt("not-a-date");
    const after = Date.now();
    expect(result.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.getTime()).toBeLessThanOrEqual(after);
  });
});
