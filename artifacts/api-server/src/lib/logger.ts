type LogLevel = "debug" | "info" | "warn" | "error";
type LogContext = Record<string, unknown>;
type LogInput = LogContext | string;

const REDACTED_KEY = /authorization|cookie|password|secret|token/i;
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function configuredLogLevel(): LogLevel {
  const level = process.env.LOG_LEVEL?.toLowerCase();
  return level === "debug" || level === "warn" || level === "error"
    ? level
    : "info";
}

function serialize(
  value: unknown,
  seen = new WeakSet<object>(),
  depth = 0,
): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (typeof value === "bigint") return value.toString();
  if (value === null || typeof value !== "object") return value;
  if (depth >= 6) return "[Max depth]";
  if (seen.has(value)) return "[Circular]";

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => serialize(item, seen, depth + 1));
  }

  const serialized: Record<string, unknown> = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    serialized[key] = REDACTED_KEY.test(key)
      ? "[Redacted]"
      : serialize(nestedValue, seen, depth + 1);
  }
  return serialized;
}

function writeLog(
  level: LogLevel,
  input: LogInput,
  message?: string,
): void {
  if (LOG_LEVELS[level] < LOG_LEVELS[configuredLogLevel()]) return;

  const context = typeof input === "string" ? {} : serialize(input);
  const logMessage = typeof input === "string" ? input : (message ?? "");
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message: logMessage,
    ...(context as LogContext),
  });

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else if (level === "debug") {
    console.debug(line);
  } else {
    console.info(line);
  }
}

export const logger = {
  debug: (input: LogInput, message?: string) => writeLog("debug", input, message),
  info: (input: LogInput, message?: string) => writeLog("info", input, message),
  warn: (input: LogInput, message?: string) => writeLog("warn", input, message),
  error: (input: LogInput, message?: string) => writeLog("error", input, message),
};
