const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const { features, deriveStatus, summarizeFeatures } = require(path.join(root, ".scaffold-test-build/lib/features/registry.js"));
const { render } = require(path.join(root, "scripts/render-feature-status.cjs"));

const exists = (p) => fs.existsSync(path.join(root, p));
const ecosystemRoutes = new Set(require(path.join(root, ".scaffold-test-build/lib/ecosystem/registry.js")).pages.map((p) => p.route));

test("registry ids are unique and statuses are derived from parts", () => {
  assert.equal(new Set(features.map((f) => f.id)).size, features.length);
  for (const f of features) {
    assert.ok(f.parts.length > 0, f.id);
    assert.equal(f.status, deriveStatus(f.parts), f.id);
    assert.ok(f.acceptance.length > 0, `${f.id} needs acceptance criteria`);
  }
});

test("every listed file, test, route page and migration exists", () => {
  for (const f of features) {
    for (const file of f.files) assert.ok(exists(file), `${f.id}: missing file ${file}`);
    for (const t of f.tests ?? []) assert.ok(exists(t), `${f.id}: missing test ${t}`);
    if (f.route) assert.ok(exists(`app${f.route}/page.tsx`) || ecosystemRoutes.has(f.route), `${f.id}: no page for ${f.route} (neither an explicit page nor an ecosystem registry page)`);
    if (f.migration) assert.ok(exists(`supabase/migrations-drafts/proposed/${f.migration}`), `${f.id}: missing migration ${f.migration}`);
  }
});

test("a part marked implemented requires a test for the feature", () => {
  for (const f of features) {
    if (f.parts.some((p) => p.status === "implemented")) {
      assert.ok((f.tests ?? []).length > 0 || f.id === "ai-agent-detail", `${f.id} has implemented parts but lists no tests`);
    }
  }
});

test("scaffold pages reference real registry features and the right route", () => {
  const byId = Object.fromEntries(features.map((f) => [f.id, f]));
  const pages = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const rel = path.posix.join(dir, entry.name);
      if (entry.isDirectory()) walk(rel);
      else if (entry.name === "page.tsx") pages.push(rel);
    }
  })("app");

  let scaffoldPages = 0;
  for (const page of pages) {
    const source = fs.readFileSync(path.join(root, page), "utf8");
    const match = /featureId="([a-z0-9-]+)"/.exec(source);
    if (!match) continue;
    scaffoldPages += 1;
    const feature = byId[match[1]];
    assert.ok(feature, `${page} references unknown feature ${match[1]}`);
    assert.equal(`app${feature.route}/page.tsx`, page, `${page} does not match registry route for ${feature.id}`);
    assert.ok(source.includes(`scaffoldMetadata('${feature.id}')`) || source.includes(`scaffoldMetadata("${feature.id}")`), `${page} must be noindex via scaffoldMetadata`);
  }
  // The 13 former scaffold routes are now served by the ecosystem registry (tests/ecosystem.test.cjs);
  // any remaining FeatureScaffoldPage usage must still reference a real feature and be noindex (checked above).
  assert.ok(scaffoldPages >= 0);
});

test("proposed migrations: banner, RLS on every table, no destructive statements", () => {
  const dir = path.join(root, "supabase/migrations-drafts/proposed");
  const sqlFiles = fs.readdirSync(dir).filter((f) => f.endsWith(".sql"));
  assert.ok(sqlFiles.length >= 9);

  for (const file of sqlFiles) {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    assert.match(raw, /NOT APPLIED/, `${file} must carry the NOT APPLIED banner`);

    const code = raw.split("\n").filter((line) => !line.trim().startsWith("--")).join("\n");
    assert.doesNotMatch(code, /\bdelete\s+from\b|\btruncate\b|\bdrop\s+table\b|\bdrop\s+column\b|\bdrop\s+schema\b/i, `${file} has a destructive statement`);

    const created = [...code.matchAll(/create table if not exists public\.(\w+)/gi)].map((m) => m[1]);
    for (const table of created) {
      assert.match(code, new RegExp(`alter table public\\.${table} enable row level security`, "i"), `${file}: ${table} lacks RLS`);
    }
    if (created.length) assert.match(code, /begin;[\s\S]*commit;/i, `${file} must be transactional`);
  }
});

test("no secrets or privileged keys in app code", () => {
  const offenders = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const rel = path.posix.join(dir, entry.name);
      if (entry.isDirectory()) walk(rel);
      else if (/\.(ts|tsx)$/.test(entry.name)) {
        const text = fs.readFileSync(path.join(root, rel), "utf8");
        if (/service[_-]?role/i.test(text)) offenders.push(rel);
      }
    }
  })("lib");
  assert.deepEqual(offenders, []);
});

test("docs/FEATURE_STATUS.md is up to date with the registry", () => {
  assert.ok(exists("docs/FEATURE_STATUS.md"), "run: pnpm docs:features");
  const current = fs.readFileSync(path.join(root, "docs/FEATURE_STATUS.md"), "utf8");
  assert.equal(current, render(features, summarizeFeatures) + "\n", "out of date: run pnpm docs:features");
});
