/**
 * Deadline intelligence (pure). IMPLEMENTED: upcoming list, closing-soon
 * classification and overlap clusters. PENDING: preparation-time estimates and
 * "recommended start date" (need profile + checklist data) and change alerts
 * (need notifications). Deadlines are date-only strings (YYYY-MM-DD, UTC).
 */
export const CLOSING_SOON_DAYS = 14;
const DAY_MS = 86_400_000;

export type DeadlineItem = {
  id: string;
  title: string;
  deadline: string | null | undefined;
  kind: "opportunity" | "application";
};

export type DatedItem = DeadlineItem & { date: string; daysRemaining: number };

function toUtcDay(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;

  const [, y, m, d] = match;
  const time = Date.UTC(Number(y), Number(m) - 1, Number(d));

  return Number.isNaN(time) ? null : time;
}

export function daysUntil(
  deadline: string | null | undefined,
  now: Date = new Date(),
): number | null {
  const target = toUtcDay(deadline);
  if (target === null) return null;

  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  return Math.round((target - today) / DAY_MS);
}

export function classifyDeadline(
  days: number | null,
): "unknown" | "passed" | "closing-soon" | "open" {
  if (days === null) return "unknown";
  if (days < 0) return "passed";
  return days <= CLOSING_SOON_DAYS ? "closing-soon" : "open";
}

/** Items with a valid deadline from today up to `windowDays` ahead, soonest first. */
export function upcomingDeadlines(
  items: DeadlineItem[],
  now: Date = new Date(),
  windowDays = 60,
): DatedItem[] {
  return items
    .flatMap((item) => {
      const days = daysUntil(item.deadline, now);
      if (days === null || days < 0 || days > windowDays) return [];
      return [{ ...item, date: (item.deadline as string).slice(0, 10), daysRemaining: days }];
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining || a.title.localeCompare(b.title));
}

/**
 * Groups items whose consecutive deadlines fall within `gapDays` of each other
 * so users can see competing deadlines. Single items are not clusters.
 */
export function findDeadlineClusters(
  items: DatedItem[],
  gapDays = 3,
): DatedItem[][] {
  const sorted = [...items].sort((a, b) => a.daysRemaining - b.daysRemaining);
  const clusters: DatedItem[][] = [];
  let current: DatedItem[] = [];

  for (const item of sorted) {
    const last = current[current.length - 1];

    if (last && item.daysRemaining - last.daysRemaining <= gapDays) {
      current.push(item);
    } else {
      if (current.length > 1) clusters.push(current);
      current = [item];
    }
  }

  if (current.length > 1) clusters.push(current);

  return clusters;
}
