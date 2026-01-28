import { describe, it, expect } from "vitest";
import {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  ExternalServiceError,
  DatabaseError,
} from "@/lib/api/errors";

describe("ApiError", () => {
  it("stores code, message, status, details, and hint", () => {
    const err = new ApiError("TEST", "test message", 418, "details", "hint");
    expect(err.code).toBe("TEST");
    expect(err.message).toBe("test message");
    expect(err.status).toBe(418);
    expect(err.details).toBe("details");
    expect(err.hint).toBe("hint");
    expect(err.name).toBe("ApiError");
  });

  it("defaults to status 500", () => {
    const err = new ApiError("ERR", "msg");
    expect(err.status).toBe(500);
  });

  it("is an instance of Error", () => {
    const err = new ApiError("ERR", "msg");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("ValidationError", () => {
  it("has status 400 and VALIDATION_ERROR code", () => {
    const err = new ValidationError("bad input");
    expect(err.status).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.name).toBe("ValidationError");
  });
});

describe("AuthenticationError", () => {
  it("defaults message to 'authentication required'", () => {
    const err = new AuthenticationError();
    expect(err.message).toBe("authentication required");
    expect(err.status).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
  });

  it("accepts custom message", () => {
    const err = new AuthenticationError("token expired");
    expect(err.message).toBe("token expired");
  });
});

describe("AuthorizationError", () => {
  it("has status 403", () => {
    const err = new AuthorizationError();
    expect(err.status).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
    expect(err.message).toBe("insufficient permissions");
  });
});

describe("NotFoundError", () => {
  it("includes resource name in message", () => {
    const err = new NotFoundError("session");
    expect(err.message).toBe("session not found");
    expect(err.status).toBe(404);
  });

  it("includes id in details when provided", () => {
    const err = new NotFoundError("session", "abc123");
    expect(err.details).toBe("session with id abc123");
  });

  it("has no details when id is omitted", () => {
    const err = new NotFoundError("session");
    expect(err.details).toBeUndefined();
  });
});

describe("ConflictError", () => {
  it("has status 409", () => {
    const err = new ConflictError("already exists");
    expect(err.status).toBe(409);
    expect(err.code).toBe("CONFLICT");
  });
});

describe("ExternalServiceError", () => {
  it("includes service name and hint", () => {
    const err = new ExternalServiceError("elevenlabs");
    expect(err.message).toBe("error communicating with elevenlabs");
    expect(err.status).toBe(503);
    expect(err.hint).toBe("please try again later");
  });
});

describe("DatabaseError", () => {
  it("includes operation name and hint", () => {
    const err = new DatabaseError("create session");
    expect(err.message).toBe("database error during create session");
    expect(err.status).toBe(503);
    expect(err.hint).toBe("please try again later");
  });
});
