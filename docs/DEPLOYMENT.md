# Deployment Notes

## Environment variables (see `.env.example`; never commit real values)
| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | browser-safe | Supabase. Never put a service-role key in any `NEXT_PUBLIC_*` variable. |
| `NEXT_PUBLIC_ENABLE_SCAFFOLD_PAGES` | build-time | Shows scaffold pages (preview environments only). |
| `NEXT_PUBLIC_ENABLE_CHATBOT` | build-time | Enables the widget and `/api/chat`. |
| `WHATSAPP_*` (6 vars) | server-only | WhatsApp webhook; 503 until all are set. |
`NEXT_PUBLIC_*` flags are inlined at **build time**: changing them requires a rebuild.

## Checklist
1. `pnpm install --frozen-lockfile`; `pnpm typecheck`; `pnpm test:phase1-all`; `pnpm build` (needs access to Google Fonts for `next/font`).
2. Run both preflight SQL files, review, then apply proposed migrations one at a time on staging first (`supabase/migrations-drafts/proposed/000_README.md`). **No migration has been applied.**
3. Use a shared rate-limit store before relying on rate limits in production.
4. Keep scaffold pages off in production.
5. Rotate the Supabase publishable key if the original `.env.local` was ever shared.
