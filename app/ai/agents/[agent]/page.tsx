import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAgent } from "@/lib/ai/agents";

export const metadata: Metadata = {
  title: "AI Agent Details | Find",
  description: "Learn about Find AI agents, their capabilities, and permissions.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page({
  params,
}: {
  params: Promise<{ agent: string }>;
}) {
  const { agent: agentId } = await params;
  const agent = getAgent(agentId);

  if (!agent) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
      <div>
        <Link
          href="/ai"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Back to Find AI
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
        <p className="mt-2 text-muted-foreground">{agent.purpose}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Information</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 text-sm">
          <div>
            <p className="font-semibold">Status</p>
            <p className="text-muted-foreground capitalize">{agent.status}</p>
          </div>

          <div>
            <p className="font-semibold">Development Phase</p>
            <p className="text-muted-foreground">{agent.phase}</p>
          </div>

          <div>
            <p className="font-semibold">Permitted Data</p>
            <p className="text-muted-foreground">
              {agent.permittedData.length > 0
                ? agent.permittedData.join(", ")
                : "No data access specified."}
            </p>
          </div>

          <div>
            <p className="font-semibold">Can Read User Data</p>
            <p className="text-muted-foreground">
              {agent.permittedData.length > 0 ? "Yes, within its defined permissions" : "No"}
            </p>
          </div>

          <div>
            <p className="font-semibold">Can Write User Data</p>
            <p className="text-muted-foreground">
              {agent.canWriteUserData
                ? "Yes, only with your approval"
                : "No"}
            </p>
          </div>

          <div>
            <p className="font-semibold">User Approval Required</p>
            <p className="text-muted-foreground">
              {agent.requiresUserApproval ? "Yes" : "No"}
            </p>
          </div>

          <div>
            <p className="font-semibold">Can Submit Applications</p>
            <p className="text-muted-foreground">
              No. You always submit applications yourself.
            </p>
          </div>

          {agent.blockedBy ? (
            <div>
              <p className="font-semibold">Blocked By</p>
              <p className="text-muted-foreground">{agent.blockedBy}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}