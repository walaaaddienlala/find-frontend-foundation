import type { AgentReply } from "../agent/types";
import {
  formatReplyForWhatsApp,
  parseInboundMessages,
  verifyChallenge,
  verifySignature,
  type ChannelProvider,
  type WhatsAppConfig,
} from "./whatsapp";

/**
 * Framework-free webhook logic (injected dependencies) so it is unit-tested
 * without a server. IMPLEMENTED. Behaviour:
 *  - not configured            -> 503 (inert)
 *  - bad/missing signature      -> 401, nothing processed
 *  - valid                      -> 200 always (Meta retries on errors); each text
 *    message runs through the SAME agent as the website, as a signed-out guest
 *  - duplicates (same message id) and rate-limited senders are skipped
 * Not implemented: account linking/consent (needs a migration), proactive
 * reminders, media, human handoff queue.
 */
export type WebhookDeps = {
  config: WhatsAppConfig | null;
  provider: ChannelProvider | null;
  runTurn(message: string): Promise<AgentReply>;
  rateLimiter: { check(key: string): { allowed: boolean } };
  seenMessageIds: Set<string>;
};

export type HandlerResponse = { status: number; body: string };

const MAX_SEEN = 5000;

export function handleWebhookGet(
  params: { mode: string | null; token: string | null; challenge: string | null },
  deps: Pick<WebhookDeps, "config">,
): HandlerResponse {
  if (!deps.config) return { status: 503, body: "not_configured" };

  const result = verifyChallenge(params, deps.config.verifyToken);

  return result.ok ? { status: 200, body: result.challenge } : { status: 403, body: "forbidden" };
}

export async function handleWebhookPost(
  rawBody: string,
  signatureHeader: string | null,
  deps: WebhookDeps,
): Promise<HandlerResponse> {
  if (!deps.config || !deps.provider) return { status: 503, body: "not_configured" };
  if (!verifySignature(rawBody, signatureHeader, deps.config.appSecret)) {
    return { status: 401, body: "invalid_signature" };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return { status: 400, body: "invalid_json" };
  }

  let replied = 0;

  for (const message of parseInboundMessages(payload)) {
    if (deps.seenMessageIds.has(message.id)) continue;
    deps.seenMessageIds.add(message.id);
    if (deps.seenMessageIds.size > MAX_SEEN) {
      deps.seenMessageIds.delete(deps.seenMessageIds.values().next().value as string);
    }

    if (message.type !== "text" || !message.text) continue;
    if (!deps.rateLimiter.check(`wa:${message.from}`).allowed) continue;

    try {
      const reply = await deps.runTurn(message.text.slice(0, 1000));
      const sent = await deps.provider.sendText(message.from, formatReplyForWhatsApp(reply, deps.config.siteUrl));
      if (sent.ok) replied += 1;
    } catch {
      // Never fail the webhook: Meta would retry and duplicate work.
    }
  }

  return { status: 200, body: JSON.stringify({ received: true, replied }) };
}
