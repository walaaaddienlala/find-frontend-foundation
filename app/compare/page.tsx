import type { Metadata } from "next";

import { ComparePicker } from "@/components/compare/compare-picker";
import { ComparisonTable } from "@/components/compare/comparison-table";
import { Container, PageHeader, Section } from "@/components/layout/page-container";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { getOpportunitiesPage, getOpportunityById } from "@/lib/data/opportunities";
import { COMPARE_MAX, COMPARE_MIN, parseCompareIds } from "@/lib/opportunities/compare";
import { clampPage, sanitizeSearchTerm } from "@/lib/opportunities/search";
import type { Opportunity } from "@/lib/types";

export const metadata: Metadata = {
  title: "Compare Opportunities",
  description: "Compare funding, eligibility, deadlines and requirements side by side.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  ids?: string | string[];
  q?: string;
  page?: string;
}>;

export default async function ComparePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const { ids, truncated, invalidCount } = parseCompareIds(params.ids);
  const query = sanitizeSearchTerm(params.q);
  const page = clampPage(params.page);

  const [list, selectedResults] = await Promise.all([
    getOpportunitiesPage({ page, pageSize: 12, query }),
    Promise.all(ids.map((id) => getOpportunityById(id))),
  ]);

  const selected = selectedResults.filter(
    (item): item is Opportunity => item !== undefined,
  );
  const missingCount = ids.length - selected.length;
  const buildRemoveHref = (id: string) => {
    const next = new URLSearchParams();
    for (const keep of ids.filter((value) => value !== id)) next.append("ids", keep);
    if (query) next.set("q", query);
    const suffix = next.toString();
    return suffix ? `/compare?${suffix}` : "/compare";
  };

  const notices = [
    truncated ? `Only the first ${COMPARE_MAX} opportunities are compared.` : null,
    invalidCount > 0 ? `${invalidCount} invalid selection(s) were ignored.` : null,
    missingCount > 0 ? `${missingCount} selected opportunity(ies) could not be found or are not published.` : null,
  ].filter(Boolean);

  return (
    <>
      <PageHeader
        eyebrow="Compare"
        title="Compare Opportunities"
        description="Pick 2–4 opportunities to see funding, eligibility, deadlines and requirements side by side."
      />

      <Section className="pt-8 sm:pt-10 lg:pt-12">
        <Container className="flex flex-col gap-8">
          {notices.length > 0 ? (
            <div role="status" className="rounded-lg border border-border bg-muted/50 p-3 text-sm">
              {notices.map((notice) => (
                <p key={notice}>{notice}</p>
              ))}
            </div>
          ) : null}

          {selected.length >= COMPARE_MIN ? (
            <ComparisonTable opportunities={selected} removeHref={buildRemoveHref} />
          ) : (
            <EmptyState
              title="Choose at least two opportunities"
              description="Select opportunities below, then update the comparison. The URL can be shared."
            />
          )}

          {list.ok ? (
            list.items.length > 0 || query ? (
              <ComparePicker
                items={list.items}
                selectedIds={selected.map((item) => item.id)}
                query={query}
                page={list.page}
                pageCount={list.pageCount}
              />
            ) : (
              <EmptyState title="No published opportunities yet" />
            )
          ) : (
            <ErrorState
              title="Opportunities are unavailable"
              description="We couldn’t load the opportunity list. Please try again shortly."
            />
          )}
        </Container>
      </Section>
    </>
  );
}
