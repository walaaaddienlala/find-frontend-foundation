# Find AI Agent — Architecture (v1: grounded retrieval)

**Status:** v1 is implemented and tested in *grounded-retrieval mode*. **No language model is called.** An LLM provider is "Needs External Configuration".

## Principle
The agent is the orchestration layer; the chatbot (web, WhatsApp) is only an interface to it. Every reply is built from **tool results**, never from model memory, so it cannot fabricate opportunities, deadlines, requirements, funding, achievements or application status.

## Flow
```
message ──▶ detectIntent / detectEntities (rule-based, lib/agent/intent.ts)
        ──▶ authorizeTool(name, session)           (lib/agent/tool-registry.ts)
        ──▶ read-only tool via injected AgentTools (lib/agent/server/tools.ts)
        ──▶ templated reply + cards + links        (lib/agent/orchestrator.ts)
```
`runAgentTurn({ message, session, tools })` is framework-free; dependencies are injected, so it is unit-tested with fakes and reused by every channel.

## Tools (all `readOnly: true`)
| Tool | Access | Source |
|---|---|---|
| `search_opportunities` | public | `getOpportunitiesPage` (published rows, explicit columns, sanitized query) |
| `list_published` | public | `getOpportunities` (60 s in-process cache) |
| `my_applications` | signed-in only | `getUserApplications` (owner-scoped, same as the website) |

There is **no write, update, delete or submit tool**; a test asserts this. Adding one requires a new registry entry, a permission level, an approval flow and tests.

## Intents (v1)
greeting/help, search, explain, compare (links to `/compare`), deadlines (next 30 days), eligibility, my applications, human support, unknown→help. Eligibility **lists published requirements and marks each "not checked"**; it never concludes eligibility because no verified user data exists yet.

## Guarantees (each covered by tests)
- Guests cannot reach `my_applications`; no private tool runs for them.
- Outage → explicit "cannot reach data" reply with `grounded: false`; no guessing.
- Expired listings are excluded from search/compare; flagged (not hidden) in "explain".
- Only `http(s)` URLs are ever returned as links.
- The agent never claims to have applied or submitted anything.

## Controls
Request validation (≤1000 chars, ≤4 KB), same-origin check, per-user/IP rate limit (`lib/agent/rate-limit.ts`). **Limitation:** the limiter is in-memory per server instance, so on serverless it is best-effort; use a shared store before launch. `x-forwarded-for` is only trustworthy behind a proxy that overwrites it.

## Not implemented (and why)
| Capability | Blocker |
|---|---|
| LLM phrasing / classification, prompt versioning, LLM evaluation | Provider, server-side key, cost limits (`needs_config`) |
| Persistent conversations, user-controlled memory, audit log, token/cost monitoring | Migration 005 + a conversations table (not yet proposed) |
| Matching, readiness, gap, roadmap, CV, essay, interview, learning agents | Need profile, documents, academy data |
| Document Intelligence / RAG | Document vault + scanning |
| Application Agent | Vault, approval UI, legal review; must never submit without approval of the exact final version (`lib/ai/guardrails.ts`) |

## Adding an LLM safely
1. Implement `AiProvider` (`lib/ai/provider.ts`) with server-only keys. 2. Use it only to **rephrase** a reply the orchestrator already built from tool data, or to classify intent behind the same signature. 3. Reject any model output containing facts not present in the tool result. 4. Write an audit event per call (`lib/ai/audit.ts`, redacted). 5. Add a cost cap and per-user quota. 6. Add golden-conversation tests.
