// unified API route handler wrapper with error handling

import { NextResponse } from "next/server";
import { ApiError } from "./errors";
import { apiError } from "./responses";

/**
 * wraps API route handlers with unified error handling
 * automatically catches and formats errors
 */
export function apiHandler<T = unknown>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T>> {
  return handler().catch((error: unknown) => {
    // handle custom API errors
    if (error instanceof ApiError) {
      return apiError(error.code, error.message, {
        status: error.status,
        details: error.details,
        hint: error.hint,
      }) as NextResponse<T>;
    }

    // handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : "unknown error";
    console.error("[Unexpected API Error]", error);

    return apiError("INTERNAL_ERROR", "an unexpected error occurred", {
      status: 500,
      details: errorMessage,
    }) as NextResponse<T>;
  });
}

/**
 * type helper for API route handlers
 */
export type ApiRouteHandler<T = unknown> = () => Promise<NextResponse<T>>;
