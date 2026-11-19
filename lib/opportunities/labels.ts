import type { FundingType } from "../types";

/** Shared funding labels for new pages. TODO(core): replace the three inline copies in opportunity-card, opportunity-browser and the detail page. */
export const fundingTypeLabel: Record<FundingType, string> = {
  fully_funded: "Fully funded",
  partially_funded: "Partially funded",
  unfunded: "Unfunded",
  no_fee: "No fee",
  unspecified: "Not specified",
};
