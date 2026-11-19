/**
 * Frontend ecosystem registry types. Every page of the Find ecosystem is declared
 * as data (lib/ecosystem/pages-*.ts) and rendered by a small set of templates
 * (components/ecosystem/*). Pure module: tested without a browser.
 */
export type FrontendStatus =
  | "existing"
  | "frontend_complete"
  | "frontend_partial"
  | "requires_integration"
  | "coming_soon";

export const frontendStatusLabel: Record<FrontendStatus, string> = {
  existing: "Existing functional",
  frontend_complete: "Frontend complete — backend pending",
  frontend_partial: "Frontend partial",
  requires_integration: "Requires external integration",
  coming_soon: "Coming soon",
};

export type ModuleId =
  | "platform" | "opportunities" | "profile" | "ai" | "chatbot" | "prepare"
  | "academy" | "community" | "mentors" | "stories" | "teams" | "events"
  | "resources" | "network" | "agency" | "organizations" | "universities"
  | "admin" | "roles" | "grow";

export type CollectionId =
  | "courses" | "paths" | "workshops" | "bootcamps" | "cohorts" | "instructors"
  | "lessons" | "communities" | "members" | "posts" | "mentors" | "stories"
  | "teams" | "events" | "resources" | "network" | "services";

export type Field = {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select" | "date" | "file" | "checkbox" | "number" | "url";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  hint?: string;
  minLength?: number;
};

export type Block =
  | { kind: "text"; title?: string; body: string }
  | { kind: "notice"; tone: "info" | "warning"; body: string }
  | { kind: "cards"; title?: string; items: { title: string; body: string; href?: string; badge?: string }[]; cols?: 2 | 3 | 4 }
  | { kind: "stats"; items: { label: string; value: string; hint?: string }[] }
  | { kind: "list"; title?: string; items: { title: string; meta?: string; href?: string }[] }
  | { kind: "table"; title?: string; columns: string[]; rows: string[][] }
  | { kind: "progress"; title?: string; items: { label: string; value: number }[] }
  | { kind: "steps"; title?: string; items: { title: string; body: string }[] }
  | { kind: "form"; title?: string; fields: Field[]; submit: string; note?: string }
  | { kind: "tool"; title?: string; fields: Field[]; runLabel: string; sample: { title: string; items: string[] } }
  | { kind: "collection"; collection: CollectionId; tag?: string; filter?: boolean; limit?: number; title?: string }
  | { kind: "item" }
  | { kind: "children"; title?: string }
  | { kind: "chat" }
  | { kind: "calendar"; events: { day: number; title: string }[] }
  | { kind: "quiz" }
  | { kind: "video" }
  | { kind: "gauge"; label: string; value: number }
  | { kind: "kanban"; columns: { title: string; items: string[] }[] }
  | { kind: "live"; name: "categories" | "category" | "advanced-search" | "deadline-calendar" };

export type PageDef = {
  id: string;
  route: string;
  title: string;
  summary: string;
  module: ModuleId;
  status: FrontendStatus;

  /**
   * True when this page is served by a hand-written Next.js App Router page.
   * Independent from the frontend implementation status.
   */
  explicitRoute?: boolean;

  /** Parent page id (breadcrumbs and hub children). */
  parent?: string;
  /** Detail routes: the collection whose items fill [slug]. */
  detailOf?: CollectionId;
  /** Dynamic routes that are not collection details: the concrete [param] values to pre-render. */
  staticParams?: string[];
  /** Who this view is designed for (demo role view; no authorization is implied). */
  audience?: string;
  blocks: Block[];
  /** Backend requirements specific to this page (module defaults apply otherwise). */
  backend?: string[];
};

/** Uniform demo record. EVERY item is sample data and is labelled as such in the UI. */
export type DemoItem = {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  tags: string[];
  meta: [string, string][];
  sections: { title: string; items: string[] }[];
};

export type OpportunityTypeMap = Record<string, import("../types").OpportunityType | null>;

export type NavItem = { label: string; href: string };
export type NavSection = { title: string; items: NavItem[] };