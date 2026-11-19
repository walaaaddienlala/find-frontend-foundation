import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatDeadline } from "@/lib/format";
import { COMPARE_MAX } from "@/lib/opportunities/compare";
import type { Opportunity } from "@/lib/types";

/**
 * Server-rendered GET form: works without JavaScript. Selected ids that are not
 * on the current result page are preserved as hidden inputs.
 */
export function ComparePicker({
  items,
  selectedIds,
  query,
  page,
  pageCount,
}: {
  items: Opportunity[];
  selectedIds: string[];
  query: string;
  page: number;
  pageCount: number;
}) {
  const visibleIds = new Set(items.map((item) => item.id));
  const hidden = selectedIds.filter((id) => !visibleIds.has(id));

  const pageHref = (target: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    for (const id of selectedIds) params.append("ids", id);
    params.set("page", String(target));
    return `/compare?${params.toString()}`;
  };

  return (
    <form method="get" action="/compare" className="flex flex-col gap-4">
      {hidden.map((id) => (
        <input key={id} type="hidden" name="ids" value={id} />
      ))}

      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="compare-search">
          Search opportunities
        </label>
        <input
          id="compare-search"
          name="q"
          defaultValue={query}
          placeholder="Search by title or organization"
          maxLength={80}
          className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
        />
        <Button type="submit">Update comparison</Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Select up to {COMPARE_MAX} opportunities.
      </p>

      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/50">
              <input
                type="checkbox"
                name="ids"
                value={item.id}
                defaultChecked={selectedIds.includes(item.id)}
                className="mt-1 size-4"
              />
              <span className="flex flex-col text-sm">
                <span className="font-medium">{item.title}</span>
                <span className="text-muted-foreground">
                  {item.organization} · Deadline {formatDeadline(item.deadline)}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>

      {pageCount > 1 ? (
        <nav aria-label="Pagination" className="flex items-center justify-between text-sm">
          {page > 1 ? <Link href={pageHref(page - 1)}>← Previous</Link> : <span />}
          <span className="text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? <Link href={pageHref(page + 1)}>Next →</Link> : <span />}
        </nav>
      ) : null}
    </form>
  );
}
