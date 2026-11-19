const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { createHmac } = require("node:crypto");

const load = (p) => require(path.resolve(__dirname, "../.scaffold-test-build", p));
const intent = load("lib/agent/intent.js");
const orchestrator = load("lib/agent/orchestrator.js");
const registry = load("lib/agent/tool-registry.js");
const rate = load("lib/agent/rate-limit.js");
const request = load("lib/agent/request.js");
const wa = load("lib/channels/whatsapp.js");
const handler = load("lib/channels/whatsapp-handler.js");

const NOW = new Date("2026-11-05T10:00:00Z");
const ID = (n) => `${String(n).repeat(8)}-${String(n).repeat(4)}-4${String(n).repeat(3)}-8${String(n).repeat(3)}-${String(n).repeat(12)}`;

function opp(n, overrides = {}) {
  return {
    id: ID(n), title: `Opportunity ${n}`, organization: `Org ${n}`, type: "scholarship", country: "Egypt", location: "",
    workMode: "remote", fundingType: "fully_funded", deadline: "2026-11-20", programStartDate: "", programEndDate: "",
    createdAt: "", publishedAt: "", summary: `Summary ${n}`, description: "", eligibility: ["Must be a university student"],
    requirements: [], academicRequirements: ["GPA 3.0"], skillsRequirements: ["English"], requiredDocuments: ["CV", "Transcript"],
    tags: [], applicationUrl: "https://example.org/apply", officialSourceUrl: "https://example.org", contactInformation: "", ...overrides,
  };
}

function tools(overrides = {}) {
  const calls = [];
  const list = overrides.list ?? [opp(1), opp(2, { type: "internship", country: "Germany", fundingType: "partially_funded" }), opp(3, { deadline: "2026-10-01" })];
  return {
    calls,
    searchOpportunities: async (p) => { calls.push(["search", p]); return overrides.search ?? { ok: true, data: list }; },
    listPublished: async () => { calls.push(["list"]); return overrides.listResult ?? { ok: true, data: list }; },
    myApplications: async () => { calls.push(["mine"]); return overrides.mine ?? { ok: true, data: [] }; },
  };
}
const GUEST = { userId: null };
const USER = { userId: "user-1" };
const run = (message, t = tools(), session = GUEST) => orchestrator.runAgentTurn({ message, session, tools: t, now: NOW });

// ───────── intent and entities ─────────
test("intent detection", () => {
  const cases = {
    "hello": "greeting", "Hi there": "greeting", "help": "help",
    "Find fully funded scholarships in Egypt": "search_opportunities",
    "tell me about Opportunity 1": "explain_opportunity",
    "compare scholarships": "compare", "am I eligible for Opportunity 1": "eligibility",
    "show deadlines closing soon": "deadlines", "what are my application deadlines?": "my_applications",
    "I want to talk to a human": "human_support", "": "unknown", "x": "unknown",
  };
  for (const [message, expected] of Object.entries(cases)) assert.equal(intent.detectIntent(message), expected, message);
});

test("entity extraction", () => {
  const e = intent.detectEntities("Find fully funded scholarships or internships in Egypt about robotics", ["Egypt", "Germany"]);
  assert.deepEqual(e.types.sort(), ["internship", "scholarship"]);
  assert.equal(e.country, "Egypt");
  assert.equal(e.funding, "fully_funded");
  assert.equal(e.query, "robotics");
  assert.equal(intent.detectEntities("masters in Germany", ["Germany"]).types[0], "graduate-program");
  assert.equal(intent.detectEntities("anything", ["Egypt"]).country, null);
});

// ───────── tool permissions ─────────
test("tool registry: all tools read-only; user tools need a session; unknown tools denied", () => {
  assert.ok(registry.toolRegistry.every((t) => t.readOnly === true));
  assert.equal(registry.authorizeTool("search_opportunities", GUEST).allowed, true);
  assert.deepEqual(registry.authorizeTool("my_applications", GUEST), { allowed: false, reason: "sign_in_required" });
  assert.equal(registry.authorizeTool("my_applications", USER).allowed, true);
  assert.deepEqual(registry.authorizeTool("submit_application", USER), { allowed: false, reason: "unknown_tool" });
  assert.ok(!registry.toolRegistry.some((t) => /submit|write|delete|update/.test(t.name)), "no write-like tools");
});

// ───────── orchestrator ─────────
test("greeting and help need no data access", async () => {
  const t = tools();
  const reply = await run("hello", t);
  assert.equal(reply.intent, "greeting");
  assert.equal(t.calls.length, 0);
  assert.match(reply.text, /can’t submit applications/);
});

test("search: grounded cards, no expired deadlines, compare link, confirm note", async () => {
  const reply = await run("find scholarships", tools({ list: [opp(1), opp(2), opp(3, { deadline: "2026-10-01" })] }));
  assert.equal(reply.grounded, true);
  assert.deepEqual(reply.cards.map((c) => c.id), [ID(1), ID(2)], "the expired listing is dropped");
  assert.match(reply.text, /confirm them on the official source/);
  assert.ok(reply.links.some((l) => l.href === `/compare?ids=${ID(1)},${ID(2)}`));
  assert.ok(reply.cards.every((c) => c.href === `/opportunities/${c.id}`));
});

test("search filters by funding, type and country using only tool data", async () => {
  const t = tools();
  const reply = await run("fully funded scholarships in Egypt", t);
  assert.deepEqual(reply.cards.map((c) => c.id), [ID(1)]);
  const searchCall = t.calls.find((c) => c[0] === "search")[1];
  assert.equal(searchCall.type, "scholarship");
  assert.equal(searchCall.country, "Egypt");
});

test("no results is stated plainly and nothing is invented", async () => {
  const reply = await run("fully funded workshops", tools({ search: { ok: true, data: [] } }));
  assert.equal(reply.cards.length, 0);
  assert.match(reply.text, /couldn’t find published opportunities/);
});

test("data outage: says so, grounded=false, no cards", async () => {
  const reply = await run("find scholarships", tools({ listResult: { ok: false }, search: { ok: false } }));
  assert.equal(reply.grounded, false);
  assert.equal(reply.cards.length, 0);
  assert.match(reply.text, /won’t guess/);
});

test("explain: uses listing facts; only http(s) links are exposed", async () => {
  const bad = opp(1, { officialSourceUrl: "javascript:alert(1)", applicationUrl: "data:text/html,x" });
  const reply = await run("tell me about Opportunity 1", tools({ list: [bad] }));
  assert.match(reply.text, /Must be a university student/);
  assert.match(reply.text, /Transcript/);
  assert.deepEqual(reply.links.map((l) => l.label), ["View on Find"], "dangerous URLs are dropped");
  const good = await run("tell me about Opportunity 1", tools({ list: [opp(1)] }));
  assert.ok(good.links.some((l) => l.label === "Official source" && l.href.startsWith("https://")));
});

test("explain flags a passed deadline instead of hiding the listing", async () => {
  const reply = await run("tell me about Opportunity 3", tools({ list: [opp(3, { deadline: "2026-10-01" })] }));
  assert.match(reply.text, /has passed/);
});

test("eligibility: never concludes eligibility, marks every requirement as not checked", async () => {
  const reply = await run("am I eligible for Opportunity 1", tools({ list: [opp(1)] }));
  assert.match(reply.text, /won’t say whether you’re eligible/);
  assert.match(reply.text, /Must be a university student \(not checked\)/);
  assert.match(reply.text, /GPA 3.0 \(not checked\)/);
  const withoutDisclaimer = reply.text.replace("I won’t say whether you’re eligible", "");
  assert.doesNotMatch(withoutDisclaimer, /you are eligible|you’re eligible|you qualify|you meet|you do not meet|you’re not eligible/i);
});

test("compare builds a link for 2-4 results and refuses with fewer", async () => {
  const many = Array.from({ length: 6 }, (_, i) => opp(i + 1));
  const reply = await run("compare scholarships", tools({ list: many }));
  const link = reply.links.find((l) => l.label === "Open comparison");
  assert.equal(link.href.split("=")[1].split(",").length, 4);
  const single = await run("compare scholarships", tools({ list: [opp(1)] }));
  assert.equal(single.links.length, 0);
  assert.match(single.text, /at least two/);
});

test("deadlines: only the next 30 days, soonest first", async () => {
  const list = [opp(1, { deadline: "2026-12-30" }), opp(2, { deadline: "2026-11-10" }), opp(3, { deadline: "2026-11-07" }), opp(4, { deadline: "2026-10-01" })];
  const reply = await run("show deadlines closing soon", tools({ list }));
  assert.deepEqual(reply.cards.map((c) => c.id), [ID(3), ID(2)]);
  assert.match(reply.text, /2 published opportunities close within 30 days/);
});

test("my applications: guests are asked to sign in and no private tool runs", async () => {
  const t = tools();
  const reply = await run("what are my application deadlines?", t, GUEST);
  assert.equal(reply.requiresSignIn, true);
  assert.equal(t.calls.some((c) => c[0] === "mine"), false);
  assert.ok(reply.links[0].href.startsWith("/sign-in"));
});

test("my applications: signed-in users get their own summary and next actions", async () => {
  const mine = { ok: true, data: [{ id: "a1", title: "Chevening", status: "preparing", deadline: "2026-11-08", progress: 20 }] };
  const reply = await run("show my applications", tools({ mine }), USER);
  assert.match(reply.text, /tracking 1 application/);
  assert.match(reply.text, /Chevening: due in 3 days/);
  const empty = await run("show my applications", tools(), USER);
  assert.match(empty.text, /aren’t tracking any applications/);
  const down = await run("show my applications", tools({ mine: { ok: false } }), USER);
  assert.equal(down.grounded, false);
});

test("human support is honest that nothing was sent", async () => {
  const reply = await run("I need a real person", tools());
  assert.deepEqual(reply.handoff, { requested: true, available: false });
  assert.match(reply.text, /has not been sent to anyone/);
});

test("the agent has no write capability and never claims to apply on the user's behalf", async () => {
  const t = tools();
  assert.deepEqual(Object.keys(t).filter((k) => k !== "calls").sort(), ["listPublished", "myApplications", "searchOpportunities"]);
  const reply = await run("apply to Opportunity 1 for me", t);
  assert.doesNotMatch(reply.text, /i (have )?(applied|submitted)|application (was )?submitted/i);
});

// ───────── rate limit and request validation ─────────
test("rate limiter: limit, retry-after, window reset, key isolation", () => {
  const limiter = rate.createRateLimiter({ limit: 3, windowMs: 10_000 });
  for (let i = 0; i < 3; i++) assert.equal(limiter.check("a", 1000 + i).allowed, true);
  const blocked = limiter.check("a", 1500);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds >= 1);
  assert.equal(limiter.check("b", 1500).allowed, true);
  assert.equal(limiter.check("a", 12_000).allowed, true, "window slid");
});

test("chat request validation", () => {
  assert.deepEqual(request.parseChatRequest('{"message":"  hi  "}'), { ok: true, message: "hi" });
  assert.equal(request.parseChatRequest("not json").status, 400);
  assert.equal(request.parseChatRequest('{"message":5}').ok, false);
  assert.equal(request.parseChatRequest('{"message":"   "}').ok, false);
  assert.equal(request.parseChatRequest(JSON.stringify({ message: "x".repeat(1001) })).status, 400);
  assert.equal(request.parseChatRequest(JSON.stringify({ message: "x".repeat(5000) })).status, 413);
  assert.equal(request.parseChatRequest('{"message":"a\\u0000b"}').message, "ab", "control characters stripped");
  assert.equal(request.parseChatRequest("null").ok, false);
});

test("same-origin and client key helpers", () => {
  assert.equal(request.isSameOrigin(null, "site.com"), true);
  assert.equal(request.isSameOrigin("https://site.com", "site.com"), true);
  assert.equal(request.isSameOrigin("https://evil.com", "site.com"), false);
  assert.equal(request.isSameOrigin("garbage", "site.com"), false);
  assert.equal(request.clientKey("1.2.3.4, 5.6.7.8"), "ip:1.2.3.4");
  assert.equal(request.clientKey("<script>"), "ip:unknown");
  assert.equal(request.clientKey("2001:db8::1"), "ip:2001:db8::1");
  assert.equal(request.clientKey("abc, 1.2.3.4"), "ip:unknown", "only the first hop is trusted");
  assert.equal(request.clientKey(null), "ip:unknown");
});

// ───────── WhatsApp ─────────
const CONFIG = { verifyToken: "vt", appSecret: "secret", accessToken: "tok", phoneNumberId: "123", graphVersion: "v1.0", siteUrl: "https://find.example" };
const sign = (body, secret = CONFIG.appSecret) => "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
const payload = (messages) => JSON.stringify({ entry: [{ changes: [{ value: { messages } }] }] });

test("webhook handshake and signature verification", () => {
  assert.deepEqual(wa.verifyChallenge({ mode: "subscribe", token: "vt", challenge: "42" }, "vt"), { ok: true, challenge: "42" });
  for (const bad of [{ mode: "subscribe", token: "nope", challenge: "42" }, { mode: "other", token: "vt", challenge: "42" }, { mode: "subscribe", token: "vt", challenge: null }, { mode: null, token: null, challenge: null }]) {
    assert.equal(wa.verifyChallenge(bad, "vt").ok, false);
  }
  const body = '{"a":1}';
  assert.equal(wa.verifySignature(body, sign(body), "secret"), true);
  assert.equal(wa.verifySignature(body + " ", sign(body), "secret"), false, "tampered body");
  assert.equal(wa.verifySignature(body, sign(body, "other"), "secret"), false);
  assert.equal(wa.verifySignature(body, null, "secret"), false);
  assert.equal(wa.verifySignature(body, sign(body).replace("sha256=", "md5="), "secret"), false);
  assert.equal(wa.verifySignature(body, "sha256=short", "secret"), false);
});

test("config requires every value and a sane version and site URL", () => {
  const env = { WHATSAPP_VERIFY_TOKEN: "a", WHATSAPP_APP_SECRET: "b", WHATSAPP_ACCESS_TOKEN: "c", WHATSAPP_PHONE_NUMBER_ID: "d", WHATSAPP_GRAPH_VERSION: "v9.0", WHATSAPP_SITE_URL: "https://x.org/" };
  assert.equal(wa.readWhatsAppConfig(env).siteUrl, "https://x.org");
  for (const key of Object.keys(env)) assert.equal(wa.readWhatsAppConfig({ ...env, [key]: "" }), null, key);
  assert.equal(wa.readWhatsAppConfig({ ...env, WHATSAPP_GRAPH_VERSION: "latest" }), null);
  assert.equal(wa.readWhatsAppConfig({ ...env, WHATSAPP_SITE_URL: "javascript:x" }), null);
  assert.equal(wa.readWhatsAppConfig({}), null);
});

test("inbound payload normalisation tolerates junk", () => {
  const parsed = wa.parseInboundMessages(JSON.parse(payload([{ id: "m1", from: "2010", type: "text", text: { body: "hi" } }, { id: "m2", from: "2010", type: "image" }, { nope: true }])));
  assert.deepEqual(parsed, [{ id: "m1", from: "2010", type: "text", text: "hi" }, { id: "m2", from: "2010", type: "image", text: null }]);
  for (const junk of [null, undefined, 5, {}, { entry: "x" }, { entry: [{ changes: "x" }] }, { entry: [{}] }]) assert.deepEqual(wa.parseInboundMessages(junk), []);
});

test("reply formatting uses absolute links and respects the length cap", () => {
  const reply = { intent: "search_opportunities", text: "Found it", cards: [{ id: "1", title: "T", organization: "O", type: "scholarship", country: "", deadline: "", fundingType: "unspecified", href: "/opportunities/1" }], links: [{ label: "Official", href: "https://o.org" }], suggestions: [], grounded: true };
  const text = wa.formatReplyForWhatsApp(reply, "https://find.example");
  assert.match(text, /https:\/\/find\.example\/opportunities\/1/);
  assert.match(text, /Official: https:\/\/o\.org/);
  assert.equal(wa.formatReplyForWhatsApp({ ...reply, text: "x".repeat(9000) }, "https://f.x").length, 3500);
});

function deps(overrides = {}) {
  const sent = []; const turns = [];
  return {
    sent, turns,
    config: CONFIG,
    provider: { sendText: async (to, text) => { sent.push([to, text]); return overrides.sendResult ?? { ok: true }; } },
    runTurn: async (m) => { turns.push(m); return { intent: "greeting", text: "Hi", cards: [], links: [], suggestions: [], grounded: true }; },
    rateLimiter: overrides.rateLimiter ?? rate.createRateLimiter({ limit: 5, windowMs: 60_000 }),
    seenMessageIds: new Set(),
    ...overrides.deps,
  };
}
const post = (d, body, header) => handler.handleWebhookPost(body, header === undefined ? sign(body) : header, d);

test("webhook is inert when not configured", async () => {
  const d = deps({ deps: { config: null, provider: null } });
  assert.equal((await post(d, payload([]))).status, 503);
  assert.equal(handler.handleWebhookGet({ mode: "subscribe", token: "vt", challenge: "1" }, { config: null }).status, 503);
});

test("webhook GET handshake", () => {
  assert.deepEqual(handler.handleWebhookGet({ mode: "subscribe", token: "vt", challenge: "99" }, { config: CONFIG }), { status: 200, body: "99" });
  assert.equal(handler.handleWebhookGet({ mode: "subscribe", token: "bad", challenge: "99" }, { config: CONFIG }).status, 403);
});

test("webhook rejects unsigned or badly signed requests before doing anything", async () => {
  const d = deps(); const body = payload([{ id: "m1", from: "2010", type: "text", text: { body: "hi" } }]);
  assert.equal((await post(d, body, null)).status, 401);
  assert.equal((await post(d, body, sign(body, "wrong"))).status, 401);
  assert.equal(d.turns.length, 0); assert.equal(d.sent.length, 0);
});

test("webhook answers text messages once, ignores non-text, dedupes, tolerates provider failure", async () => {
  const d = deps(); const body = payload([{ id: "m1", from: "2010", type: "text", text: { body: "hello" } }, { id: "m2", from: "2010", type: "image" }]);
  const res = await post(d, body);
  assert.equal(res.status, 200);
  assert.deepEqual(JSON.parse(res.body), { received: true, replied: 1 });
  assert.deepEqual(d.turns, ["hello"]);
  assert.equal(d.sent[0][0], "2010");
  await post(d, body);
  assert.equal(d.turns.length, 1, "redelivered message ids are ignored");

  const failing = deps({ sendResult: { ok: false, error: "provider_status_500" } });
  const res2 = await post(failing, payload([{ id: "z", from: "1", type: "text", text: { body: "hi" } }]));
  assert.equal(res2.status, 200, "never fail the webhook (Meta would retry)");
  assert.equal(JSON.parse(res2.body).replied, 0);

  const throwing = deps({ deps: { runTurn: async () => { throw new Error("boom"); } } });
  assert.equal((await post(throwing, payload([{ id: "q", from: "1", type: "text", text: { body: "hi" } }]))).status, 200);
});

test("webhook rate-limits per sender and rejects malformed signed JSON", async () => {
  const d = deps({ rateLimiter: rate.createRateLimiter({ limit: 1, windowMs: 60_000 }) });
  const msgs = payload([{ id: "a", from: "9", type: "text", text: { body: "one" } }, { id: "b", from: "9", type: "text", text: { body: "two" } }]);
  assert.equal(JSON.parse((await post(d, msgs)).body).replied, 1);
  assert.equal((await post(d, "not json")).status, 400);
});
