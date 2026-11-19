# WhatsApp Integration — Instructions and Status

**Status: architecture only; NOT live.** Never tested against Meta. It needs a Meta app, a verified business number, credentials, a public HTTPS URL and an end-to-end test.

## What exists
- `lib/channels/whatsapp.ts`: challenge handshake, `X-Hub-Signature-256` HMAC check (constant time, raw body), payload normalisation, reply formatting (absolute links, 3,500-char cap), Graph API sender behind the `ChannelProvider` interface.
- `lib/channels/whatsapp-handler.ts`: framework-free webhook logic (unit-tested with fakes).
- `app/api/webhooks/whatsapp/route.ts`: the endpoint. **Returns 503 until every variable below is set.**

## Behaviour
Unsigned/badly signed requests → 401, nothing processed. Valid → always 200 (Meta retries otherwise). Text messages run through the same read-only agent **as a signed-out guest**; duplicates (same message id) and senders over 10 msgs/min are skipped; provider failures never fail the webhook. Non-text messages are ignored.

## Not implemented
Account linking and consent records (need a migration, so WhatsApp is guest-only: no application status, no private data), proactive reminders/notifications (need linking + notification delivery + approved templates + opt-in), human handoff, media, Telegram/other channels. In-memory dedupe/rate limits are per instance.

## Setup (when you are ready)
1. Create a Meta app with WhatsApp; register and verify a business number.
2. Set **server-only** env vars (never `NEXT_PUBLIC_*`): `WHATSAPP_VERIFY_TOKEN` (your own random string), `WHATSAPP_APP_SECRET`, `WHATSAPP_ACCESS_TOKEN` (prefer a system-user token), `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_GRAPH_VERSION` (**confirm the current version in Meta's docs**; deliberately not defaulted), `WHATSAPP_SITE_URL` (public https origin used for links).
3. Deploy, then register the webhook `https://<your-domain>/api/webhooks/whatsapp` with the same verify token; subscribe to `messages`.
4. Send a test message from a phone. Confirm: signature accepted, reply delivered, no secrets/phone numbers in logs.
5. Before enabling any proactive messaging: consent flow, opt-out handling, approved templates, 24-hour-window rules and a policy review.
