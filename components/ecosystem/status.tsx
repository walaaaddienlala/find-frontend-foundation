import { Badge } from "@/components/ui/badge";
import { frontendStatusLabel, type FrontendStatus } from "@/lib/ecosystem/types";

const variant = {
  existing: "success",
  frontend_complete: "info",
  frontend_partial: "warning",
  requires_integration: "cta",
  coming_soon: "neutral",
} as const;

export function StatusBadge({ status }: { status: FrontendStatus }) {
  return <Badge variant={variant[status]}>{frontendStatusLabel[status]}</Badge>;
}

export function SampleBadge() {
  return <Badge variant="neutral">Sample</Badge>;
}

export const statusBanner: Record<Exclude<FrontendStatus, "existing">, string> = {
  frontend_complete: "Demo preview. The frontend for this page is complete; the backend is pending. Content marked Sample is not real, and nothing here is saved or sent.",
  frontend_partial: "Partly functional. Parts that use real Find data say so; the rest is a demo preview with sample content.",
  requires_integration: "Requires external integration. This page is not connected yet: nothing is saved, uploaded, sent or booked.",
  coming_soon: "Coming soon. This part of Find is planned and not available yet.",
};
