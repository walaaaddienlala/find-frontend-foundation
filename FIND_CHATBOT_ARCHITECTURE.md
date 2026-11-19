# Find Chatbot — Architecture

## Layers
```
Browser widget (components/chat/chat-widget.tsx)
   └─ POST /api/chat  (app/api/chat/route.ts)
        ├─ flag check (NEXT_PUBLIC_ENABLE_CHATBOT=true, else 404)
        ├─ same-origin → body parse/validate → identify user (Supabase cookie session)
        ├─ rate limit (user: 30/min, guest: 15/min)
        └─ runAgentTurn(...)  → AgentReply { text, cards, links, suggestions, grounded, requiresSignIn, handoff }
WhatsApp webhook (app/api/webhooks/whatsapp/route.ts) → same agent, guest-only (see WHATSAPP_INTEGRATION.md)
```

## Enabling
Set `NEXT_PUBLIC_ENABLE_CHATBOT=true` **at build time**. Off by default: the widget is not rendered and `/api/chat` returns 404. Whether it should default on at launch is a product decision.

## Widget behaviour (implemented)
Floating button; dialog with Escape-to-close, labelled controls, `aria-live` transcript, typing indicator; starter prompts; opportunity cards linking to Find pages; suggestion chips; retry on error; new conversation; hidden on `/admin`. The transcript lives in this browser tab only (`sessionStorage`). **Verified by typecheck, build and API probes; not exercised in a real browser.**

## Privacy
No message content is logged or stored server-side. Signed-out visitors receive public information only; a sign-in prompt is returned for private requests. The bot never asks for passwords, OTPs or payment details.

## Not implemented
Server-side history (needs a conversations migration), feedback buttons (need storage), file upload (needs the document vault), human-support handoff (no support channel exists: the bot says the request was **not** sent), admin conversation management/analytics/knowledge sources, Arabic/RTL copy.
