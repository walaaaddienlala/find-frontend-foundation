import { NextResponse } from "next/server";

import { runAgentTurn } from "@/lib/agent/orchestrator";
import { createRateLimiter } from "@/lib/agent/rate-limit";
import { clientKey, isSameOrigin, parseChatRequest } from "@/lib/agent/request";
import { createAgentTools } from "@/lib/agent/server/tools";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Find Chatbot API. POST { message } -> { reply }. Read-only agent; no message
 * content is logged or stored (conversation persistence needs migration 005/010).
 * Rate limiting is in-memory and per instance (best-effort; see architecture doc).
 */
export const dynamic = "force-dynamic";

const guestLimiter = createRateLimiter({ limit: 15, windowMs: 60_000 });
const userLimiter = createRateLimiter({ limit: 30, windowMs: 60_000 });

const headers = { "Cache-Control": "no-store" };

/** The endpoint is off unless the chatbot is enabled (same build-time flag as the widget). */
const CHATBOT_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CHATBOT === "true";

export async function POST(request: Request) {
  if (!CHATBOT_ENABLED) {
    return NextResponse.json({ error: "Not found." }, { status: 404, headers });
  }

  if (!isSameOrigin(request.headers.get("origin"), request.headers.get("host"))) {
    return NextResponse.json({ error: "Cross-origin requests are not allowed." }, { status: 403, headers });
  }

  const parsed = parseChatRequest(await request.text());
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status, headers });
  }

  let userId: string | null = null;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
    } catch {
      userId = null;
    }
  }

  const limiter = userId ? userLimiter : guestLimiter;
  const limit = limiter.check(userId ? `user:${userId}` : clientKey(request.headers.get("x-forwarded-for")));

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "You’re sending messages too quickly. Please wait a moment." },
      { status: 429, headers: { ...headers, "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const session = { userId };
  const reply = await runAgentTurn({ message: parsed.message, session, tools: createAgentTools(session) });

  return NextResponse.json({ reply }, { headers });
}
