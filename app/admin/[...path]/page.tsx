import { notFound } from "next/navigation";

import { EcosystemPage, ecosystemMetadata, needsSearch } from "@/components/ecosystem/page-shell";
import { allConcreteRoutes, resolveRoute } from "@/lib/ecosystem/resolve";

type Props = { params: Promise<{ path: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Admin demo pages. Access is enforced by app/admin/layout.tsx (real sign-in + admin role check). */
export function generateStaticParams() {
  return allConcreteRoutes()
    .filter(({ route }) => route.startsWith("/admin/"))
    .map(({ route }) => ({ path: route.split("/").filter(Boolean).slice(1) }));
}

export async function generateMetadata({ params }: Props) {
  const { path } = await params;
  return ecosystemMetadata(`/admin/${path.join("/")}`);
}

export default async function Page({ params, searchParams }: Props) {
  const { path } = await params;
  const url = `/admin/${path.join("/")}`;
  const resolved = resolveRoute(url);

  if (!resolved) notFound();

  const search = needsSearch(url) ? await searchParams : {};

  return <EcosystemPage resolved={resolved} path={url} search={search} />;
}
