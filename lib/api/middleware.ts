// API middleware utilities for logging, auth, etc.

import { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

/**
 * request ID for tracking requests across logs
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * logs API request details (development only)
 */
export function logRequest(
  request: NextRequest,
  options?: {
    requestId?: string;
    userId?: string;
  }
): void {
  if (process.env.NODE_ENV !== "production") {
    const { requestId, userId } = options || {};
    const { method, url } = request;

    logger.info(
      {
        requestId,
        method,
        url,
        userId,
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get("user-agent"),
        ip:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip"),
      },
      `[API Request]`
    );
  }
}

/**
 * logs API response details (development only)
 */
export function logResponse(
  request: NextRequest,
  response: {
    status: number;
    success: boolean;
  },
  options?: {
    requestId?: string;
    durationMs?: number;
  }
): void {
  if (process.env.NODE_ENV !== "production") {
    const { requestId, durationMs } = options || {};
    const { method, url } = request;

    logger.info(
      {
        requestId,
        method,
        url,
        status: response.status,
        success: response.success,
        durationMs,
        timestamp: new Date().toISOString(),
      },
      `[API Response]`
    );
  }
}

/**
 * extracts bearer token from authorization header
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * extracts session ID from request (from headers or cookies)
 */
export function extractSessionId(request: NextRequest): string | null {
  // try header first
  const headerSessionId = request.headers.get("x-session-id");
  if (headerSessionId) {
    return headerSessionId;
  }

  // try cookie
  const cookieSessionId = request.cookies.get("sessionId")?.value;
  return cookieSessionId || null;
}
