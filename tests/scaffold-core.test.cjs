const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const load = (p) => require(path.resolve(__dirname, "../.scaffold-test-build", p));

const mappers = load("lib/opportunities/mappers.js");
const search = load("lib/opportunities/search.js");
const compare = load("lib/opportunities/compare.js");
const deadlines = load("lib/opportunities/deadlines.js");
const nextActions = load("lib/dashboard/next-actions.js");
const env = load("lib/env.js");
const result = load("lib/services/result.js");
const dedupe = load("lib/notifications/dedupe.js");
const delivery = load("lib/notifications/delivery.js");
const policy = load("lib/documents/policy.js");
const agentsModule = load("lib/ai/agents.js");
const guardrails = load("lib/ai/guardrails.js");
const audit = load("lib/ai/audit.js");
const provider = load("lib/ai/provider.js");

// ───────── core hardening ─────────
test("mappers keep types the admin form can create (no silent 'fellowship')", () => {
  for (const type of ["volunteering", "conference", "workshop", "other", "scholarship"]) {
    assert.equal(mappers.normalizeOpportunityType(type), type);
  }
  assert.equal(mappers.normalizeOpportunityType("graduate_program"), "graduate-program");
});

test("unknown or missing types become 'other', never another real category", () => {
  for (const value of ["research", "grant", "", "  ", null, undefined]) {
    assert.equal(mappers.normalizeOpportunityType(value), "other", String(value));
  }
  assert.equal(mappers.toDatabaseOpportunityType("graduate-program"), "graduate_program");
});

test("delivery mode is never invented", () => {
  assert.equal(mappers.normalizeWorkMode("in_person"), "on-site");
  assert.equal(mappers.normalizeWorkMode("Remote"), "remote");
  assert.equal(mappers.normalizeWorkMode("hybrid"), "hybrid");
  for (const value of ["", null, undefined, "unspecified", "other"]) {
    assert.equal(mappers.normalizeWorkMode(value), "unspecified", String(value));
  }
  assert.equal(mappers.normalizeFundingType("fully_funded"), "fully_funded");
  assert.equal(mappers.normalizeFundingType("weird"), "unspecified");
});

test("search term cannot change the PostgREST filter", () => {
  const cleaned = search.sanitizeSearchTerm("x%,status.eq.draft),(title.ilike.*");
  assert.doesNotMatch(cleaned, /[,()%*]/);
  assert.equal(search.sanitizeSearchTerm("  a   b  "), "a b");
  assert.equal(search.sanitizeSearchTerm("a".repeat(500)).length, 80);
  assert.equal(search.sanitizeSearchTerm(null), "");
});

test("page and page-size are clamped", () => {
  assert.equal(search.clampPage("0"), 1);
  assert.equal(search.clampPage("abc"), 1);
  assert.equal(search.clampPage("5"), 5);
  assert.equal(search.clampPage(99999999), 10000);
  assert.equal(search.clampPageSize("1000"), 50);
  assert.equal(search.clampPageSize(undefined), 12);
});

test("env helper reports missing and present configuration", () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  try {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    assert.equal(env.getSupabaseEnv(), null);
    assert.equal(env.isSupabaseConfigured(), false);
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://example.invalid";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "placeholder";
    assert.deepEqual(env.getSupabaseEnv(), { url: "http://example.invalid", publishableKey: "placeholder" });
  } finally {
    if (url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL = url;
    if (key === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = key;
  }
});

// ───────── comparison ─────────
const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const C = "33333333-3333-4333-8333-333333333333";
const D = "44444444-4444-4444-8444-444444444444";
const E = "55555555-5555-4555-8555-555555555555";

test("compare ids: parse, dedupe, validate, cap", () => {
  assert.deepEqual(compare.parseCompareIds(`${A},${B}`).ids, [A, B]);
  assert.deepEqual(compare.parseCompareIds([A, B, A.toUpperCase()]).ids, [A, B]);
  const capped = compare.parseCompareIds([A, B, C, D, E]);
  assert.equal(capped.ids.length, 4);
  assert.equal(capped.truncated, true);
  const invalid = compare.parseCompareIds(["not-a-uuid", A, "<script>"]);
  assert.deepEqual(invalid.ids, [A]);
  assert.equal(invalid.invalidCount, 2);
  assert.deepEqual(compare.parseCompareIds(undefined).ids, []);
});

function opportunity(overrides) {
  return {
    id: A, title: "T", organization: "Org", type: "scholarship", country: "Egypt", location: "Cairo",
    workMode: "remote", fundingType: "fully_funded", deadline: "2026-12-01", programStartDate: "", programEndDate: "",
    createdAt: "", publishedAt: "", summary: "", description: "", eligibility: ["a"], requirements: ["r1"],
    academicRequirements: [], skillsRequirements: [], requiredDocuments: ["cv", "id"], tags: [],
    applicationUrl: "", officialSourceUrl: "", contactInformation: "", ...overrides,
  };
}

test("comparison rows flag differences and handle missing values", () => {
  const rows = compare.buildComparisonRows(
    [opportunity({}), opportunity({ id: B, deadline: "2027-01-01", eligibility: ["a"], requiredDocuments: ["id", "cv"], programStartDate: "" })],
    { type: (v) => v, workMode: (v) => v, funding: (v) => v, date: (v) => v },
  );
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r]));
  assert.equal(byKey.country.differs, false);
  assert.equal(byKey.deadline.differs, true);
  assert.equal(byKey.documents.differs, false, "list order must not matter");
  assert.deepEqual(byKey.programStart.values, ["Not specified", "Not specified"]);
  assert.deepEqual(byKey.preparationItems.values, ["3", "3"]);
  assert.match(byKey.preparationItems.note, /not a difficulty rating/i);
});

// ───────── deadlines ─────────
const NOW = new Date("2026-11-05T10:00:00Z");

test("daysUntil and classification", () => {
  assert.equal(deadlines.daysUntil("2026-11-05", NOW), 0);
  assert.equal(deadlines.daysUntil("2026-11-10", NOW), 5);
  assert.equal(deadlines.daysUntil("2026-11-04", NOW), -1);
  assert.equal(deadlines.daysUntil("garbage", NOW), null);
  assert.equal(deadlines.daysUntil(null, NOW), null);
  assert.equal(deadlines.classifyDeadline(-1), "passed");
  assert.equal(deadlines.classifyDeadline(14), "closing-soon");
  assert.equal(deadlines.classifyDeadline(15), "open");
  assert.equal(deadlines.classifyDeadline(null), "unknown");
});

test("upcoming deadlines exclude past, far-future and invalid dates", () => {
  const items = [
    { id: "1", title: "past", deadline: "2026-11-01", kind: "opportunity" },
    { id: "2", title: "soon", deadline: "2026-11-08", kind: "opportunity" },
    { id: "3", title: "far", deadline: "2027-06-01", kind: "opportunity" },
    { id: "4", title: "none", deadline: null, kind: "opportunity" },
    { id: "5", title: "today", deadline: "2026-11-05", kind: "application" },
  ];
  const upcoming = deadlines.upcomingDeadlines(items, NOW, 60);
  assert.deepEqual(upcoming.map((i) => i.id), ["5", "2"]);
});

test("overlap clusters need 2+ items within the gap", () => {
  const dated = deadlines.upcomingDeadlines(
    [
      { id: "a", title: "a", deadline: "2026-11-10", kind: "opportunity" },
      { id: "b", title: "b", deadline: "2026-11-12", kind: "opportunity" },
      { id: "c", title: "c", deadline: "2026-12-20", kind: "opportunity" },
    ],
    NOW,
    90,
  );
  const clusters = deadlines.findDeadlineClusters(dated, 3);
  assert.equal(clusters.length, 1);
  assert.deepEqual(clusters[0].map((i) => i.id), ["a", "b"]);
  assert.deepEqual(deadlines.findDeadlineClusters(dated.slice(2), 3), []);
});

// ───────── dashboard ─────────
test("next actions: empty state, urgency, ordering, ignoring submitted", () => {
  assert.equal(nextActions.computeNextActions([], NOW)[0].id, "start-first-application");

  const actions = nextActions.computeNextActions(
    [
      { id: "1", title: "Due soon", status: "preparing", deadline: "2026-11-08", progress: 20 },
      { id: "2", title: "Behind", status: "in_progress", deadline: "2026-11-20", progress: 10 },
      { id: "3", title: "Passed", status: "preparing", deadline: "2026-10-01", progress: 90 },
      { id: "4", title: "Done", status: "submitted", deadline: "2026-11-06", progress: 100 },
      { id: "5", title: "No date", status: "preparing", deadline: null, progress: 0 },
    ],
    NOW,
  );
  assert.deepEqual(actions.map((a) => a.id), ["due-soon-1", "behind-2", "passed-3"]);
  assert.equal(nextActions.computeNextActions(
    Array.from({ length: 6 }, (_, i) => ({ id: String(i), title: "t" + i, status: "preparing", deadline: "2026-11-06", progress: 0 })), NOW, 3).length, 3);
});

// ───────── service/notification/document/AI scaffolding ─────────
test("service result helpers", () => {
  assert.deepEqual(result.ok(1), { ok: true, data: 1 });
  const nc = result.notConfigured("Profile");
  assert.equal(nc.ok, false);
  assert.equal(nc.error.code, "not_configured");
  assert.match(nc.error.message, /scaffolded but not implemented/);
});

test("dedupe key is stable, scoped and sanitized", () => {
  const key = dedupe.buildDedupeKey({ category: "deadlines", entityType: "application", entityId: "ABC 123", window: "2026-11-05" });
  assert.equal(key, "deadlines:application:abc-123:2026-11-05");
  assert.equal(key, dedupe.buildDedupeKey({ category: "deadlines", entityType: "application", entityId: "ABC 123", window: "2026-11-05" }));
  assert.notEqual(key, dedupe.buildDedupeKey({ category: "deadlines", entityType: "application", entityId: "ABC 123", window: "2026-11-06" }));
  assert.equal(dedupe.buildDedupeKey({ category: "" }), "general:-:-:once");
});

test("delivery policy: consent required for push/WhatsApp; nothing is registered", () => {
  assert.equal(delivery.deliveryChannels.length, 0);
  assert.equal(delivery.canDeliver({ channel: "in_app", category: "deadlines", enabled: true, consentedAt: null }), true);
  assert.equal(delivery.canDeliver({ channel: "email", category: "deadlines", enabled: false, consentedAt: null }), false);
  assert.equal(delivery.canDeliver({ channel: "whatsapp", category: "deadlines", enabled: true, consentedAt: null }), false);
  assert.equal(delivery.canDeliver({ channel: "push", category: "deadlines", enabled: true, consentedAt: "2026-11-05T00:00:00Z" }), true);
});

test("upload policy and storage paths", () => {
  const good = { category: "cv", title: "My CV", filename: "cv.pdf", mimeType: "application/pdf", sizeBytes: 1000 };
  assert.deepEqual(policy.validateUploadRequest(good), { ok: true });
  for (const bad of [
    { ...good, mimeType: "application/x-msdownload" },
    { ...good, sizeBytes: policy.MAX_DOCUMENT_BYTES + 1 },
    { ...good, sizeBytes: 0 },
    { ...good, category: "passport-scan" },
    { ...good, title: "  " },
    { ...good, filename: "..." },
    { ...good, expiresOn: "tomorrow" },
  ]) {
    assert.equal(policy.validateUploadRequest(bad).ok, false, JSON.stringify(bad));
  }
  assert.equal(policy.sanitizeFilename("../../etc/passwd"), "passwd");
  assert.equal(policy.sanitizeFilename("..."), null);
  assert.match(policy.sanitizeFilename("my résumé.pdf"), /^[a-zA-Z0-9._-]+$/);
  assert.equal(policy.buildStoragePath("user-1234567", "doc-1234567", 2, "cv.pdf"), "user-1234567/doc-1234567/v2-cv.pdf");
  assert.equal(policy.buildStoragePath("../x", "doc-1234567", 1, "cv.pdf"), null);
  assert.equal(policy.buildStoragePath("user-1234567", "doc-1234567", 0, "cv.pdf"), null);
  assert.equal(policy.SIGNED_URL_TTL_SECONDS <= 600, true);
});

test("AI registry: no agent can submit; scopes and approvals are sane", () => {
  const { agents, getAgent } = agentsModule;
  assert.equal(new Set(agents.map((a) => a.id)).size, agents.length);
  assert.equal(agents.length, 14);
  for (const agent of agents) {
    assert.equal(agent.canSubmitApplication, false, agent.id);
    assert.ok(agent.permittedData.length > 0, agent.id);
    assert.ok(agent.purpose.length > 10, agent.id);
    if (agent.canWriteUserData) assert.equal(agent.requiresUserApproval, true, `${agent.id} writes user data without approval`);
  }
  const application = getAgent("application");
  assert.equal(application.status, "blocked");
  assert.equal(application.requiresUserApproval, true);
  const personal = ["profile", "documents", "applications", "ai_memory", "learning_progress"];
  assert.equal(getAgent("opportunity").permittedData.some((s) => personal.includes(s)), false, "discovery agent must not read user data");
  assert.equal(getAgent("nope"), undefined);
});

test("approval must match the exact final version", () => {
  const ok = { userApprovedFinalVersion: true, approvedVersionId: "v3", currentVersionId: "v3" };
  assert.equal(guardrails.canSubmitApplication(ok), true);
  assert.equal(guardrails.canSubmitApplication({ ...ok, currentVersionId: "v4" }), false, "stale approval");
  assert.equal(guardrails.canSubmitApplication({ ...ok, userApprovedFinalVersion: false }), false);
  assert.equal(guardrails.canSubmitApplication({ ...ok, approvedVersionId: null }), false);
  assert.ok(guardrails.AI_RULES.some((r) => /never submit an application/i.test(r)));
});

test("audit redaction and unconfigured provider", () => {
  const redacted = audit.redactForAudit("Contact me at jane.doe@example.com or +20 100 201 7643 please");
  assert.doesNotMatch(redacted, /@|\d{5}/);
  assert.equal(audit.redactForAudit("x".repeat(500)).length, 200);
  assert.equal(provider.getAiProvider(), null);
});
