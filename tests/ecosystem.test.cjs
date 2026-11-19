const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const load = (p) => require(path.join(root, ".scaffold-test-build", p));

const {
  pages,
  moduleTitle,
  moduleBackend,
  moduleRoots,
  getPage,
} = load("lib/ecosystem/registry.js");

const {
  resolveRoute,
  allConcreteRoutes,
  collectionBase,
} = load("lib/ecosystem/resolve.js");

const {
  collections,
  academyCategories,
  opportunityCategories,
} = load("lib/ecosystem/demo.js");

const {
  navSections,
  utilityNav,
} = load("lib/ecosystem/navigation.js");

const { coverage } = load("lib/ecosystem/coverage.js");
const { frontendStatusLabel } = load("lib/ecosystem/types.js");

// Explicit (hand-written) routes, discovered from the file system.
function explicitRoutes() {
  const out = [];

  (function walk(dir) {
    for (const entry of fs.readdirSync(path.join(root, dir), {
      withFileTypes: true,
    })) {
      const rel = path.posix.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(rel);
      } else if (entry.name === "page.tsx") {
        out.push(
          ("/" + path.posix.dirname(rel).replace(/^app\/?/, "")).replace(
            /\/$/,
            "",
          ) || "/",
        );
      }
    }
  })("app");

  return out.map((r) => (r === "" || r === "/." ? "/" : r));
}

const explicit = explicitRoutes().filter((r) => !/\[\.\.\./.test(r));

const matchesPattern = (pattern, url) => {
  const a = pattern.split("/").filter(Boolean);
  const b = url.split("/").filter(Boolean);

  return (
    a.length === b.length &&
    a.every(
      (seg, i) =>
        (seg.startsWith("[") && seg.endsWith("]")) || seg === b[i],
    )
  );
};

const routeExists = (href) => {
  const url = href.split("?")[0].split("#")[0];

  if (/^https?:/.test(url)) return true;

  return (
    explicit.some((p) => matchesPattern(p, url)) ||
    resolveRoute(url) !== null
  );
};

test("registry is large, ids and routes are unique", () => {
  assert.ok(pages.length >= 280, `only ${pages.length} pages`);

  assert.equal(
    new Set(pages.map((p) => p.id)).size,
    pages.length,
    "duplicate page ids",
  );

  assert.equal(
    new Set(pages.map((p) => p.route)).size,
    pages.length,
    "duplicate page routes",
  );

  const concrete = allConcreteRoutes().map((r) => r.route);

  assert.equal(
    new Set(concrete).size,
    concrete.length,
    "two pages serve the same URL",
  );

  assert.ok(concrete.length >= 380);
});

test("every page is well formed and statuses are valid", () => {
  for (const p of pages) {
    assert.ok(p.title.length > 2 && p.summary.length > 5, p.id);

    assert.ok(
      Object.hasOwn(frontendStatusLabel, p.status),
      `${p.id}: bad status ${p.status}`,
    );

    assert.ok(Object.hasOwn(moduleTitle, p.module), `${p.id}: bad module`);

    assert.ok(p.route.startsWith("/"), p.id);

    if (p.status === "existing") {
      assert.equal(
        p.blocks.length,
        0,
        `${p.id}: existing pages are rendered by explicit routes`,
      );
    } else {
      assert.ok(p.blocks.length > 0, `${p.id}: empty page`);
    }
  }
});

test("existing pages have explicit routes; registry routes never shadow or collide with them", () => {
  // Pages marked "existing" must have a matching hand-written Next.js route.
  for (const p of pages.filter((x) => x.status === "existing")) {
    assert.ok(
      explicit.includes(p.route),
      `${p.id}: no explicit page for ${p.route}`,
    );
  }

  // Registry-managed pages must not collide with hand-written routes.
  // Pages explicitly marked with explicitRoute: true are the exception:
  // they intentionally use a hand-written route while retaining their
  // accurate frontend implementation status.
  for (
    const p of pages.filter(
      (x) => x.status !== "existing" && x.explicitRoute !== true,
    )
  ) {
    assert.equal(
      explicit.includes(p.route),
      false,
      `${p.id}: ${p.route} collides with an explicit route`,
    );
  }

  // Every page marked explicitRoute must actually have a hand-written route.
  for (const p of pages.filter((x) => x.explicitRoute === true)) {
    assert.ok(
      explicit.includes(p.route),
      `${p.id}: explicitRoute is true but no explicit page exists for ${p.route}`,
    );
  }
});

test("parents exist and chains are acyclic", () => {
  for (const p of pages) {
    let cur = p;
    let hops = 0;

    while (cur.parent) {
      cur = getPage(cur.parent);

      assert.ok(cur, `${p.id}: missing parent`);
      assert.ok(++hops < 8, `${p.id}: cycle`);
    }
  }
});

test("navigation: the six sections, and every link leads to an existing page", () => {
  assert.deepEqual(
    navSections.map((s) => s.title),
    [
      "Discover",
      "Understand",
      "Prepare",
      "Connect",
      "Grow",
      "For Organizations",
    ],
  );

  for (const section of navSections) {
    assert.ok(section.items.length >= 3, section.title);

    for (const item of section.items) {
      assert.ok(
        routeExists(item.href),
        `dead nav link: ${item.label} -> ${item.href}`,
      );
    }
  }

  for (const item of utilityNav) {
    assert.ok(routeExists(item.href), `dead utility link ${item.href}`);
  }
});

test("every link written inside a page resolves", () => {
  const hrefs = [];

  for (const p of pages) {
    for (const b of p.blocks) {
      if (b.kind === "cards") {
        b.items.forEach((i) => i.href && hrefs.push([p.id, i.href]));
      }

      if (b.kind === "list") {
        b.items.forEach((i) => i.href && hrefs.push([p.id, i.href]));
      }
    }
  }

  assert.ok(hrefs.length > 60);

  for (const [id, href] of hrefs) {
    assert.ok(routeExists(href), `${id}: dead link ${href}`);
  }
});

test("academy category links filter to real course tags", () => {
  const tags = new Set(collections.courses.flatMap((c) => c.tags));

  for (const [slug] of academyCategories) {
    assert.ok(tags.has(slug), `no course for category ${slug}`);
  }
});

test("collections: slugs unique, detail pages exist, tag presets match real tags", () => {
  for (const [name, items] of Object.entries(collections)) {
    assert.ok(items.length >= 3, name);

    assert.equal(
      new Set(items.map((i) => i.slug)).size,
      items.length,
      `${name}: duplicate slug`,
    );

    for (const item of items) {
      assert.ok(
        item.title && item.summary && item.sections.length,
        `${name}/${item.slug}`,
      );
    }

    assert.ok(collectionBase[name], `${name}: no base path`);

    assert.ok(
      pages.some((p) => p.detailOf === name),
      `${name}: no detail page`,
    );
  }

  for (const p of pages) {
    for (const b of p.blocks) {
      if (b.kind === "collection" && b.tag) {
        assert.ok(
          collections[b.collection].some((i) => i.tags.includes(b.tag)),
          `${p.id}: preset tag ${b.tag} matches nothing`,
        );
      }
    }
  }
});

test("dynamic routes resolve only for real items and known params", () => {
  assert.ok(
    resolveRoute("/academy/courses/scholarship-application-strategy").item,
  );

  assert.equal(resolveRoute("/academy/courses/does-not-exist"), null);
  assert.equal(resolveRoute("/opportunities/category/nope"), null);
  assert.ok(resolveRoute("/opportunities/category/scholarship"));
  assert.equal(resolveRoute("/totally/unknown"), null);

  assert.equal(
    resolveRoute("/opportunities"),
    null,
    "existing pages are never rendered by the resolver",
  );

  assert.equal(opportunityCategories.length, 17);
});

test("coverage: every item from the product spec maps to a real route", () => {
  assert.ok(coverage.length >= 250, `only ${coverage.length} coverage items`);

  const missing = coverage.filter((c) => !routeExists(c.route));

  assert.deepEqual(
    missing.map((m) => `${m.module}: ${m.item} -> ${m.route}`),
    [],
  );

  for (const required of [
    "Scholarships",
    "Internships",
    "Research Opportunities",
    "Fellowships",
    "Exchange Programs",
    "Summer Schools",
    "Conferences",
    "Competitions",
    "Grants",
    "Volunteering",
    "Jobs",
    "Training Programs",
    "Entrepreneurship Programs",
    "Incubators",
    "Accelerators",
    "Leadership Programs",
    "Graduate Opportunities",
  ]) {
    assert.ok(
      coverage.some((c) => c.item === required),
      `category missing: ${required}`,
    );
  }
});

test("every module has pages and backend requirements", () => {
  for (const m of Object.keys(moduleTitle)) {
    assert.ok(pages.some((p) => p.module === m), `module ${m} has no pages`);

    assert.ok(
      moduleBackend[m].length > 0,
      `module ${m} has no backend requirements`,
    );
  }

  for (const [m, ids] of Object.entries(moduleRoots)) {
    for (const id of ids) {
      assert.ok(getPage(id), `${m}: missing root ${id}`);
    }
  }
});

test("honesty: forms never imply they save, and no page claims success", () => {
  const claim =
    /(saved|submitted|sent|booked|registered|created|uploaded) successfully|your (request|application|message) (has been|was) (sent|submitted)|thank you for (registering|applying)/i;

  for (const p of pages) {
    assert.doesNotMatch(JSON.stringify(p), claim, `${p.id} contains a success claim`);

    for (const b of p.blocks) {
      if (b.kind !== "form") continue;

      const disclosed =
        /\(not available\)/i.test(b.submit) ||
        /not connected|requires|not saved|not stored|nothing/i.test(
          b.note ?? "",
        ) ||
        b.fields.length === 0;

      assert.ok(
        disclosed,
        `${p.id}: form "${b.submit}" does not disclose that it is not connected`,
      );
    }
  }

  for (const [name, items] of Object.entries(collections)) {
    assert.doesNotMatch(JSON.stringify(items), claim, name);
  }
});

test("honesty: demo pages carry a status other than 'existing' and AI tools show a fixed sample", () => {
  const tools = pages.flatMap((p) =>
    p.blocks
      .filter((b) => b.kind === "tool")
      .map((b) => [p, b]),
  );

  assert.ok(tools.length >= 18);

  for (const [p, b] of tools) {
    assert.ok(b.sample.items.length >= 2, p.id);
    assert.notEqual(p.status, "existing");

    const warned = p.blocks.some(
      (x) =>
        x.kind === "notice" &&
        /not generated by AI/i.test(x.body) &&
        /hand-written/i.test(x.body),
    );

    assert.ok(
      warned,
      `${p.id}: a tool page must say up front that its result is a fixed sample, not AI`,
    );
  }

  const aiPages = pages.filter(
    (p) =>
      p.module === "ai" &&
      p.id !== "ai" &&
      p.id !== "ai-chat" &&
      p.id !== "ai-history" &&
      p.id !== "ai-prompts",
  );

  assert.ok(aiPages.length >= 20);
});

test("admin demo pages live under /admin (covered by the real admin layout)", () => {
  for (const p of pages.filter((x) => x.module === "admin")) {
    assert.ok(
      p.route.startsWith("/admin/") || p.route === "/admin",
      p.id,
    );
  }

  assert.ok(
    pages.filter(
      (p) => p.module === "admin" && p.status !== "existing",
    ).length >= 22,
  );
});

test("docs/FRONTEND_*.md are up to date with the registry", () => {
  const { routes, backend } = require(
    path.join(root, "scripts/render-frontend-docs.cjs"),
  );

  const a = fs.readFileSync(
    path.join(root, "docs/FRONTEND_ROUTES_AND_MODULES.md"),
    "utf8",
  );

  const b = fs.readFileSync(
    path.join(root, "docs/FRONTEND_BACKEND_REQUIREMENTS.md"),
    "utf8",
  );

  assert.equal(
    a,
    routes({ pages, moduleTitle, coverage, allConcreteRoutes }) + "\n",
    "out of date: run pnpm docs:frontend",
  );

  assert.equal(
    b,
    backend({
      pages,
      moduleTitle,
      moduleBackend,
      collections,
      collectionBase,
    }) + "\n",
    "out of date: run pnpm docs:frontend",
  );
});