// custom error classes for API error handling

/**
 * base API error class
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 500,
    public details?: string,
    public hint?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * validation error (400)
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: string) {
    super("VALIDATION_ERROR", message, 400, details);
    this.name = "ValidationError";
  }
}

/**
 * authentication error (401)
 */
export class AuthenticationError extends ApiError {
  constructor(message = "authentication required", details?: string) {
    super("UNAUTHORIZED", message, 401, details);
    this.name = "AuthenticationError";
  }
}

/**
 * authorization error (403)
 */
export class AuthorizationError extends ApiError {
  constructor(message = "insufficient permissions", details?: string) {
    super("FORBIDDEN", message, 403, details);
    this.name = "AuthorizationError";
  }
}

/**
 * resource not found error (404)
 */
export class NotFoundError extends ApiError {
  constructor(resource: string, id?: string) {
    super(
      "NOT_FOUND",
      `${resource} not found`,
      404,
      id ? `${resource} with id ${id}` : undefined
    );
    this.name = "NotFoundError";
  }
}

/**
 * conflict error (409)
 */
export class ConflictError extends ApiError {
  constructor(message: string, details?: string) {
    super("CONFLICT", message, 409, details);
    this.name = "ConflictError";
  }
}

/**
 * external service error (503)
 */
export class ExternalServiceError extends ApiError {
  constructor(service: string, details?: string) {
    super(
      "EXTERNAL_SERVICE_ERROR",
      `error communicating with ${service}`,
      503,
      details,
      "please try again later"
    );
    this.name = "ExternalServiceError";
  }
}

/**
 * database error (503)
 */
export class DatabaseError extends ApiError {
  constructor(operation: string, details?: string) {
    super(
      "DATABASE_ERROR",
      `database error during ${operation}`,
      503,
      details,
      "please try again later"
    );
    this.name = "DatabaseError";
  }
}
