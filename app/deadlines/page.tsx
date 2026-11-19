import type { Metadata } from "next";
import Link from "next/link";

import { DeadlineList } from "@/components/deadlines/deadline-list";
import { Container, PageHeader, Section } from "@/components/layout/page-container";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { buttonVariants } from "@/components/ui/button";
import { getUserApplications } from "@/lib/data/applications";
import { getOpportunities } from "@/lib/data/opportunities";
import { isPreSubmission } from "@/lib/dashboard/next-actions";
import { isSupabaseConfigured } from "@/lib/env";
import {
  findDeadlineClusters,
  upcomingDeadlines,
  type DeadlineItem,
} from "@/lib/opportunities/deadlines";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Deadlines",
  description: "Upcoming opportunity deadlines and competing deadlines on Find.",
};

export const dynamic = "force-dynamic";

const WINDOW_DAYS = 60;

export default async function DeadlinesPage() {
  if (!isSupabaseConfigured()) {
    return (
      <Section>
        <Container>
          <ErrorState title="Deadlines are unavailable" />
        </Container>
      </Section>
    );
  }

  const now = new Date();
  // TODO(intelligence): push the date window into getOpportunitiesPage (deadlineFrom/deadlineTo) when volume grows.
  const opportunities = await getOpportunities();

  const opportunityItems: DeadlineItem[] = opportunities.map((opportunity) => ({
    id: opportunity.id,
    title: opportunity.title,
    deadline: opportunity.deadline,
    kind: "opportunity",
  }));
  const upcoming = upcomingDeadlines(opportunityItems, now, WINDOW_DAYS);
  const clusters = findDeadlineClusters(upcoming);

  // Personal deadlines: only for a signed-in user, only their own applications.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let mine: ReturnType<typeof upcomingDeadlines> = [];
  let mineFailed = false;

  if (user) {
    try {
      const applications = await getUserApplications();
      mine = upcomingDeadlines(
        applications
          .filter((application) => isPreSubmission(application.status))
          .map((application) => ({
            id: application.id,
            title: application.opportunity.title,
            deadline: application.applicationDeadline ?? application.opportunity.deadline,
            kind: "application" as const,
          })),
        now,
        WINDOW_DAYS,
      );
    } catch {
      mineFailed = true;
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Deadlines"
        title="Upcoming Deadlines"
        description={`Published opportunities closing in the next ${WINDOW_DAYS} days, and deadlines that compete with each other.`}
      />

      <Section className="pt-8 sm:pt-10 lg:pt-12">
        <Container className="flex flex-col gap-10">
          <section aria-labelledby="mine" className="flex flex-col gap-3">
            <h2 id="mine" className="text-xl font-semibold">Your tracked applications</h2>
            {!user ? (
              <EmptyState
                title="Sign in to see your own deadlines"
                action={<Link href="/sign-in?redirectTo=/deadlines" className={buttonVariants()}>Sign in</Link>}
              />
            ) : mineFailed ? (
              <ErrorState title="We couldn’t load your applications" />
            ) : mine.length === 0 ? (
              <EmptyState title="No upcoming application deadlines" description="Applications you are still preparing will appear here." />
            ) : (
              <DeadlineList items={mine} />
            )}
          </section>

          {clusters.length > 0 ? (
            <section aria-labelledby="clusters" className="flex flex-col gap-3">
              <h2 id="clusters" className="text-xl font-semibold">Competing deadlines</h2>
              <p className="text-sm text-muted-foreground">
                These close within a few days of each other, so plan your time.
              </p>
              {clusters.map((cluster) => (
                <DeadlineList key={cluster.map((item) => item.id).join("-")} items={cluster} />
              ))}
            </section>
          ) : null}

          <section aria-labelledby="upcoming" className="flex flex-col gap-3">
            <h2 id="upcoming" className="text-xl font-semibold">Closing soon</h2>
            {upcoming.length === 0 ? (
              <EmptyState title="No opportunities are closing in this window" />
            ) : (
              <DeadlineList items={upcoming} />
            )}
          </section>
        </Container>
      </Section>
    </>
  );
}
