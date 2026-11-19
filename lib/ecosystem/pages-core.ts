import { opportunityCategories } from "./demo";
import { CS, EX, F, FC, FP, RI, coll, dash, existing, form, hub, page, tool, work } from "./dsl";
import { navSections } from "./navigation";
import type { PageDef } from "./types";

const sampleNote = { kind: "notice", tone: "info", body: "Demo preview: sample data. Nothing on this page is real, and nothing you enter is saved." } as const;

// ───────────────────────── Platform ─────────────────────────
export const platformPages: PageDef[] = [
  existing("home", "/", "Home", "Find: discover, prepare, connect, grow.", "platform"),
  existing("about", "/about", "About Find", "What Find is and why it exists.", "platform"),
  existing("how-it-works", "/how-it-works", "How It Works", "The Find journey in steps.", "platform"),
  existing("get-started", "/get-started", "Get Started", "Create your Find account.", "platform"),
  existing("sign-in", "/sign-in", "Sign In", "Sign in to Find.", "platform"),
  existing("dashboard", "/dashboard", "My Dashboard", "Saved opportunities, applications and next actions.", "platform"),
  existing("saved", "/saved", "Saved Opportunities", "Opportunities you saved.", "platform"),
  existing("applications", "/applications", "My Applications", "Application tracker, checklists and tasks (also the application details view).", "platform"),
  existing("compare", "/compare", "Compare Opportunities", "Side-by-side comparison.", "opportunities"),
  existing("deadlines", "/deadlines", "Deadlines", "Upcoming deadlines and overlaps.", "opportunities"),

  page("explore", "/explore", "Explore Find", "Everything in the Find ecosystem, organized by the journey: discover, understand, prepare, connect, grow.", "platform", FC, [
    ...navSections.map((section) => ({
      kind: "cards" as const,
      title: section.title,
      items: section.items.map((item) => ({ title: item.label, body: "Open", href: item.href })),
      cols: 4 as const,
    })),
    { kind: "notice", tone: "info", body: "Pages are labelled with their status: existing features work today; demo previews use clearly marked sample data." },
  ]),

  page("feed", "/feed", "Personalized Feed", "Opportunities, courses, mentors and communities chosen for you.", "platform", FC, [
    { kind: "notice", tone: "warning", body: "Demo preview. A real feed needs your profile and the matching service, which are not connected yet. The items below are sample data." },
    {
      kind: "cards",
      title: "Sample feed",
      cols: 3,
      items: [
        { title: "Sample scholarship matching your field", body: "Why it matches: field and level (sample).", badge: "Sample" },
        { title: "Course: Scholarship Application Strategy", body: "Recommended for your goal (sample).", href: "/academy/courses/scholarship-application-strategy", badge: "Sample" },
        { title: "Mentor: Dr. Salma Reda", body: "Scholarship strategy (sample).", href: "/mentors/dr-salma-reda", badge: "Sample" },
        { title: "Community: Scholarship Preparation", body: "Active this week (sample).", href: "/community/scholarship-preparation", badge: "Sample" },
        { title: "Event: Scholarship Q&A Webinar", body: "Online (sample date).", href: "/events/scholarship-q-a-webinar", badge: "Sample" },
        { title: "Resource: Application Checklist", body: "Documents and steps (sample).", href: "/resources/application-checklist", badge: "Sample" },
      ],
    },
    {
      kind: "list",
      title: "Real opportunities right now",
      items: [
        { title: "Browse published opportunities", href: "/opportunities" },
        { title: "See closing deadlines", href: "/deadlines" },
      ],
    },
  ], { audience: "Registered user" }),

  form("onboarding", "/onboarding", "Onboarding", "Tell Find about your goals so it can personalize your journey.", "platform", FC, [
    F.text("name", "Full name", true),
    F.sel("level", "Academic level", ["High school", "Undergraduate", "Graduate", "Recent graduate", "Young professional"], true),
    F.text("field", "Field of study", true),
    F.sel("goal", "What are you looking for?", ["Scholarship", "Internship", "Research", "Fellowship", "Exchange", "Competition", "Job"], true),
    F.text("countries", "Preferred countries"),
    F.check("consent", "I understand this demo does not save my answers"),
  ], "Continue", undefined, "Onboarding is not connected: no profile is created.", [
    {
      kind: "steps",
      title: "Three short steps",
      items: [
        { title: "About you", body: "Level and field." },
        { title: "Your goals", body: "What you want to achieve." },
        { title: "Preferences", body: "Countries, funding and timing." },
      ],
    },
  ]),

  hub("settings", "/settings", "Settings", "Account, privacy, notifications, language and your data.", "platform", FC),

  form("settings-account", "/settings/account", "Account Settings", "Email, password and sign-in options.", "platform", FC, [
    F.email("email", "Email", true),
    F.text("name", "Display name"),
    F.text("password", "New password", false, { minLength: 8 }),
  ], "Update account", "settings", "Account changes are not connected from this page yet."),

  form("settings-privacy", "/settings/privacy", "Privacy Settings", "Control who sees your profile, documents and activity.", "platform", FC, [
    F.sel("visibility", "Profile visibility", ["Private", "Members only", "Public"], true),
    F.check("talent", "Allow organizations to discover my profile"),
    F.check("mentors", "Allow mentors to see my goals"),
    F.check("ai", "Allow Find AI to use my profile (user-approved memory only)"),
  ], "Save privacy settings", "settings", "Privacy settings are not saved yet."),

  page(
    "settings-notifications",
    "/settings/notifications",
    "Notification Preferences",
    "Choose what Find tells you about, and where.",
    "platform",
    FP,
    [
      sampleNote,
      {
        kind: "notice",
        tone: "warning",
        body: "Notification preferences are a scaffold. Per-channel and per-category controls and persistence are not implemented; no preferences are saved and no push or WhatsApp messages are sent.",
      },
    ],
    { parent: "settings", explicitRoute: true },
  ),

  page("settings-data", "/settings/data", "Your Data", "Export or delete your data.", "platform", RI, [
    { kind: "notice", tone: "warning", body: "Requires backend: data export and account deletion workflows are not implemented. No export or deletion can be requested from here yet." },
    {
      kind: "form",
      fields: [
        F.sel("what", "What do you need?", ["Export my data", "Delete my account"], true),
        F.check("confirm", "I understand nothing will be sent"),
      ],
      submit: "Request (not available)",
      note: "Not connected: no request is created.",
    },
  ], { parent: "settings" }),

  page("notifications", "/notifications", "Notifications Center", "Everything Find has told you.", "platform", FP, [
    sampleNote,
    {
      kind: "list",
      title: "Sample notifications",
      items: [
        { title: "Deadline reminder: sample scholarship closes in 3 days", meta: "Sample · Deadlines" },
        { title: "New matching opportunity (sample)", meta: "Sample · Matches" },
        { title: "Your application moved to Interview (sample)", meta: "Sample · Status" },
        { title: "Mentor replied to your request (sample)", meta: "Sample · Mentors" },
      ],
    },
    {
      kind: "list",
      title: "Settings",
      items: [
        { title: "Notification preferences", href: "/settings/notifications" },
      ],
    },
  ], { audience: "Registered user", explicitRoute: true }),

  page(
    "alerts",
    "/alerts",
    "Opportunity Radar and Alerts",
    "Get told when a matching opportunity appears or a deadline changes.",
    "platform",
    FP,
    [
      {
        kind: "notice",
        tone: "warning",
        body: "Demo preview. Alert rules are not saved and no alerts are sent: the rule builder and evaluation job are not connected.",
      },
      {
        kind: "form",
        title: "Create an alert rule",
        fields: [
          F.text("name", "Rule name", true),
          F.text("keywords", "Keywords"),
          F.sel("type", "Opportunity type", [
            "Any",
            "Scholarship",
            "Internship",
            "Fellowship",
            "Competition",
          ]),
          F.text("country", "Country"),
          F.sel("funding", "Funding", [
            "Any",
            "Fully funded",
            "Partially funded",
          ]),
          F.check("email", "Email me"),
          F.check("inapp", "Show in notifications"),
        ],
        submit: "Create rule (not available)",
        note: "Not connected: no rule is created.",
      },
      {
        kind: "table",
        title: "Sample rules",
        columns: ["Rule", "Criteria", "Status"],
        rows: [
          ["Funded research (sample)", "Fully funded · research", "Active"],
          ["Closing soon (sample)", "Any · deadline < 14 days", "Paused"],
        ],
      },
      {
        kind: "list",
        items: [
          {
            title: "Real search you can use today",
            href: "/opportunities/search",
          },
          {
            title: "Notification preferences",
            href: "/settings/notifications",
          },
        ],
      },
    ],
    {
      audience: "Registered user",
      explicitRoute: true,
    },
  ),

  page("application-history", "/applications/history", "Application History", "Every status change and outcome across your applications.", "platform", FP, [
    { kind: "notice", tone: "info", body: "Your live applications and their activity timeline are in the Application Tracker. The table below is a sample layout for the cross-application history view." },
    {
      kind: "table",
      title: "Sample history",
      columns: ["Date", "Application", "Change"],
      rows: [
        ["2026-10-02 (sample)", "Sample Scholarship", "Preparing → Submitted"],
        ["2026-10-20 (sample)", "Sample Scholarship", "Submitted → Interview"],
        ["2026-11-02 (sample)", "Sample Internship", "Preparing → Submitted"],
      ],
    },
    {
      kind: "list",
      items: [
        { title: "Open the Application Tracker", href: "/applications" },
      ],
    },
  ], { audience: "Registered user" }),

  page("calendar", "/calendar", "Deadline Calendar", "Published opportunity deadlines on a month view.", "platform", FP, [
    { kind: "live", name: "deadline-calendar" },
    { kind: "notice", tone: "info", body: "Shows real published deadlines. Personal tasks, interview dates and calendar sync are not connected yet." },
  ]),
];

// ───────────────────────── Opportunities ─────────────────────────
export const opportunityPages: PageDef[] = [
  existing("opportunities", "/opportunities", "Opportunities", "Browse published opportunities.", "opportunities"),
  existing("opportunity-detail", "/opportunities/[id]", "Opportunity Details", "Full opportunity details.", "opportunities", "opportunities"),
  page("opportunity-categories", "/opportunities/categories", "Opportunity Categories", "All 17 categories. Counts and listings use real published data; categories without listings say so.", "opportunities", FP, [
    { kind: "live", name: "categories" },
  ], { parent: "opportunities" }),
  page("opportunity-category", "/opportunities/category/[slug]", "Category", "Published opportunities in this category.", "opportunities", FP, [
    { kind: "live", name: "category" },
  ], { parent: "opportunity-categories", staticParams: opportunityCategories.map(([slug]) => slug) }),
  page("opportunity-search", "/opportunities/search", "Advanced Search", "Search published opportunities by text, type, country and funding.", "opportunities", FP, [
    { kind: "live", name: "advanced-search" },
  ], { parent: "opportunities" }),
];

// ───────────────────────── Profile and passports ─────────────────────────
export const profilePages: PageDef[] = [
  page(
    "profile",
    "/profile",
    "My Profile",
    "One profile, many applications.",
    "profile",
    FC,
    [
      { kind: "notice", tone: "warning", body: "Demo preview. Your profile is not stored yet; values below are sample data and the score is illustrative." },
      { kind: "gauge", label: "Profile completeness (sample)", value: 62 },
      {
        kind: "progress",
        title: "Sections (sample)",
        items: [
          { label: "Personal information", value: 90 },
          { label: "Education", value: 80 },
          { label: "Skills", value: 55 },
          { label: "Experience", value: 40 },
          { label: "Projects", value: 30 },
          { label: "Preferences", value: 70 },
        ],
      },
      { kind: "children", title: "Edit your profile" },
    ],
    {
      audience: "Registered user",
      explicitRoute: true,
    },
  ),

  form("profile-edit", "/profile/edit", "Edit Profile", "Personal information and visibility.", "profile", FC, [
    F.text("name", "Full name", true),
    F.text("nationality", "Nationality"),
    F.text("residence", "Country of residence"),
    F.date("dob", "Date of birth"),
    F.text("phone", "Phone"),
    F.area("bio", "Short bio", false, { minLength: 20 }),
    F.sel("visibility", "Visibility", ["Private", "Members only", "Public"]),
  ], "Save profile", "profile", "Not connected: nothing is saved."),

  form("profile-education", "/profile/education", "Education and Achievements", "University, major, academic level and achievements.", "profile", FC, [
    F.text("university", "University", true),
    F.text("faculty", "Faculty"),
    F.text("major", "Major", true),
    F.sel("level", "Academic level", ["Undergraduate", "Graduate", "Other"]),
    F.num("year", "Graduation year"),
    F.text("gpa", "GPA (any scale)"),
    F.area("achievements", "Academic achievements"),
  ], "Save education", "profile", "Not connected: nothing is saved."),

  page("profile-skills", "/profile/skills", "Skills", "Technical and soft skills with evidence.", "profile", FC, [
    sampleNote,
    { kind: "progress", title: "Technical skills (sample)", items: [{ label: "Python", value: 70 }, { label: "Data analysis", value: 55 }, { label: "Lab techniques", value: 40 }] },
    { kind: "progress", title: "Soft skills (sample)", items: [{ label: "Communication", value: 75 }, { label: "Teamwork", value: 80 }, { label: "Time management", value: 60 }] },
    {
      kind: "form",
      title: "Add a skill",
      fields: [
        F.text("skill", "Skill", true),
        F.sel("type", "Type", ["Technical", "Soft"], true),
        F.sel("level", "Level", ["Beginner", "Intermediate", "Advanced"]),
        F.text("evidence", "Evidence (project, certificate, link)"),
      ],
      submit: "Add skill",
      note: "Not connected.",
    },
  ], { parent: "profile" }),

  page("profile-experience", "/profile/experience", "Experience", "Work, research, volunteering and leadership.", "profile", FC, [
    sampleNote,
    { kind: "list", title: "Sample entries", items: [{ title: "Research assistant · Sample Lab", meta: "Research · 2025 (sample)" }, { title: "Volunteer · Sample Charity", meta: "Volunteering · 2024 (sample)" }, { title: "Club president · Sample Club", meta: "Leadership · 2025 (sample)" }] },
    {
      kind: "form",
      title: "Add an entry",
      fields: [
        F.sel("kind", "Type", ["Work", "Internship", "Research", "Volunteering", "Leadership"], true),
        F.text("title", "Title", true),
        F.text("org", "Organization"),
        F.date("start", "Start date"),
        F.date("end", "End date"),
        F.area("desc", "Description"),
      ],
      submit: "Add entry",
      note: "Not connected.",
    },
  ], { parent: "profile" }),

  page("profile-projects", "/profile/projects", "Projects, Publications and Certifications", "Evidence of what you have done.", "profile", FC, [
    sampleNote,
    { kind: "cards", title: "Sample projects", cols: 3, items: [{ title: "Sample data project", body: "A short description (sample).", badge: "Sample" }, { title: "Sample research poster", body: "Conference poster (sample).", badge: "Sample" }, { title: "Sample certification", body: "Issued by a sample provider.", badge: "Sample" }] },
    {
      kind: "form",
      title: "Add a project, publication or certification",
      fields: [
        F.sel("kind", "Type", ["Project", "Publication", "Certification", "Achievement"], true),
        F.text("title", "Title", true),
        F.url("link", "Link"),
        F.area("desc", "Description"),
      ],
      submit: "Add item",
      note: "Not connected.",
    },
  ], { parent: "profile" }),

  form("profile-preferences", "/profile/preferences", "Interests, Goals and Preferences", "What you want next.", "profile", FC, [
    F.area("goals", "Career and academic goals"),
    F.text("interests", "Interests (comma separated)"),
    F.text("countries", "Preferred countries"),
    F.sel("types", "Preferred opportunity type", ["Scholarship", "Internship", "Research", "Fellowship", "Exchange", "Competition"]),
    F.sel("funding", "Funding", ["Fully funded", "Partially funded", "Any"]),
    F.sel("mode", "Delivery", ["On-site", "Remote", "Hybrid", "Any"]),
  ], "Save preferences", "profile", "Not connected: preferences are not saved."),

  page("profile-documents", "/profile/documents", "CV and Documents", "Your CV and uploaded documents.", "profile", RI, [
    { kind: "notice", tone: "warning", body: "Requires backend: private storage, signed URLs and malware scanning are not connected. Uploads do nothing yet." },
    {
      kind: "form",
      fields: [
        F.file("cv", "Upload your CV", "PDF or DOCX, up to 10 MB (not uploaded in this demo)"),
        F.sel("kind", "Document type", ["CV", "Transcript", "Certificate", "Recommendation letter", "Other"]),
      ],
      submit: "Upload (not available)",
    },
  ], { parent: "profile" }),

  page("documents", "/documents", "Document Vault", "All your application documents in one private place.", "profile", RI, [
    { kind: "notice", tone: "warning", body: "Requires backend: private storage, versions, expiry reminders and per-application approval are not connected. Nothing is stored." },
    {
      kind: "table",
      title: "Sample layout",
      columns: ["Document", "Type", "Version", "Expires"],
      rows: [
        ["Sample CV", "CV", "v2", "—"],
        ["Sample transcript", "Transcript", "v1", "—"],
        ["Sample language certificate", "Certificate", "v1", "2028-06 (sample)"],
      ],
    },
    {
      kind: "form",
      title: "Add a document",
      fields: [
        F.file("file", "File"),
        F.sel("kind", "Type", ["CV", "Transcript", "Certificate", "ID document", "Recommendation letter", "Essay", "Portfolio"]),
        F.date("expires", "Expiry date"),
      ],
      submit: "Upload (not available)",
    },
  ], {
    audience: "Registered user",
    explicitRoute: true,
  }),

  page("passport-skills", "/passport/skills", "Skill Passport", "A reusable record of your skills, projects and learning.", "profile", FC, [
    sampleNote,
    { kind: "stats", items: [{ label: "Skills", value: "12", hint: "sample" }, { label: "Projects", value: "4", hint: "sample" }, { label: "Certificates", value: "3", hint: "sample" }, { label: "Learning hours", value: "46", hint: "sample" }] },
    { kind: "progress", title: "Skill levels (sample)", items: [{ label: "Python", value: 70 }, { label: "Research methods", value: 50 }, { label: "Academic writing", value: 60 }, { label: "Public speaking", value: 45 }] },
    { kind: "notice", tone: "info", body: "Verified entries will show evidence and who verified them. Sharing will be controlled by you." },
  ], { parent: "profile" }),

  page("passport-opportunities", "/passport/opportunities", "Opportunity Passport", "Your journey: what you saved, applied for and achieved.", "profile", FC, [
    sampleNote,
    { kind: "stats", items: [{ label: "Saved", value: "9", hint: "sample" }, { label: "Applied", value: "4", hint: "sample" }, { label: "Interviews", value: "2", hint: "sample" }, { label: "Accepted", value: "1", hint: "sample" }] },
    { kind: "steps", title: "Journey timeline (sample)", items: [{ title: "Discovered", body: "Sample scholarship saved." }, { title: "Prepared", body: "Checklist and documents completed." }, { title: "Applied", body: "Submitted before the deadline." }, { title: "Achieved", body: "Outcome recorded with lessons learned." }] },
    { kind: "list", items: [{ title: "Your live applications", href: "/applications" }] },
  ], { parent: "profile" }),
];

// ───────────────────────── Grow ─────────────────────────
export const growPages: PageDef[] = [
  page("roadmaps", "/roadmaps", "My Roadmaps", "Step-by-step plans toward a goal or a specific opportunity.", "grow", FC, [
    { kind: "notice", tone: "warning", body: "Demo preview. Roadmaps are not generated or saved yet; this is a sample of the layout. See Find AI for the planned roadmap tool." },
    { kind: "progress", title: "Sample roadmap · 8 weeks to a scholarship application", items: [{ label: "Week 1–2 · Research and shortlist", value: 100 }, { label: "Week 3–4 · Documents", value: 60 }, { label: "Week 5–6 · Essays", value: 20 }, { label: "Week 7 · Review", value: 0 }, { label: "Week 8 · Submit", value: 0 }] },
    { kind: "list", items: [{ title: "Create a roadmap with Find AI (preview)", href: "/ai/roadmaps" }] },
  ], { audience: "Registered user" }),

  page("progress", "/progress", "My Progress", "Applications, learning and goals over time.", "grow", FC, [
    sampleNote,
    { kind: "stats", items: [{ label: "Applications started", value: "5", hint: "sample" }, { label: "Courses completed", value: "2", hint: "sample" }, { label: "Goals achieved", value: "3", hint: "sample" }, { label: "Weekly streak", value: "4", hint: "sample" }] },
    { kind: "progress", title: "Goals (sample)", items: [{ label: "Finish CV", value: 100 }, { label: "Submit 3 applications", value: 66 }, { label: "Complete a writing course", value: 40 }] },
    { kind: "list", title: "Real data", items: [{ title: "Open your dashboard", href: "/dashboard" }, { title: "Open the application tracker", href: "/applications" }] },
  ], { audience: "Registered user" }),

  hub("career", "/career", "Career Development", "Plan the next step after this opportunity.", "grow", FC, undefined, [
    { kind: "cards", title: "Start here", cols: 3, items: [{ title: "Career guidance with Find AI", body: "Preview", href: "/ai/career-guidance" }, { title: "Learning paths", body: "Academy", href: "/academy/paths" }, { title: "Find a mentor", body: "Mentors", href: "/mentors" }] },
  ]),
];

// ───────────────────────── Roles ─────────────────────────
export const rolePages: PageDef[] = [
  hub("roles", "/roles", "Experiences by Role", "How Find looks for students, mentors, instructors, moderators, organizations, universities and administrators.", "roles", FC, undefined, [
    { kind: "notice", tone: "warning", body: "These are frontend demo views. Role-based access is not implemented: viewing a role page does not give or imply any permission, and only the real admin area is protected." },
    { kind: "cards", title: "Portals", cols: 3, items: [{ title: "Organization portal", body: "Publish and manage opportunities.", href: "/organizations" }, { title: "University portal", body: "Student opportunities and engagement.", href: "/universities" }, { title: "Administrator", body: "Real admin area (sign-in and admin role required).", href: "/admin" }] },
  ]),

  dash("role-student", "/roles/student", "Student Journey", "A student's path from discovery to outcome.", "roles", FC, [
    sampleNote,
    {
      kind: "steps",
      items: [
        { title: "Discover", body: "Search and save opportunities." },
        { title: "Understand", body: "Profile and passports." },
        { title: "Prepare", body: "Preparation Center and Academy." },
        { title: "Connect", body: "Mentors, communities, teams." },
        { title: "Apply and grow", body: "Track applications and outcomes." },
      ],
    },
    {
      kind: "list",
      items: [
        { title: "My dashboard", href: "/dashboard" },
        { title: "Preparation Center", href: "/prepare" },
      ],
    },
  ], "roles", { audience: "Student" }),

  dash("role-mentor", "/roles/mentor", "Mentor Dashboard (demo)", "Requests, sessions and feedback.", "roles", FC, [
    sampleNote,
    { kind: "stats", items: [{ label: "Open requests", value: "3", hint: "sample" }, { label: "Sessions this month", value: "6", hint: "sample" }, { label: "Average rating", value: "4.8", hint: "sample" }] },
    { kind: "table", title: "Sample requests", columns: ["Mentee", "Topic", "Status"], rows: [["Student A (sample)", "Scholarship essay", "Pending"], ["Student B (sample)", "Research path", "Pending"]] },
    { kind: "list", items: [{ title: "Apply to become a mentor", href: "/mentors/apply" }] },
  ], "roles", { audience: "Mentor" }),

  dash("role-instructor", "/roles/instructor", "Instructor Dashboard (demo)", "Courses, learners and assignments.", "roles", FC, [
    sampleNote,
    { kind: "stats", items: [{ label: "Active courses", value: "2", hint: "sample" }, { label: "Learners", value: "148", hint: "sample" }, { label: "Assignments to review", value: "17", hint: "sample" }] },
    { kind: "table", title: "Sample submissions", columns: ["Learner", "Assignment", "Status"], rows: [["Learner A (sample)", "Draft paragraph", "To review"], ["Learner B (sample)", "CV review", "To review"]] },
  ], "roles", { audience: "Instructor" }),

  dash("role-moderator", "/roles/moderator", "Moderator Dashboard (demo)", "Reports and community health.", "roles", FC, [
    sampleNote,
    { kind: "stats", items: [{ label: "Open reports", value: "5", hint: "sample" }, { label: "Removed this week", value: "2", hint: "sample" }] },
    {
      kind: "list",
      items: [
        { title: "Community moderation view", href: "/community/moderation" },
        { title: "Community guidelines", href: "/community/guidelines" },
      ],
    },
  ], "roles", { audience: "Moderator" }),
];

export { sampleNote };