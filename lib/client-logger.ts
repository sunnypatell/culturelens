/**
 * lightweight client-side logger for browser environments.
 * mirrors the pino logger API surface but uses console under the hood.
 * provides structured context and consistent formatting.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

function formatMessage(
  level: LogLevel,
  msg: string,
  ...args: unknown[]
): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  if (args.length > 0) {
    const extra = args
      .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
      .join(" ");
    return `${prefix} ${msg} ${extra}`;
  }
  return `${prefix} ${msg}`;
}

export const clientLogger = {
  debug(msg: string, ...args: unknown[]) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.debug(formatMessage("debug", msg, ...args));
    }
  },

  info(msg: string, ...args: unknown[]) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log(formatMessage("info", msg, ...args));
    }
  },

  warn(msg: string, ...args: unknown[]) {
    // eslint-disable-next-line no-console
    console.warn(formatMessage("warn", msg, ...args));
  },

  error(msg: string, ...args: unknown[]) {
    // eslint-disable-next-line no-console
    console.error(formatMessage("error", msg, ...args));
  },
};
