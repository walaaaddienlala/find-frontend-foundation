/** Renders docs/FEATURE_STATUS.md from the compiled registry. Used by the generator and by the drift test. */
function render(features, summarize) {
  const counts = summarize(features);
  const lines = [
    "# Find — Feature Status (generated)",
    "",
    "> Generated from `lib/features/registry.ts` by `pnpm docs:features`. Do not edit by hand; a test fails if this file is out of date.",
    "",
    "Totals: " + Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(" · "),
    "",
    "| Feature | Area | Phase | Status | Route | Proposed migration |",
    "|---|---|---|---|---|---|",
    ...features.map((f) => `| ${f.title} | ${f.area} | ${f.phase} | ${f.status} | ${f.route ? "`" + f.route + "`" : "—"} | ${f.migration ? "`" + f.migration + "`" : "—"} |`),
    "",
    "## Parts",
    "",
  ];

  for (const f of features) {
    lines.push(`### ${f.title} (${f.status})`, "");
    for (const p of f.parts) lines.push(`- **${p.status}** — ${p.label}${p.note ? ` _(${p.note})_` : ""}`);
    lines.push("");
  }

  return lines.join("\n");
}

module.exports = { render };
