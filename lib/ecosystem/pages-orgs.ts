import { collections } from "./demo";
import { F, FC, RI, coll, dash, detail, existing, form, hub, page } from "./dsl";
import { sampleNote } from "./pages-core";
import type { Block, Field, PageDef } from "./types";

// ───────────────────────── Agency ─────────────────────────
const agencyCats = [
  ["career-guidance", "Career Guidance Services"], ["application-support", "Application Support Services"], ["talent-development", "Talent Development"],
  ["professional-development", "Professional Development"], ["organizational", "Organizational Services"], ["training", "Training Services"], ["talent-matching", "Talent Matching"],
] as const;

export const agencyPages: PageDef[] = [
  hub("agency", "/agency", "Find Agency", "Human-led support that complements the platform: guidance, application support, training and talent services.", "agency", FC, undefined, [
    { kind: "notice", tone: "info", body: "Demo preview: services are sample entries with no prices. Requests, bookings and payments are not connected." },
    { kind: "collection", collection: "services", limit: 4, title: "Sample services" },
  ]),
  ...agencyCats.map(([slug, title]) => coll(`agency-${slug}`, `/agency/${slug}`, title, `${title} offered by Find Agency (sample).`, "agency", FC, "services", slug, "agency")),
  coll("agency-services", "/agency/services", "All Services", "Every sample service.", "agency", FC, "services", undefined, "agency"),
  detail("agency-service-detail", "/agency/services/[slug]", "Service Details", "What is included and how it works.", "agency", "services", "agency-services", "Request this service (not available)"),
  form("agency-request", "/agency/request", "Request a Service", "Tell us what you need.", "agency", RI, [F.text("name", "Full name", true), F.email("email", "Email", true), F.sel("service", "Service", collections.services.map((s) => s.title), true), F.area("details", "What do you need?", true, { minLength: 20 })], "Send request (not available)", "agency", "Requires backend and email: no request is sent."),
  page("agency-book", "/agency/book", "Consultation Booking", "Book a conversation.", "agency", RI, [
    { kind: "notice", tone: "warning", body: "Requires integration: calendar, booking and any payment are not connected. Payment will not be offered until a compliant provider is configured." },
    { kind: "form", fields: [F.text("name", "Full name", true), F.date("date", "Preferred date", true), F.sel("slot", "Time", ["10:00", "13:00", "17:00"], true), F.text("topic", "Topic")], submit: "Book (not available)" },
  ], { parent: "agency" }),
  dash("agency-dashboard", "/agency/dashboard", "Client Dashboard", "Your requests and service progress.", "agency", FC, [
    sampleNote,
    { kind: "stats", items: [{ label: "Active services", value: "1", hint: "sample" }, { label: "Sessions left", value: "2", hint: "sample" }] },
    { kind: "progress", title: "Service progress (sample)", items: [{ label: "Scholarship Strategy Package", value: 50 }] },
  ], "agency", { audience: "Agency client" }),
];

// ───────────────────────── Organizations ─────────────────────────
const orgNote: Block = { kind: "notice", tone: "warning", body: "Frontend demo of the organization portal. Organization accounts, verification and tenant isolation are not implemented; nothing here is protected or saved." };
const org = (id: string, slug: string, title: string, summary: string, blocks: Block[], status = FC) =>
  page(`org-${id}`, `/organizations/${slug}`, title, summary, "organizations", status, [orgNote, ...blocks], { parent: "organizations", audience: "Organization" });
const oppFields: Field[] = [F.text("title", "Title", true), F.sel("type", "Type", ["Scholarship", "Internship", "Fellowship", "Competition", "Volunteering", "Conference", "Workshop", "Other"], true), F.area("description", "Description", true, { minLength: 30 }), F.area("eligibility", "Eligibility"), F.sel("funding", "Funding", ["Fully funded", "Partially funded", "Unfunded"]), F.date("deadline", "Deadline"), F.url("source", "Official source URL", true), F.url("apply", "Application URL")];

export const orgPages: PageDef[] = [
  hub("organizations", "/organizations", "Organization Portal", "Publish opportunities, review applicants and reach the right students.", "organizations", FC, undefined, [orgNote, { kind: "cards", title: "Related", cols: 3, items: [{ title: "University portal", body: "For universities.", href: "/universities" }, { title: "Find Agency", body: "Human-led services.", href: "/agency" }, { title: "Institutions overview", body: "How organizations join Find.", href: "/institutions" }] }]),
  page(
    "institutions",
    "/institutions",
    "Institutions",
    "How companies, NGOs, universities and research institutions work with Find.",
    "organizations",
    FC,
    [
      {
        kind: "cards",
        cols: 2,
        items: [
          {
            title: "Organizations",
            body: "Publish opportunities, manage applicants, host events.",
            href: "/organizations",
          },
          {
            title: "Universities",
            body: "Student opportunities, announcements and engagement.",
            href: "/universities",
          },
        ],
      },
      {
        kind: "notice",
        tone: "info",
        body: "Opportunities published by institutions will still pass Find's verification review before appearing publicly.",
      },
    ],
    { explicitRoute: true },
  ),
  org("register", "register", "Organization Registration", "Create an organization account.", [{ kind: "form", fields: [F.text("name", "Organization name", true), F.sel("type", "Type", ["Company", "NGO", "Foundation", "Research institution", "Incubator", "Accelerator", "Training provider"], true), F.email("email", "Work email", true), F.url("site", "Website", true), F.text("country", "Country"), F.area("about", "About", true, { minLength: 30 })], submit: "Register (not available)", note: "Not connected: no account is created." }], RI),
  org("profile", "profile", "Organization Profile", "How your organization appears on Find.", [{ kind: "form", fields: [F.text("name", "Name", true), F.area("about", "About"), F.url("site", "Website"), F.text("logo", "Logo (not uploaded in demo)")], submit: "Save (not available)", note: "Not connected." }]),
  org("verification", "verification", "Organization Verification", "Prove your organization is who it says it is.", [{ kind: "steps", items: [{ title: "Submit details", body: "Name, website, official email." }, { title: "Provide evidence", body: "Registration or institutional proof." }, { title: "Review", body: "Find staff review your submission." }] }, { kind: "form", fields: [F.file("proof", "Evidence document"), F.url("link", "Official page")], submit: "Submit for review (not available)", note: "Requires backend: nothing is submitted." }], RI),
  org("dashboard", "dashboard", "Organization Dashboard", "Your opportunities and applicants at a glance.", [{ kind: "stats", items: [{ label: "Published", value: "4", hint: "sample" }, { label: "Pending review", value: "1", hint: "sample" }, { label: "Applicants", value: "96", hint: "sample" }, { label: "Views (30 days)", value: "2.4k", hint: "sample" }] }, { kind: "children" }]),
  org("opportunities", "opportunities", "Manage Opportunities", "Your published and draft opportunities.", [{ kind: "table", columns: ["Title", "Status", "Verification", "Deadline"], rows: [["Sample Internship (sample)", "Published", "Verified", "Sample"], ["Sample Fellowship (sample)", "Draft", "Not submitted", "Sample"]] }, { kind: "list", items: [{ title: "Publish a new opportunity", href: "/organizations/opportunities/new" }] }]),
  org("new", "opportunities/new", "Publish an Opportunity", "Submit an opportunity for verification and publication.", [{ kind: "notice", tone: "info", body: "Published opportunities must have an official source and pass verification before they appear on Find." }, { kind: "form", fields: oppFields, submit: "Submit for review (not available)", note: "Not connected: nothing is submitted." }]),
  org("edit", "opportunities/edit", "Edit an Opportunity", "Update details, dates and links.", [{ kind: "form", fields: oppFields, submit: "Save changes (not available)", note: "Not connected." }]),
  org("applicants", "applicants", "Applicant Management", "Review people who applied.", [{ kind: "table", columns: ["Applicant", "Opportunity", "Stage"], rows: [["Applicant A (sample)", "Sample Internship", "Under review"], ["Applicant B (sample)", "Sample Internship", "Interview"]] }, { kind: "notice", tone: "info", body: "Applicant data will only be visible with the applicant's consent and strict tenant isolation." }]),
  org("applications", "applications", "Application Overview", "Pipeline across your opportunities.", [{ kind: "kanban", columns: [{ title: "Submitted", items: ["Applicant C (sample)"] }, { title: "Under review", items: ["Applicant A (sample)"] }, { title: "Interview", items: ["Applicant B (sample)"] }, { title: "Decision", items: [] }] }]),
  org("talent", "talent", "Talent Discovery", "Find students who opted in to be discovered.", [{ kind: "notice", tone: "warning", body: "Talent discovery requires explicit user consent and visibility controls, which are not implemented. Sample profiles only." }, { kind: "collection", collection: "members", limit: 4 }], RI),
  org("analytics", "analytics", "Organization Analytics", "Reach and outcomes.", [{ kind: "stats", items: [{ label: "Views", value: "2.4k", hint: "sample" }, { label: "Saves", value: "310", hint: "sample" }, { label: "Applications", value: "96", hint: "sample" }] }, { kind: "progress", title: "Funnel (sample)", items: [{ label: "Viewed", value: 100 }, { label: "Saved", value: 13 }, { label: "Applied", value: 4 }] }]),
  org("events", "events", "Organization Events", "Host events and workshops.", [{ kind: "form", fields: [F.text("title", "Event title", true), F.date("date", "Date", true), F.sel("type", "Type", ["Webinar", "Workshop", "Career fair"]), F.area("about", "Description")], submit: "Publish (not available)", note: "Not connected." }]),
  org("resources", "resources", "Organization Resources", "Guides and materials you share.", [{ kind: "list", items: [{ title: "Sample program guide (sample)", meta: "PDF" }, { title: "Sample FAQ (sample)", meta: "PDF" }] }]),
  org("team", "team", "Team Management", "Who can manage your organization on Find.", [{ kind: "table", columns: ["Member", "Role"], rows: [["Member A (sample)", "Owner"], ["Member B (sample)", "Editor"]] }, { kind: "form", fields: [F.email("email", "Invite by email", true), F.sel("role", "Role", ["Admin", "Editor", "Viewer"], true)], submit: "Invite (not available)", note: "Not connected." }]),
  org("settings", "settings", "Organization Settings", "Preferences and notifications.", [{ kind: "form", fields: [F.check("notify", "Email me about new applicants"), F.sel("lang", "Language", ["English"])], submit: "Save (not available)", note: "Not connected." }]),
];

// ───────────────────────── Universities ─────────────────────────
const uniNote: Block = { kind: "notice", tone: "warning", body: "Frontend demo of the university portal. University accounts, verification and data isolation are not implemented; nothing here is protected or saved." };
const uni = (id: string, slug: string, title: string, summary: string, blocks: Block[], status = FC) =>
  page(`uni-${id}`, `/universities/${slug}`, title, summary, "universities", status, [uniNote, ...blocks], { parent: "universities", audience: "University staff" });

export const universityPages: PageDef[] = [
  hub("universities", "/universities", "University Portal", "Connect your students with opportunities, events and development programs.", "universities", FC, undefined, [uniNote]),
  uni("dashboard", "dashboard", "University Dashboard", "Student engagement at a glance.", [{ kind: "stats", items: [{ label: "Active students", value: "1,240", hint: "sample" }, { label: "Applications this term", value: "310", hint: "sample" }, { label: "Opportunities shared", value: "42", hint: "sample" }] }, { kind: "children" }]),
  uni("profile", "profile", "University Profile", "How your university appears on Find.", [{ kind: "form", fields: [F.text("name", "University name", true), F.text("country", "Country"), F.url("site", "Website"), F.area("about", "About")], submit: "Save (not available)", note: "Not connected." }]),
  uni("opportunities", "opportunities", "Student Opportunities", "Opportunities relevant to your students.", [{ kind: "list", items: [{ title: "Browse real published opportunities", href: "/opportunities" }, { title: "Compare opportunities", href: "/compare" }] }, { kind: "table", title: "Sample curated list", columns: ["Opportunity", "Faculty", "Shared"], rows: [["Sample Scholarship (sample)", "Engineering", "Yes"]] }]),
  uni("announcements", "announcements", "University Announcements", "Messages to your students.", [{ kind: "list", title: "Sample announcements", items: [{ title: "Scholarship info session next week (sample)", meta: "Sample" }] }, { kind: "form", fields: [F.text("title", "Title", true), F.area("body", "Message", true)], submit: "Publish (not available)", note: "Not connected." }]),
  uni("publish", "publish", "Publish Opportunities", "Share an opportunity for your students.", [{ kind: "form", fields: [F.text("title", "Title", true), F.area("description", "Description", true), F.url("source", "Official source URL", true), F.date("deadline", "Deadline")], submit: "Submit for review (not available)", note: "Not connected. Published items still pass verification." }]),
  uni("talent", "talent", "Student Talent Discovery", "Highlight students who opted in.", [{ kind: "notice", tone: "warning", body: "Requires student consent and visibility controls (not implemented). Sample profiles only." }, { kind: "collection", collection: "members", limit: 4 }], RI),
  uni("engagement", "engagement", "Student Engagement", "How students use Find.", [{ kind: "progress", title: "Participation (sample)", items: [{ label: "Created a profile", value: 72 }, { label: "Saved an opportunity", value: 55 }, { label: "Started an application", value: 31 }] }]),
  uni("events", "events", "University Events", "Events for students.", [{ kind: "collection", collection: "events", limit: 3 }]),
  uni("workshops", "workshops", "University Workshops", "Workshops for students.", [{ kind: "collection", collection: "workshops", limit: 3 }]),
  uni("analytics", "analytics", "Institutional Analytics", "Aggregated, privacy-preserving reporting.", [{ kind: "stats", items: [{ label: "Applications", value: "310", hint: "sample" }, { label: "Accepted", value: "38", hint: "sample" }] }, { kind: "notice", tone: "info", body: "Reports will be aggregated and will not expose individual student data without consent." }]),
  uni("departments", "departments", "Department Management", "Faculties and departments.", [{ kind: "table", columns: ["Department", "Students (sample)"], rows: [["Engineering", "420"], ["Science", "380"], ["Business", "310"]] }, { kind: "form", fields: [F.text("name", "Department name", true)], submit: "Add (not available)", note: "Not connected." }]),
  uni("verification", "verification", "University Verification", "Confirm your institution.", [{ kind: "steps", items: [{ title: "Submit details", body: "Official name and domain." }, { title: "Evidence", body: "Institutional proof." }, { title: "Review", body: "Find staff review." }] }, { kind: "form", fields: [F.url("domain", "Official website", true), F.file("proof", "Evidence")], submit: "Submit (not available)", note: "Requires backend." }], RI),
];

// ───────────────────────── Admin (behind the real admin guard) ─────────────────────────
const adminNote: Block = { kind: "notice", tone: "warning", body: "Demo preview behind the real admin check. The data and controls on this page are samples and are not connected. Only Opportunities and Feature status are real." };
type AdminRow = [slug: string, title: string, summary: string, stats: [string, string][], columns: string[], rows: string[][]];
const adminRows: AdminRow[] = [
  ["users", "User Management", "Search users, view profiles and manage account status.", [["Users", "—"], ["New this week", "—"]], ["User", "Role", "Status"], [["User A (sample)", "Student", "Active"], ["User B (sample)", "Mentor", "Active"]]],
  ["applications", "Application Management", "Platform-wide application overview.", [["Applications", "—"], ["Submitted", "—"]], ["Applicant", "Opportunity", "Status"], [["Applicant A (sample)", "Sample Scholarship", "Submitted"]]],
  ["organizations", "Organization Management", "Review and verify organizations.", [["Pending", "—"], ["Verified", "—"]], ["Organization", "Type", "Status"], [["Org A (sample)", "NGO", "Pending"]]],
  ["universities", "University Management", "Review and verify universities.", [["Pending", "—"], ["Verified", "—"]], ["University", "Country", "Status"], [["University A (sample)", "Egypt", "Pending"]]],
  ["academy", "Academy Management", "Programs, cohorts and instructors.", [["Courses", "—"], ["Cohorts", "—"]], ["Item", "Type", "Status"], [["Sample Course", "Course", "Draft"]]],
  ["courses", "Course Management", "Create and publish courses.", [["Published", "—"], ["Drafts", "—"]], ["Course", "Instructor", "Status"], [["Sample Course", "Sample Instructor", "Draft"]]],
  ["moderation", "Community Moderation", "Reports, hidden content and members.", [["Open reports", "—"]], ["Report", "Target", "Status"], [["Spam (sample)", "Post", "Open"]]],
  ["mentors", "Mentor Management", "Applications and verification.", [["Pending", "—"], ["Verified", "—"]], ["Mentor", "Field", "Status"], [["Mentor A (sample)", "Research", "Pending"]]],
  ["events", "Events Management", "Create and manage events.", [["Upcoming", "—"]], ["Event", "Date", "Status"], [["Sample Webinar", "Sample", "Draft"]]],
  ["resources", "Resource Management", "Guides, templates and checklists.", [["Resources", "—"]], ["Resource", "Type", "Status"], [["Sample Guide", "Guide", "Draft"]]],
  ["stories", "Success Stories Management", "Review submitted stories before publishing.", [["Pending review", "—"]], ["Story", "Author", "Status"], [["Story A (sample)", "Author A", "Pending review"]]],
  ["ai", "AI Configuration", "Providers, limits and agent settings.", [["Provider", "Not configured"], ["Monthly cost cap", "—"]], ["Setting", "Value"], [["Provider", "Not configured"], ["Rate limit", "Not configured"]]],
  ["chatbot", "Chatbot Configuration", "Knowledge sources, handoff and channels.", [["Website chat", "Flag-controlled"], ["WhatsApp", "Not connected"]], ["Setting", "Value"], [["Support handoff", "Not connected"], ["WhatsApp", "Not connected"]]],
  ["notifications", "Notification Management", "Templates, channels and delivery.", [["Email provider", "Not configured"]], ["Template", "Channel", "Status"], [["Deadline reminder (sample)", "Email", "Draft"]]],
  ["support", "Support Management", "Support requests and handoffs.", [["Open", "—"]], ["Request", "From", "Status"], [["Request A (sample)", "User A (sample)", "Open"]]],
  ["analytics", "Platform Analytics", "Usage and outcomes.", [["Active users", "—"], ["Applications", "—"]], ["Metric", "Value"], [["Opportunities viewed", "—"], ["Applications started", "—"]]],
  ["reports", "Reports", "Export operational reports.", [["Reports", "—"]], ["Report", "Period"], [["Monthly summary (sample)", "Sample"]]],
  ["audit", "Audit Logs", "Sensitive actions and AI actions.", [["Events (30 days)", "—"]], ["Time", "Actor", "Action"], [["Sample", "Admin A (sample)", "Verified an opportunity"]]],
  ["roles", "Roles and Permissions", "Who can do what.", [["Roles", "admin only today"]], ["Role", "Status"], [["admin", "Exists (real)"], ["reviewer, moderator, mentor, instructor, institution roles", "Not implemented"]]],
  ["settings", "Platform Settings", "Site-wide settings.", [["Environment", "—"]], ["Setting", "Value"], [["Chatbot flag", "NEXT_PUBLIC_ENABLE_CHATBOT"], ["Scaffold pages flag", "NEXT_PUBLIC_ENABLE_SCAFFOLD_PAGES"]]],
  ["verification", "Opportunity Verification", "Review official sources before publication.", [["Awaiting review", "—"]], ["Opportunity", "Source", "Status"], [["Sample (sample)", "Official page", "Needs review"]]],
  ["institutions", "Institution Management", "Organizations and universities overview.", [["Institutions", "—"]], ["Institution", "Type", "Status"], [["Institution A (sample)", "University", "Pending"]]],
];

export const adminPages: PageDef[] = [
  existing("admin", "/admin", "Admin Overview", "Real admin overview.", "admin"),
  existing("admin-opportunities", "/admin/opportunities", "Opportunity Management", "Create and edit opportunities (real).", "admin", "admin"),
  existing("admin-features", "/admin/features", "Feature Status", "Registry-driven status board (real).", "admin", "admin"),
  existing("admin-team", "/admin/team", "Team", "Team placeholder (existing).", "admin", "admin"),
  ...adminRows.map(([slug, title, summary, stats, columns, rows]) =>
    page(`admin-${slug}`, `/admin/${slug}`, title, summary, "admin", FC, [
      adminNote,
      { kind: "stats", items: stats.map(([label, value]) => ({ label, value, hint: "sample" })) },
      { kind: "table", title: "Sample table", columns, rows },
    ], {
      parent: "admin",
      audience: "Administrator",
      ...(["users", "verification", "institutions"].includes(slug)
        ? { explicitRoute: true }
        : {}),
    })),
];