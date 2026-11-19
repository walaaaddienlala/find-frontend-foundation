/**
 * Route and link crawler. Usage: node scripts/crawl-routes.cjs http://127.0.0.1:3000
 * (requires `pnpm test:scaffold` or `pnpm docs:features` first so the registry is compiled).
 * 1) requests every route in the ecosystem registry plus the explicit static routes;
 * 2) follows every internal link found on every page it fetched;
 * Fails (exit 1) on any 404/5xx. Gated routes may redirect (307/308).
 */
const path = require("node:path");
const { allConcreteRoutes } = require(path.resolve(__dirname, "../.scaffold-test-build/lib/ecosystem/resolve.js"));

const base = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/$/, "");
const explicit = ["/", "/about", "/how-it-works", "/get-started", "/sign-in", "/opportunities", "/compare", "/deadlines", "/dashboard", "/saved", "/applications", "/admin", "/admin/opportunities", "/admin/features", "/admin/team"];
const gated = (route) => route.startsWith("/admin") || ["/dashboard", "/saved", "/applications"].includes(route);

async function get(route) {
  try {
    const res = await fetch(base + route, { redirect: "manual" });
    return { status: res.status, body: res.status === 200 ? await res.text() : "" };
  } catch (error) {
    return { status: 0, body: "", error: String(error) };
  }
}

async function pool(items, size, fn) {
  const results = new Map();
  let i = 0;
  await Promise.all(Array.from({ length: size }, async () => { while (i < items.length) { const item = items[i++]; results.set(item, await fn(item)); } }));
  return results;
}

(async () => {
  const routes = [...new Set([...explicit, ...allConcreteRoutes().map((r) => r.route)])];
  const first = await pool(routes, 8, get);
  const failures = [];
  const links = new Set();

  for (const [route, { status, body, error }] of first) {
    const ok = status === 200 || (gated(route) && (status === 307 || status === 308));
    if (!ok) failures.push(`ROUTE ${route} -> ${status}${error ? ` ${error}` : ""}`);
    for (const m of body.matchAll(/href="(\/[^"#?]*)/g)) links.add(m[1]);
  }

  const toCheck = [...links].filter((l) => !first.has(l) && !l.startsWith("/_next") && !/\.[a-z0-9]{2,5}$/i.test(l) && !l.startsWith("/api/"));
  const second = await pool(toCheck, 8, get);
  for (const [link, { status }] of second) {
    const ok = status === 200 || ((gated(link)) && (status === 307 || status === 308));
    if (!ok) failures.push(`LINK ${link} -> ${status}`);
  }

  const codes = {};
  for (const { status } of [...first.values(), ...second.values()]) codes[status] = (codes[status] || 0) + 1;
  console.log(`routes requested: ${routes.length}; extra internal links followed: ${toCheck.length}; unique links seen: ${links.size}`);
  console.log("status codes:", JSON.stringify(codes));
  console.log(failures.length ? `FAILURES (${failures.length}):\n${failures.slice(0, 40).join("\n")}` : "No dead routes or links.");
  process.exit(failures.length ? 1 : 0);
})();
