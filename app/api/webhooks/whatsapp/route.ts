import { runAgentTurn } from "@/lib/agent/orchestrator";
import { createRateLimiter } from "@/lib/agent/rate-limit";
import { createAgentTools } from "@/lib/agent/server/tools";
import { createWhatsAppProvider, readWhatsAppConfig } from "@/lib/channels/whatsapp";
import { handleWebhookGet, handleWebhookPost } from "@/lib/channels/whatsapp-handler";

/**
 * WhatsApp Business webhook. INERT until all WHATSAPP_* variables are set
 * (returns 503). Messages run through the same read-only agent as signed-out guests.
 * NOT verified end to end: needs a Meta app, number, credentials and a public URL.
 */
export const dynamic = "force-dynamic";

const rateLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 });
const seenMessageIds = new Set<string>();

function deps() {
  const config = readWhatsAppConfig(process.env);

  return {
    config,
    provider: config ? createWhatsAppProvider(config) : null,
    runTurn: (message: string) =>
      runAgentTurn({ message, session: { userId: null }, tools: createAgentTools({ userId: null }) }),
    rateLimiter,
    seenMessageIds,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const result = handleWebhookGet(
    {
      mode: url.searchParams.get("hub.mode"),
      token: url.searchParams.get("hub.verify_token"),
      challenge: url.searchParams.get("hub.challenge"),
    },
    deps(),
  );

  return new Response(result.body, { status: result.status, headers: { "Content-Type": "text/plain" } });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const result = await handleWebhookPost(rawBody, request.headers.get("x-hub-signature-256"), deps());

  return new Response(result.body, { status: result.status, headers: { "Content-Type": "application/json" } });
}
