/**
 * Non-negotiable AI rules as code. IMPLEMENTED and tested; every future agent
 * implementation must pass through these.
 */
export const AI_RULES = [
  "Never invent or infer a user's achievements, experience, skills or personal history.",
  "Ground opportunity answers in stored, verified opportunity data and cite its official source.",
  "Label uncertainty; match scores and readiness are estimates, not eligibility decisions or acceptance odds.",
  "Never submit an application. The user must approve the exact final version first.",
  "Stop at CAPTCHA, MFA or site restrictions; never bypass access controls.",
  "Never expose one user's data to another user.",
  "Keep provider keys server-side; log metadata only, never raw document content.",
] as const;

/**
 * True only when the user approved precisely the version being submitted.
 * A stale approval (version changed after approval) must fail.
 */
export function canSubmitApplication(input: {
  userApprovedFinalVersion: boolean;
  approvedVersionId: string | null;
  currentVersionId: string;
}): boolean {
  return (
    input.userApprovedFinalVersion &&
    input.approvedVersionId !== null &&
    input.approvedVersionId === input.currentVersionId
  );
}
