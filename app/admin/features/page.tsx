import type { Metadata } from "next";

import { FeatureStatusBadge } from "@/components/features/feature-status-badge";
import { StatusBadge } from "@/components/ecosystem/status";
import { pages } from "@/lib/ecosystem/registry";
import { frontendStatusLabel, type FrontendStatus } from "@/lib/ecosystem/types";
import { features, summarizeFeatures } from "@/lib/features/registry";

export const metadata: Metadata = { title: "Feature status", robots: { index: false } };

// Admin access is enforced by app/admin/layout.tsx (auth + has_role).
export default function AdminFeaturesPage() {
  const counts = summarizeFeatures();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Feature status</h1>
        <p className="text-sm text-muted-foreground">
          Generated from lib/features/registry.ts. Update the registry when a feature changes state.
        </p>
      </div>

      <ul className="flex flex-wrap gap-4 text-sm">
        {(Object.keys(counts) as Array<keyof typeof counts>).map((status) => (
          <li key={status} className="flex items-center gap-2">
            <FeatureStatusBadge status={status} /> {counts[status]}
          </li>
        ))}
      </ul>

      <section aria-labelledby="frontend-status" className="flex flex-col gap-3">
        <h2 id="frontend-status" className="text-lg font-semibold">Frontend ecosystem ({pages.length} pages)</h2>
        <ul className="flex flex-wrap gap-4 text-sm">
          {(Object.keys(frontendStatusLabel) as FrontendStatus[]).map((status) => (
            <li key={status} className="flex items-center gap-2">
              <StatusBadge status={status} /> {pages.filter((page) => page.status === status).length}
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">Page list: docs/FRONTEND_ROUTES_AND_MODULES.md. Backend work per module: docs/FRONTEND_BACKEND_REQUIREMENTS.md.</p>
      </section>

      <h2 className="text-lg font-semibold">Backend features</h2>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-surface">
            <tr>
              <th className="p-3">Feature</th>
              <th className="p-3">Area</th>
              <th className="p-3">Phase</th>
              <th className="p-3">Status</th>
              <th className="p-3">Route</th>
              <th className="p-3">Migration (proposed)</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature) => (
              <tr key={feature.id} className="border-b border-border last:border-b-0">
                <td className="p-3 font-medium">{feature.title}</td>
                <td className="p-3">{feature.area}</td>
                <td className="p-3">{feature.phase}</td>
                <td className="p-3"><FeatureStatusBadge status={feature.status} /></td>
                <td className="p-3">{feature.route ? <code>{feature.route}</code> : "—"}</td>
                <td className="p-3">{feature.migration ? <code>{feature.migration}</code> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
