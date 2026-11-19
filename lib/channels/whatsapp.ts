import { createHmac, timingSafeEqual } from "node:crypto";

import type { AgentReply } from "../agent/types";

/**
 * WhatsApp Business Cloud API building blocks. IMPLEMENTED as pure, tested
 * functions (webhook challenge, HMAC signature check, payload normalisation,
 * reply formatting) plus a provider that calls the Graph API. The integration is
 * NOT live: it needs a Meta app, a verified business number, credentials,
 * a public HTTPS webhook and an end-to-end test (see docs/WHATSAPP_INTEGRATION.md).
 */
export type WhatsAppConfig = {
  verifyToken: string;
  appSecret: string;
  accessToken: string;
  phoneNumberId: string;
  graphVersion: string;
  siteUrl: string;
};

/** All six values are required. The Graph API version is intentionally not defaulted: confirm the current version in Meta's docs. */
export function readWhatsAppConfig(env: Record<string, string | undefined>): WhatsAppConfig | null {
  const config = {
    verifyToken: env.WHATSAPP_VERIFY_TOKEN,
    appSecret: env.WHATSAPP_APP_SECRET,
    accessToken: env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
    graphVersion: env.WHATSAPP_GRAPH_VERSION,
    siteUrl: env.WHATSAPP_SITE_URL,
  };

  if (Object.values(config).some((value) => !value)) return null;
  if (!/^https?:\/\//.test(config.siteUrl as string)) return null;
  if (!/^v\d+\.\d+$/.test(config.graphVersion as string)) return null;

  return { ...(config as WhatsAppConfig), siteUrl: (config.siteUrl as string).replace(/\/+$/, "") };
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && timingSafeEqual(left, right);
}

/** GET handshake: echo the challenge only when mode and token match. */
export function verifyChallenge(
  params: { mode: string | null; token: string | null; challenge: string | null },
  expectedToken: string,
): { ok: true; challenge: string } | { ok: false } {
  if (params.mode === "subscribe" && params.token && params.challenge && safeEqual(params.token, expectedToken)) {
    return { ok: true, challenge: params.challenge };
  }

  return { ok: false };
}

/** Validates `X-Hub-Signature-256: sha256=<hex>` against the RAW request body. */
export function verifySignature(rawBody: string, header: string | null, appSecret: string): boolean {
  if (!header || !header.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");

  return safeEqual(header.slice("sha256=".length), expected);
}

export type InboundMessage = {
  id: string;
  from: string;
  type: string;
  text: string | null;
};

export function parseInboundMessages(payload: unknown): InboundMessage[] {
  const out: InboundMessage[] = [];
  const entries = (payload as { entry?: unknown })?.entry;

  if (!Array.isArray(entries)) return out;

  for (const entry of entries) {
    const changes = (entry as { changes?: unknown })?.changes;
    if (!Array.isArray(changes)) continue;

    for (const change of changes) {
      const messages = (change as { value?: { messages?: unknown } })?.value?.messages;
      if (!Array.isArray(messages)) continue;

      for (const message of messages) {
        const m = message as { id?: unknown; from?: unknown; type?: unknown; text?: { body?: unknown } };
        if (typeof m.id !== "string" || typeof m.from !== "string") continue;

        const body = m.type === "text" && typeof m.text?.body === "string" ? m.text.body : null;
        out.push({ id: m.id, from: m.from, type: typeof m.type === "string" ? m.type : "unknown", text: body });
      }
    }
  }

  return out;
}

const MAX_TEXT = 3500;

/** Plain-text rendering of an agent reply with absolute links. */
export function formatReplyForWhatsApp(reply: AgentReply, siteUrl: string): string {
  const absolute = (href: string) => (href.startsWith("http") ? href : `${siteUrl}${href}`);
  const cards = reply.cards.map((card) => `• ${card.title} (${card.organization}): ${absolute(card.href)}`);
  const links = reply.links.map((link) => `${link.label}: ${absolute(link.href)}`);

  return [reply.text, cards.join("\n"), links.join("\n")].filter(Boolean).join("\n\n").slice(0, MAX_TEXT);
}

export type SendResult = { ok: boolean; error?: string };

export interface ChannelProvider {
  sendText(to: string, text: string): Promise<SendResult>;
}

export function createWhatsAppProvider(config: WhatsAppConfig, fetchImpl: typeof fetch = fetch): ChannelProvider {
  return {
    async sendText(to, text) {
      try {
        const response = await fetchImpl(
          `https://graph.facebook.com/${config.graphVersion}/${config.phoneNumberId}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.accessToken}` },
            body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: text } }),
          },
        );

        return response.ok ? { ok: true } : { ok: false, error: `provider_status_${response.status}` };
      } catch {
        return { ok: false, error: "provider_unreachable" };
      }
    },
  };
}
