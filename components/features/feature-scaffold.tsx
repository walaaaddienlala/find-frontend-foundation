import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { FeatureStatusBadge } from "@/components/features/feature-status-badge";
import { Container, PageHeader, Section } from "@/components/layout/page-container";
import { ErrorState } from "@/components/shared/states";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { enforceFeatureAccess } from "@/lib/features/access";
import { getFeature, type FeatureSpec } from "@/lib/features/registry";
import { areScaffoldsVisible } from "@/lib/features/visibility";

/** Scaffold pages must never be indexed. */
export function scaffoldMetadata(featureId: string): Metadata {
  const feature = getFeature(featureId);

  return {
    title: feature ? `${feature.title} (in development)` : "In development",
    robots: { index: false, follow: false },
  };
}

function List({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }

  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/**
 * Honest placeholder for features that are not built yet. It reads and writes no
 * user data. Hidden in production unless NEXT_PUBLIC_ENABLE_SCAFFOLD_PAGES=true.
 * To graduate a feature: build the real page, then delete its usage of this
 * component and update the registry (see docs/FIND_IMPLEMENTATION_GUIDE.md).
 */
export async function FeatureScaffoldPage({
  featureId,
  returnTo,
  children,
}: {
  featureId: string;
  returnTo?: string;
  children?: ReactNode;
}) {
  const feature: FeatureSpec | undefined = getFeature(featureId);

  if (!feature || !areScaffoldsVisible()) notFound();

  const access = await enforceFeatureAccess(
    feature.access,
    returnTo ?? feature.route ?? "/",
  );

  if (access === "unavailable") {
    return (
      <Section>
        <Container>
          <ErrorState
            title="Service unavailable"
            description="This environment is not connected to Supabase, so signed-in features cannot load."
          />
        </Container>
      </Section>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={`Phase ${feature.phase} · ${feature.area}`}
        title={feature.title}
        description={feature.summary}
      />

      <Section className="pt-8 sm:pt-10 lg:pt-12">
        <Container className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <FeatureStatusBadge status={feature.status} />
                <CardTitle>This feature is not available yet</CardTitle>
              </div>
              <CardDescription>
                This page is a development scaffold. It does not read or save any
                data, and nothing on it is functional. The sections below describe
                what exists and what the team still needs to build.
              </CardDescription>
            </CardHeader>
          </Card>

          {children}

          <Panel title="Parts and status">
            <ul className="flex flex-col gap-3">
              {feature.parts.map((part) => (
                <li key={part.label} className="flex flex-wrap items-start gap-2 text-sm">
                  <FeatureStatusBadge status={part.status} />
                  <span>{part.label}</span>
                  {part.note ? <span className="text-muted-foreground">({part.note})</span> : null}
                </li>
              ))}
            </ul>
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Dependencies and blockers">
              <List items={feature.dependencies} empty="No dependencies." />
            </Panel>
            <Panel title="Acceptance criteria">
              <List items={feature.acceptance} empty="Not defined yet." />
            </Panel>
            <Panel title="TODO">
              <List items={feature.todos} empty="No open TODOs." />
            </Panel>
            <Panel title="Key files">
              <ul className="flex flex-col gap-1 text-sm">
                {feature.files.map((file) => (
                  <li key={file}><code>{file}</code></li>
                ))}
              </ul>
            </Panel>
            {feature.models?.length || feature.serviceMethods?.length ? (
              <Panel title="Planned models and service interface">
                <div className="flex flex-col gap-3 text-sm">
                  {feature.models?.length ? <p><strong>Models:</strong> {feature.models.join(", ")}</p> : null}
                  {feature.serviceMethods?.length ? (
                    <ul className="flex flex-col gap-1">
                      {feature.serviceMethods.map((method) => (
                        <li key={method}><code>{method}</code></li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </Panel>
            ) : null}
            {feature.migration ? (
              <Panel title="Proposed migration (not applied)">
                <p className="text-sm text-muted-foreground">
                  <code>supabase/migrations-drafts/proposed/{feature.migration}</code> is a
                  proposal only. It must pass the preflight review and explicit
                  approval before anything is applied.
                </p>
              </Panel>
            ) : null}
          </div>
        </Container>
      </Section>
    </>
  );
}
