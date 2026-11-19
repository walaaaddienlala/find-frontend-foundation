import Link from "next/link";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatDeadline } from "@/lib/format";
import { buildComparisonRows } from "@/lib/opportunities/compare";
import { fundingTypeLabel } from "@/lib/opportunities/labels";
import { opportunityTypeLabel, workModeLabel } from "@/lib/status";
import type { Opportunity } from "@/lib/types";

function Cell({ value }: { value: string | string[] }) {
  if (!Array.isArray(value)) return <>{value}</>;
  if (value.length === 0) return <span className="text-muted-foreground">Not listed</span>;

  return (
    <ul className="flex list-disc flex-col gap-1 pl-4">
      {value.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function ComparisonTable({
  opportunities,
  removeHref,
}: {
  opportunities: Opportunity[];
  removeHref: (id: string) => string;
}) {
  const rows = buildComparisonRows(opportunities, {
    type: (value) => opportunityTypeLabel[value],
    workMode: (value) => workModeLabel[value],
    funding: (value) => fundingTypeLabel[value],
    date: formatDeadline,
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <caption className="sr-only">Side-by-side comparison of selected opportunities</caption>
        <thead>
          <tr className="border-b border-border bg-surface">
            <th scope="col" className="w-40 p-4 font-medium text-muted-foreground">
              Opportunity
            </th>
            {opportunities.map((opportunity) => (
              <th key={opportunity.id} scope="col" className="min-w-52 p-4 align-top">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/opportunities/${opportunity.id}`}
                    className="font-semibold underline-offset-4 hover:underline"
                  >
                    {opportunity.title}
                  </Link>
                  <Link
                    href={removeHref(opportunity.id)}
                    aria-label={`Remove ${opportunity.title} from comparison`}
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-border last:border-b-0">
              <th scope="row" className="p-4 align-top font-medium">
                <div className="flex flex-col items-start gap-1">
                  {row.label}
                  {row.differs ? <Badge variant="info">Differs</Badge> : null}
                  {row.note ? (
                    <span className="text-xs font-normal text-muted-foreground">{row.note}</span>
                  ) : null}
                </div>
              </th>
              {row.values.map((value, index) => (
                <td key={opportunities[index].id} className="p-4 align-top">
                  <Cell value={value} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
