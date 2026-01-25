// unified API response handlers for consistent response formatting

import { NextResponse } from "next/server";

/**
 * standard success response envelope
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

/**
 * standard error response envelope
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
    hint?: string;
  };
}

/**
 * creates a standardized success response
 */
export function apiSuccess<T>(
  data: T,
  options?: {
    message?: string;
    meta?: Record<string, unknown>;
    status?: number;
  }
): NextResponse<ApiSuccessResponse<T>> {
  const { message, meta, status = 200 } = options || {};

  return NextResponse.json(
    {
      success: true as const,
      data,
      ...(message && { message }),
      ...(meta && { meta }),
    },
    { status }
  );
}

/**
 * creates a standardized error response
 */
export function apiError(
  code: string,
  message: string,
  options?: {
    details?: string;
    hint?: string;
    status?: number;
  }
): NextResponse<ApiErrorResponse> {
  const { details, hint, status = 500 } = options || {};

  // log error for debugging (development only)
  if (process.env.NODE_ENV !== "production") {
    console.error(`[API Error ${status}] ${code}: ${message}`, {
      details,
      hint,
    });
  }

  return NextResponse.json(
    {
      success: false as const,
      error: {
        code,
        message,
        ...(details && { details }),
        ...(hint && { hint }),
      },
    },
    { status }
  );
}

/**
 * common error responses
 */
export const ApiErrors = {
  // 400 errors
  badRequest: (message: string, details?: string) =>
    apiError("BAD_REQUEST", message, { status: 400, details }),

  validationError: (message: string, details?: string) =>
    apiError("VALIDATION_ERROR", message, { status: 400, details }),

  // 401 errors
  unauthorized: (message = "authentication required") =>
    apiError("UNAUTHORIZED", message, { status: 401 }),

  invalidToken: (message = "invalid or expired token") =>
    apiError("INVALID_TOKEN", message, { status: 401 }),

  // 403 errors
  forbidden: (message = "insufficient permissions") =>
    apiError("FORBIDDEN", message, { status: 403 }),

  // 404 errors
  notFound: (resource: string, id?: string) =>
    apiError("NOT_FOUND", `${resource} not found`, {
      status: 404,
      details: id ? `${resource} with id ${id}` : undefined,
    }),

  // 409 errors
  conflict: (message: string, details?: string) =>
    apiError("CONFLICT", message, { status: 409, details }),

  // 500 errors
  internal: (message = "internal server error", details?: string) =>
    apiError("INTERNAL_ERROR", message, { status: 500, details }),

  // 503 errors
  serviceUnavailable: (service: string, details?: string) =>
    apiError("SERVICE_UNAVAILABLE", `${service} is currently unavailable`, {
      status: 503,
      details,
      hint: "please try again later",
    }),

  databaseError: (operation: string, details?: string) =>
    apiError("DATABASE_ERROR", `database error during ${operation}`, {
      status: 503,
      details,
      hint: "please try again later",
    }),

  externalServiceError: (service: string, details?: string) =>
    apiError("EXTERNAL_SERVICE_ERROR", `error communicating with ${service}`, {
      status: 503,
      details,
      hint: "please try again later",
    }),
} as const;
