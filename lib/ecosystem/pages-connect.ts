import { F, FC, RI, coll, dash, detail, form, hub, page } from "./dsl";
import { sampleNote } from "./pages-core";
import type { PageDef } from "./types";

// ───────────────────────── Community ─────────────────────────
export const communityPages: PageDef[] = [
  hub("community", "/community", "Find Community", "Spaces for people who share interests, goals and opportunities.", "community", FC, undefined, [
    { kind: "notice", tone: "info", body: "Demo preview: communities, posts and members are sample data. Joining, posting and moderation are not connected." },
    { kind: "collection", collection: "communities", limit: 6, title: "Sample communities" },
  ], { explicitRoute: true }),

  coll("community-feed", "/community/feed", "Community Feed", "Recent posts from your communities.", "community", FC, "posts", undefined, "community"),
  coll("community-interest", "/community/interest", "Interest-Based Communities", "Communities around a field or topic.", "community", FC, "communities", "interest", "community"),
  coll("community-goals", "/community/goals", "Goal-Based Communities", "Communities around a goal.", "community", FC, "communities", "goal", "community"),
  coll("community-research", "/community/research", "Research Communities", "Reading groups and research questions.", "community", FC, "communities", "research", "community"),
  coll("community-opportunities", "/community/opportunities", "Opportunity Communities", "Communities for a type of opportunity.", "community", FC, "communities", "opportunity", "community"),
  coll("community-careers", "/community/careers", "Career Communities", "Communities for a career path.", "community", FC, "communities", "career", "community"),

  detail("community-detail", "/community/[slug]", "Community", "About, rules, posts and members.", "community", "communities", "community", "Join community (not available)"),

  coll("community-discussions", "/community/discussions", "Discussions", "Open conversations.", "community", FC, "posts", "discussion", "community"),
  coll("community-questions", "/community/questions", "Questions and Answers", "Ask and answer questions.", "community", FC, "posts", "question", "community"),

  page("community-post", "/community/posts/[slug]", "Post", "A post with its comments and replies.", "community", FC, [
    { kind: "item" },
    {
      kind: "list",
      title: "Comments and replies (sample)",
      items: [
        { title: "Sample comment: a helpful suggestion.", meta: "Sample ─ 2 replies" },
        { title: "Sample reply: thanks, that worked.", meta: "Sample" },
      ],
    },
    {
      kind: "form",
      title: "Add a comment",
      fields: [F.area("comment", "Your comment", true, { minLength: 3 })],
      submit: "Comment (not available)",
      note: "Not connected: comments are not posted.",
    },
  ], { detailOf: "posts", parent: "community-feed" }),

  coll("community-resources", "/community/resources", "Community Resources", "Guides and templates shared with communities.", "community", FC, "resources", undefined, "community"),
  coll("community-members", "/community/members", "Members", "Sample member profiles.", "community", FC, "members", undefined, "community"),

  detail("community-member-detail", "/community/members/[slug]", "Member Profile", "A community member's public profile.", "community", "members", "community-members", "Follow (not available)"),

  coll("community-events", "/community/events", "Community Events", "Events hosted by communities.", "community", FC, "events", undefined, "community"),

  page("community-guidelines", "/community/guidelines", "Community Guidelines", "How we keep Find communities safe and useful.", "community", FC, [
    {
      kind: "list",
      title: "Be respectful",
      items: [
        { title: "Disagree with ideas, not people." },
        { title: "No harassment, hate or discrimination." },
      ],
    },
    {
      kind: "list",
      title: "Be honest",
      items: [
        { title: "Do not invent achievements or credentials." },
        { title: "Say when you are sharing an opinion." },
      ],
    },
    {
      kind: "list",
      title: "Keep it safe",
      items: [
        { title: "Do not share passwords, IDs or private documents." },
        { title: "Report anything that worries you." },
      ],
    },
    {
      kind: "notice",
      tone: "info",
      body: "Moderation tooling and abuse prevention must exist before public posting opens.",
    },
  ], { parent: "community" }),

  form(
    "community-report",
    "/community/report",
    "Report Content",
    "Tell moderators about a problem.",
    "community",
    RI,
    [
      F.sel("type", "What are you reporting?", ["Post", "Comment", "Member", "Community"], true),
      F.url("link", "Link"),
      F.sel("reason", "Reason", ["Harassment", "Spam", "Misinformation", "Unsafe content", "Other"], true),
      F.area("details", "Details", true, { minLength: 10 }),
    ],
    "Send report (not available)",
    "community",
    "Requires backend: reports are not stored or sent to moderators."
  ),

  dash("community-moderation", "/community/moderation", "Moderation Dashboard (demo)", "Reports queue and community health.", "community", FC, [
    sampleNote,
    {
      kind: "stats",
      items: [
        { label: "Open reports", value: "5", hint: "sample" },
        { label: "Hidden this week", value: "3", hint: "sample" },
        { label: "Members", value: "1.2k", hint: "sample" },
      ],
    },
    {
      kind: "kanban",
      columns: [
        { title: "New", items: ["Spam post (sample)", "Rude comment (sample)"] },
        { title: "In review", items: ["Misinformation claim (sample)"] },
        { title: "Resolved", items: ["Duplicate report (sample)"] },
      ],
    },
    {
      kind: "notice",
      tone: "warning",
      body: "Requires backend and moderator roles. This view is not protected: it is a layout demonstration only.",
    },
  ], "community", { audience: "Moderator" }),
];

// ───────────────────────── Mentors ─────────────────────────
export const mentorPages: PageDef[] = [
  hub("mentors", "/mentors", "Find Mentors", "People who have been where you want to go.", "mentors", FC, undefined, [
    { kind: "notice", tone: "info", body: "Demo preview: mentors are invented sample profiles. No credentials are claimed and no request or booking is sent." },
    { kind: "collection", collection: "mentors", limit: 4, title: "Sample mentors" },
  ], { explicitRoute: true }),

  coll("mentors-directory", "/mentors/directory", "Mentor Directory", "Search by name, expertise or language.", "mentors", FC, "mentors", undefined, "mentors"),

  detail("mentor-detail", "/mentors/[slug]", "Mentor Profile", "Expertise, languages and availability.", "mentors", "mentors", "mentors-directory", "Request mentorship (not available)"),

  page("mentors-matching", "/mentors/matching", "Mentor Matching", "Tell us your goal and we suggest mentors.", "mentors", FC, [
    {
      kind: "notice",
      tone: "warning",
      body: "Demo preview. The result is a fixed, hand-written sample. It is not generated by AI and does not use what you enter. Mentor matching is not connected.",
    },
    {
      kind: "tool",
      fields: [
        F.text("goal", "Your goal", true),
        F.sel("field", "Field", ["Scholarships", "Research", "Data science", "Engineering", "Entrepreneurship"]),
        F.sel("lang", "Language", ["English", "Arabic"]),
      ],
      runLabel: "Preview sample matches",
      sample: {
        title: "Sample matches",
        items: [
          "Dr. Salma Reda: scholarship strategy (sample)",
          "Karim Fouad: research careers (sample)",
        ],
      },
    },
  ], { parent: "mentors" }),

  form(
    "mentors-requests",
    "/mentors/requests",
    "Mentorship Requests",
    "Ask a mentor for guidance.",
    "mentors",
    RI,
    [
      F.sel("mentor", "Mentor", ["Dr. Salma Reda (sample)", "Karim Fouad (sample)", "Nada Hassan (sample)"], true),
      F.area("message", "What do you want help with?", true, { minLength: 20 }),
      F.sel("format", "Preferred format", ["One session", "Ongoing"]),
    ],
    "Send request (not available)",
    "mentors",
    "Requires backend: requests are not sent."
  ),

  page("mentors-book", "/mentors/book", "Book a Session", "Choose a time that works.", "mentors", RI, [
    {
      kind: "notice",
      tone: "warning",
      body: "Requires integration: calendar and booking are not connected. Nothing is booked.",
    },
    {
      kind: "form",
      fields: [
        F.sel("mentor", "Mentor", ["Dr. Salma Reda (sample)", "Karim Fouad (sample)"], true),
        F.date("date", "Date", true),
        F.sel("slot", "Time slot", ["09:00", "11:00", "16:00", "19:00"], true),
        F.text("topic", "Topic", true),
      ],
      submit: "Book (not available)",
    },
  ], { parent: "mentors" }),

  page("mentors-sessions", "/mentors/sessions", "Available Sessions", "Open times offered by mentors.", "mentors", FC, [
    sampleNote,
    {
      kind: "table",
      columns: ["Mentor", "Topic", "When", "Format"],
      rows: [
        ["Dr. Salma Reda (sample)", "Scholarship essay", "Sample date, 11:00", "Online"],
        ["Karim Fouad (sample)", "Research path", "Sample date, 16:00", "Online"],
      ],
    },
  ], { parent: "mentors" }),

  dash("mentors-dashboard", "/mentors/dashboard", "Mentorship Dashboard", "Your mentors, requests and upcoming sessions.", "mentors", FC, [
    sampleNote,
    {
      kind: "stats",
      items: [
        { label: "Active mentors", value: "1", hint: "sample" },
        { label: "Upcoming sessions", value: "2", hint: "sample" },
        { label: "Completed sessions", value: "5", hint: "sample" },
      ],
    },
    {
      kind: "list",
      items: [
        { title: "Request a mentor", href: "/mentors/requests" },
        { title: "Session history", href: "/mentors/history" },
      ],
    },
  ], "mentors", { audience: "Mentee" }),

  page("mentors-history", "/mentors/history", "Session History", "Past sessions and notes.", "mentors", FC, [
    sampleNote,
    {
      kind: "table",
      columns: ["Date", "Mentor", "Topic", "Notes"],
      rows: [["Sample date", "Dr. Salma Reda (sample)", "Essay outline", "Follow-up tasks (sample)"]],
    },
  ], { parent: "mentors-dashboard" }),

  page("mentors-reviews", "/mentors/reviews", "Feedback and Reviews", "Share feedback after a session.", "mentors", RI, [
    sampleNote,
    {
      kind: "list",
      title: "Sample reviews",
      items: [
        { title: "Clear and practical advice. (sample)", meta: "Sample" },
        { title: "Helped me plan my timeline. (sample)", meta: "Sample" },
      ],
    },
    {
      kind: "form",
      fields: [
        F.sel("rating", "Rating", ["5", "4", "3", "2", "1"], true),
        F.area("review", "Your review", true, { minLength: 10 }),
      ],
      submit: "Submit review (not available)",
      note: "Requires backend: reviews are not stored.",
    },
  ], { parent: "mentors" }),

  form(
    "mentors-apply",
    "/mentors/apply",
    "Become a Mentor",
    "Apply to mentor others.",
    "mentors",
    RI,
    [
      F.text("name", "Full name", true),
      F.email("email", "Email", true),
      F.text("field", "Field of expertise", true),
      F.area("experience", "Relevant experience", true, { minLength: 30 }),
      F.url("link", "Profile link"),
      F.check("verify", "I understand my experience will be verified before I am listed"),
    ],
    "Apply (not available)",
    "mentors",
    "Requires backend: applications are not stored. Mentors are only listed after verification."
  ),
];

// ───────────────────────── Success stories / Someone Who Did It ─────────────────────────
export const storyPages: PageDef[] = [
  coll(
    "stories",
    "/success-stories",
    "Success Stories",
    "Practical case studies of how people prepared and applied.",
    "stories",
    FC,
    "stories",
    undefined,
    undefined,
    [
      {
        kind: "notice",
        tone: "info",
        body: "Demo preview: these stories are invented layouts. Real stories will be published only with the person's consent and verification.",
      },
    ],
    { explicitRoute: true },
  ),

  detail("story-detail", "/success-stories/[slug]", "Success Story", "Background, preparation, application and advice.", "stories", "stories", "stories", "Ask this contributor (not available)"),

  coll("stories-scholarships", "/success-stories/scholarships", "Scholarship Experiences", "Stories about scholarships.", "stories", FC, "stories", "scholarship", "stories"),
  coll("stories-fellowships", "/success-stories/fellowships", "Fellowship Experiences", "Stories about fellowships.", "stories", FC, "stories", "fellowship", "stories"),
  coll("stories-research", "/success-stories/research", "Research Experiences", "Stories about research positions.", "stories", FC, "stories", "research", "stories"),
  coll("stories-internships", "/success-stories/internships", "Internship Experiences", "Stories about internships.", "stories", FC, "stories", "internship", "stories"),
  coll("stories-exchange", "/success-stories/exchange", "Exchange Experiences", "Stories about exchange programs.", "stories", FC, "stories", "exchange", "stories"),

  hub("swdi", "/someone-who-did-it", "Someone Who Did It", "Learn from people who already achieved what you are aiming for.", "stories", FC, undefined, [
    { kind: "notice", tone: "info", body: "Demo preview with sample stories and contributors." },
    { kind: "collection", collection: "stories", limit: 3, title: "Sample stories" },
  ]),

  form(
    "swdi-ask",
    "/someone-who-did-it/ask",
    "Ask Someone Who Did It",
    "Ask a question about an opportunity.",
    "stories",
    RI,
    [
      F.text("opportunity", "Opportunity", true),
      F.area("question", "Your question", true, { minLength: 15 }),
      F.check("public", "Allow my question to be shown publicly"),
    ],
    "Send question (not available)",
    "swdi",
    "Requires backend: questions are not stored or sent."
  ),

  page("swdi-advice", "/someone-who-did-it/advice", "Application Advice and Lessons Learned", "Patterns that come up again and again (sample).", "stories", FC, [
    sampleNote,
    {
      kind: "list",
      title: "Advice (sample)",
      items: [
        { title: "Start earlier than you think you need to." },
        { title: "Ask for feedback on drafts." },
        { title: "Keep a running list of achievements." },
      ],
    },
    {
      kind: "list",
      title: "Common mistakes (sample)",
      items: [
        { title: "Sending the same letter everywhere." },
        { title: "Waiting until the last day for references." },
      ],
    },
  ], { parent: "swdi" }),

  coll("swdi-contributors", "/someone-who-did-it/contributors", "Contributor Profiles", "People who share their experience.", "stories", FC, "network", "contributor", "swdi"),
];

// ───────────────────────── Team Finder ─────────────────────────
export const teamPages: PageDef[] = [
  hub("teams", "/teams", "Find Team Finder", "Find teammates and collaborators for research, competitions, startups and projects.", "teams", FC, undefined, [
    { kind: "notice", tone: "info", body: "Demo preview: teams and people are sample data. Requests are not sent." },
    { kind: "collection", collection: "teams", limit: 3, title: "Sample teams" },
  ]),

  coll("teams-discover", "/teams/discover", "Discover Teammates", "People looking to team up.", "teams", FC, "members", undefined, "teams"),

  form(
    "teams-create",
    "/teams/create",
    "Create a Team",
    "Describe your team and who you need.",
    "teams",
    RI,
    [
      F.text("name", "Team name", true),
      F.sel("type", "Type", ["Research", "Competition", "Startup", "Project"], true),
      F.area("goal", "Goal", true, { minLength: 15 }),
      F.text("roles", "Roles needed"),
      F.num("size", "Team size"),
    ],
    "Create team (not available)",
    "teams",
    "Requires backend: teams are not stored."
  ),

  coll("teams-collaborators", "/teams/collaborators", "Find Collaborators", "Contributors open to collaboration.", "teams", FC, "network", "contributor", "teams"),
  coll("teams-research", "/teams/research", "Research Teammates", "Teams for research projects.", "teams", FC, "teams", "research", "teams"),
  coll("teams-competitions", "/teams/competitions", "Competition Teams", "Teams for competitions and hackathons.", "teams", FC, "teams", "competition", "teams"),
  coll("teams-startups", "/teams/startups", "Startup Teams", "Teams building a venture.", "teams", FC, "teams", "startup", "teams"),
  coll("teams-projects", "/teams/projects", "Project Teams", "Teams for study and open projects.", "teams", FC, "teams", "project", "teams"),

  page("teams-skills", "/teams/skills", "Your Skills and Interests", "What you bring to a team.", "teams", FC, [
    {
      kind: "form",
      fields: [
        F.text("skills", "Skills", true),
        F.text("interests", "Interests"),
        F.sel("avail", "Availability", ["A few hours a week", "Part time", "Full time"]),
        F.check("visible", "Show me in Discover Teammates"),
      ],
      submit: "Save (not available)",
      note: "Not connected: nothing is saved.",
    },
  ], { parent: "teams" }),

  page("teams-requests", "/teams/requests", "Team Requests", "Requests you sent and received.", "teams", RI, [
    sampleNote,
    {
      kind: "table",
      columns: ["Team", "Direction", "Status"],
      rows: [
        ["Climate Data Research Team (sample)", "Sent", "Pending"],
        ["Campus Marketplace Startup (sample)", "Received", "New"],
      ],
    },
  ], { parent: "teams" }),

  detail("team-detail", "/teams/[slug]", "Team Profile", "Goals, roles needed and collaboration details.", "teams", "teams", "teams", "Request to join (not available)"),
];

// ───────────────────────── Events ─────────────────────────
export const eventPages: PageDef[] = [
  hub("events", "/events", "Find Events", "Workshops, webinars, conferences and networking.", "events", FC, undefined, [
    { kind: "notice", tone: "info", body: "Demo preview: events are sample data with sample dates. Registration is not connected." },
    { kind: "collection", collection: "events", limit: 4, title: "Sample upcoming events" },
  ]),

  page("events-calendar", "/events/calendar", "Events Calendar", "A month view of sample events.", "events", FC, [
    { kind: "notice", tone: "warning", body: "Demo preview: sample events for a sample month. Calendar sync requires integration." },
    {
      kind: "calendar",
      events: [
        { day: 4, title: "Scholarship Q&A Webinar" },
        { day: 9, title: "CV Clinic" },
        { day: 12, title: "Research Careers Panel" },
        { day: 15, title: "Student Networking Evening" },
        { day: 18, title: "Career Fair Preview" },
      ],
    },
    { kind: "list", items: [{ title: "Real application deadlines", href: "/calendar" }] },
  ], { parent: "events" }),

  coll("events-upcoming", "/events/upcoming", "Upcoming Events", "All sample events.", "events", FC, "events", undefined, "events"),
  coll("events-workshops", "/events/workshops", "Workshops", "Hands-on sessions.", "events", FC, "events", "workshop", "events"),
  coll("events-webinars", "/events/webinars", "Webinars", "Online talks and panels.", "events", FC, "events", "webinar", "events"),
  coll("events-conferences", "/events/conferences", "Conferences", "Larger events.", "events", FC, "events", "conference", "events"),
  coll("events-networking", "/events/networking", "Networking Events", "Meet people.", "events", FC, "events", "networking", "events"),
  coll("events-career-fairs", "/events/career-fairs", "Career Fairs", "Meet organizations.", "events", FC, "events", "career-fair", "events"),

  detail("event-detail", "/events/[slug]", "Event Details", "Agenda, location and registration.", "events", "events", "events", "Register (not available)"),

  form(
    "events-register",
    "/events/register",
    "Event Registration",
    "Reserve a place.",
    "events",
    RI,
    [
      F.sel("event", "Event", ["Scholarship Q&A Webinar (sample)", "CV Clinic (sample)", "Student Networking Evening (sample)"], true),
      F.text("name", "Full name", true),
      F.email("email", "Email", true),
      F.check("reminder", "Remind me before it starts"),
    ],
    "Register (not available)",
    "events",
    "Requires backend and email: no registration is created."
  ),

  page("events-attendance", "/events/attendance", "Attendance", "Check in and see your attendance record.", "events", RI, [
    { kind: "notice", tone: "warning", body: "Requires backend: check-in codes and attendance records are not connected." },
    { kind: "form", fields: [F.text("code", "Check-in code", true)], submit: "Check in (not available)" },
    {
      kind: "table",
      title: "Sample record",
      columns: ["Event", "Attended"],
      rows: [
        ["CV Clinic (sample)", "Yes"],
        ["Research Careers Panel (sample)", "No"],
      ],
    },
  ], { parent: "events" }),

  page("events-resources", "/events/resources", "Event Resources", "Slides and handouts from past events.", "events", FC, [
    sampleNote,
    { kind: "collection", collection: "resources", limit: 4 },
  ], { parent: "events" }),

  page("events-recordings", "/events/recordings", "Recordings", "Watch past sessions.", "events", RI, [
    { kind: "notice", tone: "warning", body: "Requires integration: video hosting is not connected." },
    {
      kind: "list",
      title: "Sample layout",
      items: [
        { title: "Scholarship Q&A Webinar (sample recording)", meta: "Sample ─ 48 min" },
        { title: "Research Careers Panel (sample recording)", meta: "Sample ─ 55 min" },
      ],
    },
  ], { parent: "events" }),
];

// ───────────────────────── Resources ─────────────────────────
export const resourcePages: PageDef[] = [
  coll("resources", "/resources", "Resource Library", "Searchable guides, templates and checklists.", "resources", FC, "resources", undefined, undefined, [
    { kind: "notice", tone: "info", body: "Demo preview: resources are sample entries. Downloads are not connected." },
  ]),

  detail("resource-detail", "/resources/[slug]", "Resource", "What is inside and how to use it.", "resources", "resources", "resources", "Download (not available)"),

  page("resources-saved", "/resources/saved", "Saved Resources", "Resources you saved.", "resources", FC, [
    sampleNote,
    { kind: "collection", collection: "resources", limit: 3 },
  ], { parent: "resources" }),

  page("resources-downloads", "/resources/downloads", "Downloads", "Your downloaded files.", "resources", RI, [
    { kind: "notice", tone: "warning", body: "Requires backend: file storage and download tracking are not connected." },
    {
      kind: "table",
      columns: ["File", "Type", "Action"],
      rows: [["Simple CV Template (sample)", "DOCX", "Download (not available)"]],
    },
  ], { parent: "resources" }),

  coll("resources-cv-templates", "/resources/cv-templates", "CV Templates", "Templates for CVs.", "resources", FC, "resources", "cv-template", "resources"),
  coll("resources-letter-templates", "/resources/motivation-letter-templates", "Motivation Letter Templates", "Templates for letters and statements.", "resources", FC, "resources", "letter-template", "resources"),
  coll("resources-research-guides", "/resources/research-guides", "Research Guides", "Guides for researchers.", "resources", FC, "resources", "research-guide", "resources"),
  coll("resources-scholarship-guides", "/resources/scholarship-guides", "Scholarship Guides", "Guides for scholarship applications.", "resources", FC, "resources", "scholarship-guide", "resources"),
  coll("resources-interview-guides", "/resources/interview-guides", "Interview Guides", "Guides for interviews.", "resources", FC, "resources", "interview-guide", "resources"),
  coll("resources-checklists", "/resources/application-checklists", "Application Checklists", "Checklists for applications.", "resources", FC, "resources", "checklist", "resources"),
];

// ───────────────────────── Network ─────────────────────────
export const networkPages: PageDef[] = [
  hub("network", "/network", "Find Network", "Connect with people who can share knowledge, experience and opportunities.", "network", FC, undefined, [
    { kind: "notice", tone: "info", body: "Demo preview: network members and profiles are sample data. Connecting and messaging are not available." },
    { kind: "collection", collection: "network", limit: 6, title: "Explore the Find Network" },
  ]),

  coll("network-members", "/network/members", "Member Discovery", "Find people in the network.", "network", FC, "network", undefined, "network"),
  coll("network-alumni", "/network/alumni", "Alumni Directory", "Alumni who achieved an opportunity.", "network", FC, "network", "alumni", "network"),
  coll("network-ambassadors", "/network/ambassadors", "Ambassadors", "Campus and community ambassadors.", "network", FC, "network", "ambassador", "network"),
  coll("network-contributors", "/network/contributors", "Contributors", "People who share knowledge.", "network", FC, "network", "contributor", "network"),
  coll("network-trainers", "/network/trainers", "Trainers", "Trainers and facilitators.", "network", FC, "network", "trainer", "network"),
  coll("network-leaders", "/network/community-leaders", "Community Leaders", "People who lead communities.", "network", FC, "network", "leader", "network"),
  coll("network-participants", "/network/participants", "Successful Participants", "People who completed programs.", "network", FC, "network", "participant", "network"),

  page("network-opportunities", "/network/opportunities", "Networking Opportunities", "Ways to meet people.", "network", FC, [
    {
      kind: "cards",
      cols: 3,
      items: [
        { title: "Networking events", body: "Sample events.", href: "/events/networking" },
        { title: "Communities", body: "Join a space.", href: "/community" },
        { title: "Mentors", body: "Ask for guidance.", href: "/mentors" },
      ],
    },
  ], { parent: "network" }),

  detail("network-detail", "/network/[slug]", "Network Profile", "Background and how this person can help.", "network", "network", "network-members", "Connect (not available)"),
];