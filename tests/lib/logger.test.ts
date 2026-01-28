import { describe, it, expect } from "vitest";
import { logger, createRequestLogger } from "@/lib/logger";

describe("logger", () => {
  it("is a pino logger instance", () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.warn).toBe("function");
  });

  it("has the culturelens service base binding", () => {
    // pino stores base bindings in logger.bindings()
    const bindings = logger.bindings();
    expect(bindings.service).toBe("culturelens");
  });
});

describe("createRequestLogger", () => {
  it("returns a child logger with method and path", () => {
    const child = createRequestLogger("GET", "/api/test");
    const bindings = child.bindings();
    expect(bindings.method).toBe("GET");
    expect(bindings.path).toBe("/api/test");
  });

  it("includes a requestId", () => {
    const child = createRequestLogger("POST", "/api/sessions");
    const bindings = child.bindings();
    expect(bindings.requestId).toBeDefined();
    expect(typeof bindings.requestId).toBe("string");
  });
});
