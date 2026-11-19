import { daysUntil } from "../opportunities/deadlines";

/**
 * Rule-based "next best action" for the dashboard. IMPLEMENTED and deliberately
 * NOT AI: every action is explainable from the user's own application data.
 * AI-ranked recommendations are PENDING (Find AI phase).
 */
export type DashboardApplication = {
  id: string;
  title: string;
  status: string;
  deadline: string | null;
  progress: number;
};

export type NextAction = {
  id: string;
  priority: number;
  title: string;
  detail: string;
  href: string;
};

const PRE_SUBMISSION = ["saved", "preparing", "in_progress", "ready_to_apply"];

export function isPreSubmission(status: string): boolean {
  return PRE_SUBMISSION.includes(status);
}

export function computeNextActions(
  applications: DashboardApplication[],
  now: Date = new Date(),
  limit = 3,
): NextAction[] {
  if (applications.length === 0) {
    return [
      {
        id: "start-first-application",
        priority: 5,
        title: "Start tracking your first application",
        detail: "Pick an opportunity and begin tracking it to get a checklist and reminders.",
        href: "/opportunities",
      },
    ];
  }

  const actions: NextAction[] = [];

  for (const application of applications) {
    if (!isPreSubmission(application.status)) continue;

    const days = daysUntil(application.deadline, now);
    if (days === null) continue;

    if (days < 0) {
      actions.push({
        id: `passed-${application.id}`,
        priority: 3,
        title: `Deadline passed: ${application.title}`,
        detail: "Review this application and update its status or withdraw it.",
        href: "/applications",
      });
    } else if (days <= 7) {
      actions.push({
        id: `due-soon-${application.id}`,
        priority: 1,
        title: `${application.title}: due ${days === 0 ? "today" : `in ${days} day${days === 1 ? "" : "s"}`}`,
        detail: `Preparation is ${application.progress}% complete.`,
        href: "/applications",
      });
    } else if (days <= 21 && application.progress < 50) {
      actions.push({
        id: `behind-${application.id}`,
        priority: 2,
        title: `Make progress on ${application.title}`,
        detail: `${days} days left and preparation is ${application.progress}% complete.`,
        href: "/applications",
      });
    }
  }

  return actions
    .sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title))
    .slice(0, limit);
}
