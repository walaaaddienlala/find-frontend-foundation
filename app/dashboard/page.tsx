import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { FeatureStatusBadge } from "@/components/features/feature-status-badge";
import { DeadlineList } from "@/components/deadlines/deadline-list";
import { Container, PageHeader, Section } from "@/components/layout/page-container";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { computeNextActions, isPreSubmission } from "@/lib/dashboard/next-actions";
import { getSavedOpportunities, getUserApplications } from "@/lib/data/applications";
import { isSupabaseConfigured } from "@/lib/env";
import { getFeature } from "@/lib/features/registry";
import { upcomingDeadlines } from "@/lib/opportunities/deadlines";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Find overview: saved opportunities, applications and next actions.",
};

export const dynamic = "force-dynamic";

const SUBMITTED = ["submitted", "interview", "waitlisted"];
const DECIDED = ["accepted", "rejected"];

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <Section>
        <Container>
          <ErrorState title="Dashboard unavailable" description="This environment is not connected to Supabase." />
        </Container>
      </Section>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/sign-in?redirectTo=/dashboard");

  let applications: Awaited<ReturnType<typeof getUserApplications>> = [];
  let saved: Awaited<ReturnType<typeof getSavedOpportunities>> = [];
  let failed = false;

  try {
    [applications, saved] = await Promise.all([getUserApplications(), getSavedOpportunities()]);
  } catch {
    failed = true;
  }

  const now = new Date();
  const dated = applications.map((application) => ({
    id: application.id,
    title: application.opportunity.title,
    status: application.status as string,
    deadline: application.applicationDeadline ?? application.opportunity.deadline,
    progress: application.preparationProgress,
  }));
  const nextActions = computeNextActions(dated, now);
  const deadlines = upcomingDeadlines(
    dated
      .filter((application) => isPreSubmission(application.status))
      .map((application) => ({ ...application, kind: "application" as const })),
    now,
    30,
  ).slice(0, 5);

  const stats = [
    { label: "Saved opportunities", value: saved.length, href: "/saved" },
    { label: "Preparing", value: dated.filter((a) => isPreSubmission(a.status)).length, href: "/applications" },
    { label: "Submitted / in review", value: dated.filter((a) => SUBMITTED.includes(a.status)).length, href: "/applications" },
    { label: "Decisions received", value: dated.filter((a) => DECIDED.includes(a.status)).length, href: "/applications" },
  ];

  const pending = (getFeature("dashboard")?.parts ?? []).filter((part) => part.status !== "implemented");

  return (
    <>
      <PageHeader
        eyebrow="Your Workspace"
        title="Dashboard"
        description="What should you do next? Your saved opportunities, applications and deadlines in one place."
      />

      <Section className="pt-8 sm:pt-10 lg:pt-12">
        <Container className="flex flex-col gap-8">
          {failed ? (
            <ErrorState title="We couldn’t load your dashboard" description="Please refresh the page to try again." />
          ) : (
            <>
              <section aria-label="Overview" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <Link key={stat.label} href={stat.href} className="rounded-xl border border-border p-4 hover:bg-muted/50">
                    <p className="text-3xl font-semibold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </Link>
                ))}
              </section>

              <section aria-labelledby="next" className="flex flex-col gap-3">
                <h2 id="next" className="text-xl font-semibold">Next best actions</h2>
                <p className="text-sm text-muted-foreground">Based only on your own application data. No AI is used here.</p>
                <ul className="flex flex-col gap-3">
                  {nextActions.length === 0 ? (
                    <li><EmptyState title="You’re on track" description="No urgent actions right now." /></li>
                  ) : (
                    nextActions.map((action) => (
                      <li key={action.id}>
                        <Card>
                          <CardHeader>
                            <CardTitle>{action.title}</CardTitle>
                            <CardDescription>{action.detail}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Link href={action.href} className={buttonVariants({ variant: "outline" })}>Open</Link>
                          </CardContent>
                        </Card>
                      </li>
                    ))
                  )}
                </ul>
              </section>

              <section aria-labelledby="deadlines" className="flex flex-col gap-3">
                <h2 id="deadlines" className="text-xl font-semibold">Upcoming deadlines</h2>
                {deadlines.length === 0 ? (
                  <EmptyState title="No upcoming application deadlines" />
                ) : (
                  <DeadlineList items={deadlines} />
                )}
                <Link href="/deadlines" className="text-sm underline-offset-4 hover:underline">See all deadlines</Link>
              </section>
            </>
          )}

          <section aria-labelledby="soon" className="flex flex-col gap-3">
            <h2 id="soon" className="text-xl font-semibold">Coming to your dashboard</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {pending.map((part) => (
                <li key={part.label} className="flex flex-wrap items-center gap-2">
                  <FeatureStatusBadge status={part.status} />
                  <span>{part.label}</span>
                  {part.note ? <span className="text-muted-foreground">({part.note})</span> : null}
                </li>
              ))}
            </ul>
          </section>
        </Container>
      </Section>
    </>
  );
}
