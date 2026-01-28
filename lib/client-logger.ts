/**
 * lightweight client-side logger for browser environments.
 * mirrors the pino logger API surface but uses console under the hood.
 * provides structured context and consistent formatting.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

function formatMessage(
  level: LogLevel,
  msg: string,
  context?: LogContext
): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  if (context && Object.keys(context).length > 0) {
    return `${prefix} ${msg} ${JSON.stringify(context)}`;
  }
  return `${prefix} ${msg}`;
}

export const clientLogger = {
  debug(msg: string, context?: LogContext) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.debug(formatMessage("debug", msg, context));
    }
  },

  info(msg: string, context?: LogContext) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log(formatMessage("info", msg, context));
    }
  },

  warn(msg: string, context?: LogContext) {
    // eslint-disable-next-line no-console
    console.warn(formatMessage("warn", msg, context));
  },

  error(msg: string, context?: LogContext) {
    // eslint-disable-next-line no-console
    console.error(formatMessage("error", msg, context));
  },
};
