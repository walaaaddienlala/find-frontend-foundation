/**
 * Valid application status transitions (pure; enforced server-side in
 * app/applications/actions.ts). IMPLEMENTED.
 *
 * Operates on the statuses the application currently accepts. `saved` is a
 * LEGACY status: saved opportunities live in saved_opportunities, so nothing may
 * be moved INTO `saved`; existing legacy rows can still move out of it.
 * Product statuses that are not yet allowed by the database (ready_to_apply,
 * under_review, withdrawn) are added here only after migration 009 is approved.
 */
export const applicationStatuses = [
  "saved",
  "preparing",
  "in_progress",
  "submitted",
  "interview",
  "accepted",
  "rejected",
  "waitlisted",
] as const;

export type TransitionStatus = (typeof applicationStatuses)[number];

const transitions: Record<TransitionStatus, readonly TransitionStatus[]> = {
  saved: ["preparing", "in_progress", "submitted"],
  preparing: ["in_progress", "submitted"],
  in_progress: ["preparing", "submitted"],
  // Undo paths: a user may have marked "submitted" by mistake.
  submitted: ["interview", "accepted", "rejected", "waitlisted", "preparing", "in_progress"],
  interview: ["accepted", "rejected", "waitlisted", "submitted"],
  waitlisted: ["interview", "accepted", "rejected"],
  // Decisions can be revised, but accepted <-> rejected directly is not allowed.
  accepted: ["interview", "waitlisted"],
  rejected: ["interview", "waitlisted"],
};

export function isKnownStatus(value: string): value is TransitionStatus {
  return (applicationStatuses as readonly string[]).includes(value);
}

export function allowedTransitions(from: string): readonly TransitionStatus[] {
  return isKnownStatus(from) ? transitions[from] : [];
}

export type TransitionCheck = { ok: true } | { ok: false; message: string };

/**
 * Re-selecting the current status is allowed (idempotent). A current status that
 * is not recognised (unexpected legacy data) never blocks a valid known target.
 */
export function validateTransition(from: string, to: string): TransitionCheck {
  if (!isKnownStatus(to)) return { ok: false, message: "Invalid application status." };
  if (from === to) return { ok: true };

  if (to === "saved") {
    return {
      ok: false,
      message: "Saved opportunities are kept separately. Use the save button instead of an application status.",
    };
  }

  if (!isKnownStatus(from)) return { ok: true };

  return transitions[from].includes(to)
    ? { ok: true }
    : { ok: false, message: `An application cannot move from ${from.replace("_", " ")} to ${to.replace("_", " ")}.` };
}

/** UI helper: which statuses the select should offer for an application currently in `current`. */
export function isStatusSelectable(current: string, target: string): boolean {
  if (target === current) return true;
  if (!isKnownStatus(target)) return false;
  if (!isKnownStatus(current)) return target !== "saved";

  return transitions[current].includes(target);
}
