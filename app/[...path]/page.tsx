import { notFound } from "next/navigation";

import { EcosystemPage, ecosystemMetadata, needsSearch } from "@/components/ecosystem/page-shell";
import { allConcreteRoutes, resolveRoute } from "@/lib/ecosystem/resolve";

type Props = { params: Promise<{ path: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Renders every registry page outside /admin. Explicit routes (opportunities, applications, ...) take precedence. */
export function generateStaticParams() {
  return allConcreteRoutes()
    .filter(({ route }) => !route.startsWith("/admin"))
    .map(({ route }) => ({ path: route.split("/").filter(Boolean) }));
}

export async function generateMetadata({ params }: Props) {
  const { path } = await params;
  return ecosystemMetadata(`/${path.join("/")}`);
}

export default async function Page({ params, searchParams }: Props) {
  const { path } = await params;
  const url = `/${path.join("/")}`;
  const resolved = resolveRoute(url);

  if (!resolved || url.startsWith("/admin")) notFound();

  const search = needsSearch(url) ? await searchParams : {};

  return <EcosystemPage resolved={resolved} path={url} search={search} />;
}
