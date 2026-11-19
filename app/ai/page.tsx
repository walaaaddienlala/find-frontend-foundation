import Link from "next/link";

import { FeatureScaffoldPage, scaffoldMetadata } from "@/components/features/feature-scaffold";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { agents } from "@/lib/ai/agents";
import { AI_RULES } from "@/lib/ai/guardrails";

// SCAFFOLD: lib/features/registry.ts ("find-ai"). The agent list below is real
// registry data; no agent can be run yet (no provider is configured).
export const metadata = scaffoldMetadata("find-ai");

export default function Page() {
  return (
    <FeatureScaffoldPage featureId="find-ai">
      <Card>
        <CardHeader>
          <CardTitle>Planned agents</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ul className="grid gap-3 sm:grid-cols-2">
            {agents.map((agent) => (
              <li key={agent.id} className="rounded-lg border border-border p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <Link href={`/ai/${agent.id}`} className="font-medium underline-offset-4 hover:underline">
                    {agent.name}
                  </Link>
                  <Badge variant={agent.status === "blocked" ? "destructive" : "neutral"}>
                    {agent.status === "blocked" ? "Blocked" : "Pending"}
                  </Badge>
                </div>
                <p className="mt-1 text-muted-foreground">{agent.purpose}</p>
              </li>
            ))}
          </ul>
          <div>
            <p className="text-sm font-medium">Rules every agent must follow</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
              {AI_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </FeatureScaffoldPage>
  );
}
