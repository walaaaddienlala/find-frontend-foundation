import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatDeadline } from "@/lib/format";
import { classifyDeadline, type DatedItem } from "@/lib/opportunities/deadlines";

function daysLabel(days: number): string {
  if (days === 0) return "Today";
  return `${days} day${days === 1 ? "" : "s"} left`;
}

export function DeadlineList({ items }: { items: DatedItem[] }) {
  return (
    <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
      {items.map((item) => {
        const closing = classifyDeadline(item.daysRemaining) === "closing-soon";

        return (
          <li key={`${item.kind}-${item.id}`} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex flex-col">
              <Link
                href={item.kind === "application" ? "/applications" : `/opportunities/${item.id}`}
                className="font-medium underline-offset-4 hover:underline"
              >
                {item.title}
              </Link>
              <span className="text-sm text-muted-foreground">
                {formatDeadline(item.date)}
              </span>
            </div>
            <Badge variant={closing ? "warning" : "neutral"}>{daysLabel(item.daysRemaining)}</Badge>
          </li>
        );
      })}
    </ul>
  );
}
