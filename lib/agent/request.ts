/** Request validation for the chat endpoint. IMPLEMENTED (pure, tested). */
export const MAX_MESSAGE_LENGTH = 1000;
export const MAX_BODY_BYTES = 4096;

export type ChatRequestResult =
  | { ok: true; message: string }
  | { ok: false; status: 400 | 413; error: string };

export function parseChatRequest(rawBody: string): ChatRequestResult {
  if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: "Request is too large." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return { ok: false, status: 400, error: "Request body must be valid JSON." };
  }

  const message = (parsed as { message?: unknown } | null)?.message;

  if (typeof message !== "string") {
    return { ok: false, status: 400, error: "A text message is required." };
  }

  const trimmed = message.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();

  if (trimmed.length === 0) return { ok: false, status: 400, error: "Message cannot be empty." };
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, status: 400, error: `Message is longer than ${MAX_MESSAGE_LENGTH} characters.` };
  }

  return { ok: true, message: trimmed };
}

/** Browsers send Origin on cross-site POSTs; reject when present and not matching the host. */
export function isSameOrigin(origin: string | null, host: string | null): boolean {
  if (!origin) return true;
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * First hop of x-forwarded-for as a rate-limit key; anything that does not look
 * like an IP address becomes "ip:unknown". NOTE: x-forwarded-for is only
 * trustworthy behind a proxy that overwrites it (e.g. the hosting platform).
 */
export function clientKey(forwardedFor: string | null): string {
  const first = (forwardedFor ?? "").split(",")[0]?.trim() ?? "";
  const looksLikeIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(first) || /^[0-9a-fA-F:]*:[0-9a-fA-F:.]*$/.test(first);

  return looksLikeIp && first.length <= 45 ? `ip:${first}` : "ip:unknown";
}
