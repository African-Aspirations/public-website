/**
 * firebase-admin 14 calls google-auth-library's deprecated `fromJSON` internally, which
 * prints a deprecation notice on the first token exchange. It's inside the SDK, not our
 * code, and harmless; drop exactly that one message. Remove when firebase-admin updates.
 */
const warn = console.warn;
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].startsWith("The `fromJSON` method is deprecated"))
    return;
  warn(...args);
};
