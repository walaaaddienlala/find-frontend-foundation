import type { Metadata } from "next";
import Link from "next/link";

import { Blocks, type Search } from "@/components/ecosystem/blocks";
import { StatusBadge, statusBanner } from "@/components/ecosystem/status";
import { Container, PageHeader, Section } from "@/components/layout/page-container";
import { categoryLabel, resolveRoute, type Resolved } from "@/lib/ecosystem/resolve";
import { breadcrumbsFor, childrenOf, getPage, moduleBackend, moduleRoots, moduleTitle } from "@/lib/ecosystem/registry";

export function pageTitle(resolved: Resolved): string {
  if (resolved.item) return resolved.item.title;
  if (resolved.page.id === "opportunity-category") return categoryLabel[Object.values(resolved.params)[0]] ?? resolved.page.title;
  return resolved.page.title;
}

/** Ecosystem pages carry sample content, so they are not indexed. */
export function ecosystemMetadata(path: string): Metadata {
  const resolved = resolveRoute(path);
  return resolved
    ? { title: pageTitle(resolved), description: resolved.page.summary, robots: { index: false, follow: true } }
    : { title: "Not found" };
}

/** Pages only read searchParams when they need them, so the rest can be statically generated. */
export function needsSearch(path: string): boolean {
  const resolved = resolveRoute(path);
  return Boolean(resolved?.page.blocks.some((b) => b.kind === "live" || (b.kind === "collection" && b.filter && !b.limit && !b.tag)) || resolved?.page.blocks.some((b) => b.kind === "collection" && b.filter && !b.limit));
}

export async function EcosystemPage({ resolved, path, search }: { resolved: Resolved; path: string; search: Search }) {
  const { page, params, item } = resolved;
  const title = pageTitle(resolved);
  const crumbs = breadcrumbsFor(page);
  const rootIds = moduleRoots[page.module] ?? [];
  const chips = rootIds.flatMap((rootId) => {
    const root = getPage(rootId);
    return root ? [root, ...childrenOf(rootId)] : [];
  }).filter((p, i, all) => all.findIndex((x) => x.id === p.id) === i);
  const backend = page.backend ?? moduleBackend[page.module];

  return (
    <>
      <PageHeader eyebrow={moduleTitle[page.module]} title={title} description={item ? item.subtitle : page.summary} />
      <Section className="pt-6 sm:pt-8">
        <Container className="flex flex-col gap-6">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:underline">Home</Link>
            {crumbs.map((crumb) => <span key={crumb.id} className="flex items-center gap-1">/ <Link href={crumb.route.replace(/\[[^\]]+\]/, "")} className="hover:underline">{crumb.title}</Link></span>)}
            <span aria-current="page" className="flex items-center gap-1">/ <span className="text-foreground">{title}</span></span>
          </nav>

          {chips.length > 1 ? (
            <nav aria-label={`${moduleTitle[page.module]} sections`} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {chips.map((chip) => (
                <Link key={chip.id} href={chip.route.replace(/\[[^\]]+\]/, "")} aria-current={chip.id === page.id ? "page" : undefined} className={`whitespace-nowrap rounded-full border px-3 py-1 text-sm ${chip.id === page.id ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>{chip.title}</Link>
              ))}
            </nav>
          ) : null}

          {page.status !== "existing" ? (
            <div role="note" className="flex flex-col gap-2 rounded-xl border border-border bg-muted/40 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p>{statusBanner[page.status]}</p>
              <StatusBadge status={page.status} />
            </div>
          ) : null}

          {page.audience ? <p className="text-sm text-muted-foreground">Designed for: {page.audience}. This is a demo view; it does not grant or imply any access.</p> : null}

          <Blocks blocks={page.blocks} page={page} path={path} params={params} item={item} search={search} />

          {page.status !== "existing" ? (
            <details className="rounded-xl border border-border p-4 text-sm">
              <summary className="cursor-pointer font-medium">Backend requirements for the development team</summary>
              <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">{backend.map((b) => <li key={b}>{b}</li>)}</ul>
            </details>
          ) : null}
        </Container>
      </Section>
    </>
  );
}
