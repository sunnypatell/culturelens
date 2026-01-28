import { describe, it, expect, vi, beforeEach } from "vitest";
import { clientLogger } from "@/lib/client-logger";

describe("clientLogger", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("has info, warn, error, and debug methods", () => {
    expect(typeof clientLogger.info).toBe("function");
    expect(typeof clientLogger.warn).toBe("function");
    expect(typeof clientLogger.error).toBe("function");
    expect(typeof clientLogger.debug).toBe("function");
  });

  describe("warn and error always log", () => {
    it("warn calls console.warn", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
      clientLogger.warn("warning msg");
      expect(spy).toHaveBeenCalledOnce();
    });

    it("error calls console.error", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      clientLogger.error("error msg");
      expect(spy).toHaveBeenCalledOnce();
    });
  });

  describe("debug in development", () => {
    it("logs when NODE_ENV is development", () => {
      const original = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";
      const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
      clientLogger.debug("debug msg");
      expect(spy).toHaveBeenCalledOnce();
      process.env.NODE_ENV = original;
    });

    it("does not log when NODE_ENV is production", () => {
      const original = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
      clientLogger.debug("debug msg");
      expect(spy).not.toHaveBeenCalled();
      process.env.NODE_ENV = original;
    });
  });

  describe("info in development", () => {
    it("logs when NODE_ENV is development", () => {
      const original = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";
      const spy = vi.spyOn(console, "log").mockImplementation(() => {});
      clientLogger.info("info msg");
      expect(spy).toHaveBeenCalledOnce();
      process.env.NODE_ENV = original;
    });

    it("does not log when NODE_ENV is production", () => {
      const original = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      const spy = vi.spyOn(console, "log").mockImplementation(() => {});
      clientLogger.info("info msg");
      expect(spy).not.toHaveBeenCalled();
      process.env.NODE_ENV = original;
    });
  });
});
