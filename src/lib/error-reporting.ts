export function reportAppError(error: unknown, context: Record<string, unknown> = {}) {
  const normalizedError = error instanceof Error ? error : new Error(String(error));
  const payload = {
    message: normalizedError.message,
    stack: normalizedError.stack,
    context,
    route: typeof window !== "undefined" ? window.location.pathname : "server",
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    console.error("[App Error]", payload);
  } else {
    console.error("[App Error]", payload);
  }
}
