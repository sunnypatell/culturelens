// structured JSON logger using pino
// replaces console.log with structured, leveled, parseable output

import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  ...(isDevelopment && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  }),
  ...(isProduction && {
    formatters: {
      level: (label: string) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }),
  base: {
    service: "culturelens",
    env: process.env.NODE_ENV || "development",
  },
});

/**
 * creates a child logger with request context
 * use at the top of API route handlers:
 *
 * ```ts
 * const log = createRequestLogger("POST", "/api/sessions");
 * log.info({ userId }, "creating session");
 * ```
 */
export function createRequestLogger(method: string, path: string) {
  return logger.child({
    method,
    path,
    requestId: crypto.randomUUID(),
  });
}

/**
 * logs API request duration
 */
export function logRequestDuration(
  log: pino.Logger,
  startTime: number,
  statusCode: number
) {
  const durationMs = Date.now() - startTime;
  log.info({ durationMs, statusCode }, "request completed");
}

export default logger;
