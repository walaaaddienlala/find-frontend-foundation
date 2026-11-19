import { Badge } from "@/components/ui/badge";
import type { FeatureStatus, PartStatus } from "@/lib/features/registry";

const variants = {
  implemented: "success",
  partial: "info",
  scaffolded: "warning",
  pending: "neutral",
  blocked: "destructive",
  needs_config: "cta",
} as const;

const labels: Record<FeatureStatus | PartStatus, string> = {
  implemented: "Implemented",
  partial: "Partially implemented",
  scaffolded: "Scaffolded",
  pending: "Pending",
  blocked: "Blocked",
  needs_config: "Needs external configuration",
};

export function FeatureStatusBadge({ status }: { status: FeatureStatus | PartStatus }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
