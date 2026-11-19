import Link from "next/link";

import { EmptyState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { getOpportunities, getOpportunitiesPage } from "@/lib/data/opportunities";
import { categoryLabel, categoryTypeMap } from "@/lib/ecosystem/resolve";
import { opportunityCategories } from "@/lib/ecosystem/demo";
import { formatDeadline } from "@/lib/format";
import { clampPage, sanitizeSearchTerm } from "@/lib/opportunities/search";
import { opportunityTypeLabel } from "@/lib/status";
import { opportunityTypes, type FundingType, type Opportunity, type OpportunityType } from "@/lib/types";

type Search = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

function OpportunityRows({ items }: { items: Opportunity[] }) {
  return (
    <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
      {items.map((item) => (
        <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
          <div className="flex flex-col">
            <Link href={`/opportunities/${item.id}`} className="font-medium underline-offset-4 hover:underline">{item.title}</Link>
            <span className="text-sm text-muted-foreground">{item.organization}{item.country ? ` · ${item.country}` : ""} · {opportunityTypeLabel[item.type]}</span>
          </div>
          <span className="text-sm text-muted-foreground">Deadline {formatDeadline(item.deadline)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Real counts from published opportunities. Categories the catalog cannot represent yet say so. */
export async function CategoriesLive() {
  const all = await getOpportunities();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {opportunityCategories.map(([slug, label]) => {
        const type = categoryTypeMap[slug];
        const count = type ? all.filter((item) => item.type === type).length : null;

        return (
          <Link key={slug} href={`/opportunities/category/${slug}`} className="rounded-xl border border-border p-4 hover:bg-muted/50">
            <p className="font-medium">{label}</p>
            <p className="text-sm text-muted-foreground">{count === null ? "Not supported by the catalog yet" : `${count} published`}</p>
          </Link>
        );
      })}
    </div>
  );
}

export async function CategoryLive({ slug }: { slug: string }) {
  const type = categoryTypeMap[slug] ?? null;

  if (!type) {
    return <EmptyState title={`No ${categoryLabel[slug] ?? "listings"} yet`} description="The opportunity catalog does not support this category yet, so nothing is listed. Nothing is invented to fill the page." />;
  }

  const page = await getOpportunitiesPage({ type, pageSize: 12 });
  if (!page.ok) return <ErrorState title="Opportunities are unavailable" description="We couldn’t load this category. Please try again shortly." />;
  if (page.items.length === 0) return <EmptyState title="No published opportunities in this category yet" />;

  return (
    <div className="flex flex-col gap-3">
      <OpportunityRows items={page.items} />
      <Link href="/opportunities" className="text-sm underline underline-offset-4">Browse all opportunities</Link>
    </div>
  );
}

export async function AdvancedSearchLive({ searchParams }: { searchParams: Search }) {
  const q = sanitizeSearchTerm(one(searchParams.q));
  const typeRaw = one(searchParams.type);
  const type = (opportunityTypes as readonly string[]).includes(typeRaw) ? (typeRaw as OpportunityType) : undefined;
  const fundingRaw = one(searchParams.funding);
  const funding = (["fully_funded", "partially_funded", "unfunded"] as const).includes(fundingRaw as never) ? (fundingRaw as FundingType) : undefined;
  const country = sanitizeSearchTerm(one(searchParams.country));
  const pageNumber = clampPage(one(searchParams.page));
  const searched = Boolean(q || type || funding || country);
  const result = searched ? await getOpportunitiesPage({ query: q, type, country: country || undefined, funding, page: pageNumber, pageSize: 10 }) : null;

  const href = (target: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q); if (type) params.set("type", type); if (funding) params.set("funding", funding); if (country) params.set("country", country);
    params.set("page", String(target));
    return `/opportunities/search?${params.toString()}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <form method="get" action="/opportunities/search" className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">Keywords<input name="q" defaultValue={q} maxLength={80} className="h-10 rounded-lg border border-input bg-background px-3" /></label>
        <label className="flex flex-col gap-1 text-sm">Type
          <select name="type" defaultValue={type ?? ""} className="h-10 rounded-lg border border-input bg-background px-3"><option value="">Any</option>{opportunityTypes.map((t) => <option key={t} value={t}>{opportunityTypeLabel[t]}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1 text-sm">Country<input name="country" defaultValue={country} maxLength={80} className="h-10 rounded-lg border border-input bg-background px-3" /></label>
        <label className="flex flex-col gap-1 text-sm">Funding
          <select name="funding" defaultValue={funding ?? ""} className="h-10 rounded-lg border border-input bg-background px-3"><option value="">Any</option><option value="fully_funded">Fully funded</option><option value="partially_funded">Partially funded</option><option value="unfunded">Unfunded</option></select>
        </label>
        <div className="sm:col-span-2 lg:col-span-4"><Button type="submit">Search</Button></div>
      </form>

      {!result ? <EmptyState title="Enter a search" description="Use any combination of keywords, type, country and funding." /> : !result.ok ? (
        <ErrorState title="Search is unavailable" description="We couldn’t reach the opportunity data. Please try again shortly." />
      ) : result.items.length === 0 ? <EmptyState title="No published opportunities match" /> : (
        <>
          <p className="text-sm text-muted-foreground">{result.total} result{result.total === 1 ? "" : "s"}</p>
          <OpportunityRows items={result.items} />
          {result.pageCount > 1 ? (
            <nav aria-label="Pagination" className="flex items-center justify-between text-sm">
              {result.page > 1 ? <Link href={href(result.page - 1)}>← Previous</Link> : <span />}
              <span className="text-muted-foreground">Page {result.page} of {result.pageCount}</span>
              {result.page < result.pageCount ? <Link href={href(result.page + 1)}>Next →</Link> : <span />}
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}

export async function DeadlineCalendarLive({ searchParams }: { searchParams: Search }) {
  const now = new Date();
  const match = /^(\d{4})-(\d{2})$/.exec(one(searchParams.month));
  const year = match ? Number(match[1]) : now.getUTCFullYear();
  const month = match ? Math.min(Math.max(Number(match[2]), 1), 12) - 1 : now.getUTCMonth();
  const all = await getOpportunities();
  const key = (y: number, m: number) => `${y}-${String(m + 1).padStart(2, "0")}`;
  const inMonth = all.filter((item) => item.deadline && item.deadline.slice(0, 7) === key(year, month));
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const offset = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const prev = month === 0 ? key(year - 1, 11) : key(year, month - 1);
  const next = month === 11 ? key(year + 1, 0) : key(year, month + 1);
  const label = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month, 1)));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link href={`/calendar?month=${prev}`} className="text-sm underline underline-offset-4">← Previous</Link>
        <h2 className="text-lg font-semibold">{label}</h2>
        <Link href={`/calendar?month=${next}`} className="text-sm underline underline-offset-4">Next →</Link>
      </div>
      <div className="overflow-x-auto">
        <div className="grid min-w-[640px] grid-cols-7 gap-px rounded-xl border border-border bg-border text-sm">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="bg-surface p-2 text-center font-medium">{d}</div>)}
          {Array.from({ length: offset }).map((_, i) => <div key={`o${i}`} className="bg-background p-2" />)}
          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const due = inMonth.filter((item) => Number(item.deadline.slice(8, 10)) === day);
            return (
              <div key={day} className="min-h-20 bg-background p-2">
                <span className="text-xs text-muted-foreground">{day}</span>
                {due.map((item) => <Link key={item.id} href={`/opportunities/${item.id}`} className="mt-1 block truncate rounded bg-muted px-1 text-xs hover:underline">{item.title}</Link>)}
              </div>
            );
          })}
        </div>
      </div>
      {inMonth.length === 0 ? <EmptyState title="No published deadlines this month" /> : null}
    </div>
  );
}
