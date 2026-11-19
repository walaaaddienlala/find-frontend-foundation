import { collections, opportunityCategories } from "./demo";
import { pages } from "./registry";
import type { CollectionId, DemoItem, OpportunityTypeMap, PageDef } from "./types";

/** Base path of each collection's detail routes. */
export const collectionBase: Record<CollectionId, string> = {
  courses: "/academy/courses",
  paths: "/academy/paths",
  workshops: "/academy/workshops",
  bootcamps: "/academy/bootcamps",
  cohorts: "/academy/cohorts",
  instructors: "/academy/instructors",
  lessons: "/academy/lessons",
  communities: "/community",
  members: "/community/members",
  posts: "/community/posts",
  mentors: "/mentors",
  stories: "/success-stories",
  teams: "/teams",
  events: "/events",
  resources: "/resources",
  network: "/network",
  services: "/agency/services",
};

export function itemHref(collection: CollectionId, slug: string): string {
  return `${collectionBase[collection]}/${slug}`;
}

const split = (path: string) => path.split("/").filter(Boolean);

export type Resolved = {
  page: PageDef;
  params: Record<string, string>;
  item?: DemoItem;
};

/**
 * Returns whether a page is handled by a hand-written Next.js route
 * or is already classified as an existing functional page.
 */
function isExplicitPage(page: PageDef): boolean {
  return page.status === "existing" || page.explicitRoute === true;
}

/**
 * Resolves a URL path to a registry page.
 * Explicit Next.js routes are never resolved here.
 */
export function resolveRoute(path: string): Resolved | null {
  const target = split(path);

  let best: {
    page: PageDef;
    params: Record<string, string>;
    dynamic: number;
  } | null = null;

  for (const page of pages) {
    if (isExplicitPage(page)) continue;

    const pattern = split(page.route);

    if (pattern.length !== target.length) continue;

    const params: Record<string, string> = {};
    let dynamic = 0;

    const matches = pattern.every((segment, index) => {
      if (segment.startsWith("[") && segment.endsWith("]")) {
        params[segment.slice(1, -1)] = decodeURIComponent(target[index]);
        dynamic += 1;
        return true;
      }

      return segment === target[index];
    });

    if (matches && (!best || dynamic < best.dynamic)) {
      best = { page, params, dynamic };
    }
  }

  if (!best) return null;

  const { page, params } = best;
  const slug = params.slug ?? params.path;

  if (page.detailOf) {
    const item = collections[page.detailOf].find(
      (candidate) => candidate.slug === slug,
    );

    return item ? { page, params, item } : null;
  }

  if (page.staticParams) {
    const value = Object.values(params)[0];

    return page.staticParams.includes(value)
      ? { page, params }
      : null;
  }

  return { page, params };
}

/**
 * Every concrete URL the ecosystem registry serves
 * (static pages + item pages + static params).
 *
 * Explicit Next.js routes are excluded because they are handled
 * by their own app/ route files.
 */
export function allConcreteRoutes(): { route: string; page: PageDef }[] {
  const out: { route: string; page: PageDef }[] = [];

  for (const page of pages) {
    if (isExplicitPage(page)) continue;

    if (page.detailOf) {
      for (const item of collections[page.detailOf]) {
        out.push({
          route: page.route.replace("[slug]", item.slug),
          page,
        });
      }
    } else if (page.staticParams) {
      for (const value of page.staticParams) {
        out.push({
          route: page.route.replace(/\[[^\]]+\]/, value),
          page,
        });
      }
    } else if (!page.route.includes("[")) {
      out.push({
        route: page.route,
        page,
      });
    }
  }

  return out;
}

/** Opportunity category slug -> the opportunity type that backs it today (null = not supported by the catalog yet). */
export const categoryTypeMap: OpportunityTypeMap = {
  scholarship: "scholarship",
  internship: "internship",
  fellowship: "fellowship",
  conference: "conference",
  competition: "competition",
  volunteering: "volunteering",
  "graduate-program": "graduate-program",
  training: "workshop",
  research: null,
  exchange: null,
  "summer-school": null,
  grants: null,
  jobs: null,
  entrepreneurship: null,
  incubators: null,
  accelerators: null,
  leadership: null,
};

export const categoryLabel = Object.fromEntries(
  opportunityCategories,
) as Record<string, string>;