/** Renders the frontend documentation from the compiled ecosystem registry. Used by the generator and the drift test. */
const label = { existing: "Existing functional", frontend_complete: "Frontend complete — backend pending", frontend_partial: "Frontend partial", requires_integration: "Requires external integration", coming_soon: "Coming soon" };

function routes({ pages, moduleTitle, coverage, allConcreteRoutes }) {
  const counts = {};
  for (const p of pages) counts[p.status] = (counts[p.status] || 0) + 1;
  const concrete = allConcreteRoutes();
  const out = [
    "# Find — Frontend Routes and Modules (generated)", "",
    "> Generated from `lib/ecosystem/*` by `pnpm docs:frontend`. Do not edit by hand; a test fails if this file is out of date.", "",
    `**${pages.length} page definitions · ${concrete.length} concrete URLs** (dynamic pages expand to one URL per sample item). Statuses: ` + Object.entries(counts).map(([k, v]) => `${label[k]} ${v}`).join(" · "), "",
    "Sample data is labelled in the UI and never presented as real. Forms validate input but do not save or send anything unless a page is marked *Existing functional*.", "",
  ];
  for (const [moduleId, title] of Object.entries(moduleTitle)) {
    const list = pages.filter((p) => p.module === moduleId);
    if (!list.length) continue;
    out.push(`## ${title}`, "", "| Page | Route | Status |", "|---|---|---|");
    for (const p of list) out.push(`| ${p.title} | \`${p.route}\` | ${label[p.status]} |`);
    out.push("");
  }
  out.push("## Coverage map: every item in the product spec → route", "", "| Module | Item | Route |", "|---|---|---|");
  for (const c of coverage) out.push(`| ${c.module} | ${c.item} | \`${c.route}\` |`);
  return out.join("\n");
}

function backend({ pages, moduleTitle, moduleBackend, collections, collectionBase }) {
  const out = [
    "# Find — Backend Requirements for the Frontend Ecosystem (generated)", "",
    "> Generated from `lib/ecosystem/registry.ts` by `pnpm docs:frontend`. The frontend is built; this lists what the development team must implement behind each module.", "",
    "## Per module", "",
  ];
  for (const [moduleId, title] of Object.entries(moduleTitle)) {
    const list = pages.filter((p) => p.module === moduleId && p.status !== "existing");
    if (!list.length) continue;
    const by = {};
    for (const p of list) by[p.status] = (by[p.status] || 0) + 1;
    out.push(`### ${title}`, "", `Pages: ${list.length} (` + Object.entries(by).map(([k, v]) => `${label[k]} ${v}`).join(", ") + ")", "");
    for (const item of moduleBackend[moduleId]) out.push(`- ${item}`);
    const integ = list.filter((p) => p.status === "requires_integration").map((p) => `\`${p.route}\``);
    if (integ.length) out.push("", `Pages that cannot work without an external integration: ${integ.join(", ")}`);
    out.push("");
  }
  out.push("## Suggested API contract for the sample collections", "",
    "Sample data lives in `lib/ecosystem/demo.ts` with one uniform shape (`DemoItem`: slug, title, subtitle, summary, tags, meta pairs, sections). Replace each collection with an API-backed source returning the same shape (or extend the shape and the renderer together). These endpoints are **suggestions, not implemented**.", "",
    "| Collection | Detail path (frontend) | Suggested list | Suggested detail | Sample items |", "|---|---|---|---|---|");
  for (const [name, items] of Object.entries(collections)) out.push(`| ${name} | \`${collectionBase[name]}/[slug]\` | \`GET /api/${name}?q=&tag=&page=\` | \`GET /api/${name}/{slug}\` | ${items.length} |`);
  out.push("", "## Rules for replacing sample data", "",
    "- Real records must come from authorized services with RLS or equivalent; never expose private fields.",
    "- Remove the `Sample` badge only for records that are real; keep demo pages' status banner until the page is fully backed.",
    "- Keep forms honest: a form may say it saved or sent something only after the server confirmed it.",
    "- Do not run production SQL migrations from the frontend work; use the reviewed proposals in `supabase/migrations-drafts/proposed/`.");
  return out.join("\n");
}

module.exports = { routes, backend };
