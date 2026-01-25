// API middleware utilities for logging, auth, etc.

import { NextRequest } from "next/server";

/**
 * request ID for tracking requests across logs
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * logs API request details
 */
export function logRequest(
  request: NextRequest,
  options?: {
    requestId?: string;
    userId?: string;
  }
): void {
  const { requestId, userId } = options || {};
  const { method, url } = request;

  console.log(`[API Request]`, {
    requestId,
    method,
    url,
    userId,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get("user-agent"),
    ip:
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip"),
  });
}

/**
 * logs API response details
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
  const { requestId, durationMs } = options || {};
  const { method, url } = request;

  console.log(`[API Response]`, {
    requestId,
    method,
    url,
    status: response.status,
    success: response.success,
    durationMs,
    timestamp: new Date().toISOString(),
  });
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
