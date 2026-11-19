import { F, FC, hub, page, tool, work } from "./dsl";
import { sampleNote } from "./pages-core";
import type { PageDef } from "./types";

type Step = [string, string];
type Row = [slug: string, title: string, summary: string, inputLabel: string, tips: [string, string]];

const steps = {
  career: [["Review", "Read the guidance and examples."], ["Draft", "Write using only your real experience."], ["Refine", "Ask a mentor or peer to review."]] as Step[],
  application: [["Understand", "Read what the opportunity asks for."], ["Plan", "List your evidence and gaps."], ["Write", "Draft, then revise for clarity."]] as Step[],
  research: [["Question", "State what you want to find out."], ["Method", "Choose how you will find out."], ["Record", "Keep notes so others can follow."]] as Step[],
  interview: [["Prepare", "Read the opportunity and your own application."], ["Practice", "Answer aloud, in your own words."], ["Reflect", "Note what to improve."]] as Step[],
  opportunity: [["Know the program", "What it values and requires."], ["Collect evidence", "Experience and documents you really have."], ["Plan the timeline", "Work backwards from the deadline."]] as Step[],
};

function group(id: string, route: string, title: string, summary: string, key: keyof typeof steps, rows: Row[]): PageDef[] {
  return [
    hub(`prep-${id}`, route, title, summary, "prepare", FC, "prepare"),
    ...rows.map(([slug, t, s, label, tips]) => work(`prep-${id}-${slug}`, `${route}/${slug}`, t, s, "prepare", `prep-${id}`, steps[key], label, tips)),
  ];
}

export const preparePages: PageDef[] = [
  hub("prepare", "/prepare", "Preparation Center", "Become ready, not just informed: career, application, research, interview and opportunity-specific preparation.", "prepare", FC, undefined, [
    { kind: "notice", tone: "info", body: "Demo preview. These workspaces show the planned experience. Notes and drafts are not saved, and no AI feedback is generated." },
  ]),

  // Career preparation
  hub("prep-career", "/prepare/career", "Career Preparation", "CV, LinkedIn, personal brand, networking and communication.", "prepare", FC, "prepare"),
  page("prep-career-cv-builder", "/prepare/career/cv-builder", "CV Builder", "Build a clear CV from your real experience.", "prepare", FC, [
    sampleNote,
    { kind: "steps", title: "Sections", items: [{ title: "Header", body: "Name and contact details." }, { title: "Education", body: "Degrees and relevant courses." }, { title: "Experience", body: "Roles with results you can evidence." }, { title: "Skills and projects", body: "Only what you can demonstrate." }] },
    { kind: "form", title: "CV details", fields: [F.text("name", "Full name", true), F.email("email", "Email", true), F.area("summary", "Short summary", false, { minLength: 20 }), F.area("education", "Education"), F.area("experience", "Experience"), F.area("skills", "Skills")], submit: "Save CV draft", note: "Not connected: your CV is not saved or exported yet." },
  ], { parent: "prep-career" }),
  tool("prep-career-cv-review", "/prepare/career/cv-review", "CV Review", "Structured feedback on your CV.", "prepare", FC, [F.file("cv", "Upload your CV", "Not uploaded in this demo"), F.text("target", "Target opportunity")], { title: "Sample review", items: ["Clear structure (sample)", "Add measurable results (sample)", "Trim the skills list (sample)"] }, "prep-career"),
  ...[
    ["linkedin", "LinkedIn Optimization", "Make your profile clear and findable.", "Paste your headline and About section", ["Use a headline that says what you do", "Keep your About section specific"]],
    ["personal-branding", "Personal Branding", "Describe who you are and what you offer.", "Write your one-sentence introduction", ["Be specific, not generic", "Keep it consistent across your CV and profiles"]],
    ["networking", "Networking", "Start and keep professional conversations.", "Draft an outreach message", ["Ask a specific, small question", "Follow up politely once"]],
    ["communication", "Professional Communication", "Emails, messages and meetings.", "Paste an email draft", ["State the purpose in the first line", "Keep it short"]],
  ].map(([slug, t, s, l, tips]) => work(`prep-career-${slug}`, `/prepare/career/${slug}`, t as string, s as string, "prepare", "prep-career", steps.career, l as string, tips as string[])),

  // Application preparation
  ...group("application", "/prepare/application", "Application Preparation", "Letters, statements, essays, strategy, checklists and planning.", "application", [
    ["motivation-letters", "Motivation Letters", "Plan a letter that is specific to the program.", "Why this program, in your words", ["Name something specific about the program", "Connect it to real experience"]],
    ["personal-statements", "Personal Statements", "Tell your story with focus.", "Key moments to include", ["Choose one thread", "Show, do not list"]],
    ["essays", "Essays", "Answer the question that was asked.", "Paste the essay question", ["Underline what the question asks", "Outline before writing"]],
  ]),
  work("prep-application-strategy", "/prepare/application/strategy", "Application Strategy", "Decide where to apply and in what order.", "prepare", "prep-application", steps.application, "List the opportunities you are considering", ["Balance ambitious and realistic options", "Check each deadline first"]),
  page("prep-application-checklists", "/prepare/application/checklists", "Document Checklists", "Track every document for an application.", "prepare", FC, [
    sampleNote,
    { kind: "kanban", columns: [{ title: "To do", items: ["Reference letter", "Language certificate"] }, { title: "In progress", items: ["Motivation letter"] }, { title: "Done", items: ["CV", "Transcript"] }] },
    { kind: "list", items: [{ title: "Your real application checklists", href: "/applications" }] },
  ], { parent: "prep-application" }),
  page("prep-application-planning", "/prepare/application/planning", "Application Planning", "Plan time across applications.", "prepare", FC, [
    sampleNote,
    { kind: "progress", title: "Sample plan", items: [{ label: "Research programs", value: 100 }, { label: "Prepare documents", value: 60 }, { label: "Write essays", value: 25 }, { label: "Review and submit", value: 0 }] },
    { kind: "list", items: [{ title: "See real deadlines", href: "/deadlines" }, { title: "Deadline calendar", href: "/calendar" }] },
  ], { parent: "prep-application" }),

  // Research preparation
  ...group("research", "/prepare/research", "Research Preparation", "Methodology, literature reviews, academic writing, tools and projects.", "research", [
    ["methodology", "Research Methodology", "Choose methods that answer your question.", "Your research question", ["Match the method to the question", "Write down your assumptions"]],
    ["literature-reviews", "Literature Reviews", "Find, read and organise sources.", "Search terms you will try", ["Keep a log of searches", "Summarise each source in two sentences"]],
    ["academic-writing", "Academic Writing", "Structure, clarity and citation.", "Paste a paragraph to revise", ["One idea per paragraph", "Cite as you write"]],
    ["tools", "Research Tools", "Reference managers, notebooks and data tools.", "Which tools do you use now?", ["Pick one reference manager and stay with it", "Back up your notes"]],
    ["projects", "Research Projects", "Plan a small project from start to finish.", "Describe your project idea", ["Keep scope small", "Agree milestones with a supervisor"]],
  ]),

  // Interview preparation
  hub("prep-interview", "/prepare/interview", "Interview Preparation", "Mock interviews, questions, feedback and progress.", "prepare", FC, "prepare"),
  page("prep-interview-mock", "/prepare/interview/mock", "Mock Interviews", "Practice with a realistic format.", "prepare", FC, [
    { kind: "notice", tone: "warning", body: "Demo preview. Recording, scoring and AI or mentor feedback are not connected." },
    { kind: "steps", title: "Session flow (sample)", items: [{ title: "Warm-up", body: "Introduce yourself." }, { title: "Questions", body: "Three questions on your background." }, { title: "Your turn", body: "Ask the interviewer a question." }, { title: "Feedback", body: "Written notes after the session." }] },
    { kind: "form", fields: [F.sel("kind", "Interview type", ["Scholarship", "Internship", "Research", "Fellowship"], true), F.date("when", "Preferred date")], submit: "Request a mock interview (not available)", note: "Not connected: nothing is scheduled." },
  ], { parent: "prep-interview" }),
  page("prep-interview-questions", "/prepare/interview/questions", "Interview Questions", "Common questions and how to structure answers.", "prepare", FC, [
    { kind: "list", title: "General (sample)", items: [{ title: "Tell me about yourself." }, { title: "Why do you want this?" }, { title: "Describe a challenge you handled." }] },
    { kind: "list", title: "Research (sample)", items: [{ title: "What question are you trying to answer?" }, { title: "How would you check your result?" }] },
    { kind: "list", items: [{ title: "Interview guides in the Resource Library", href: "/resources/interview-guides" }] },
  ], { parent: "prep-interview" }),
  page("prep-interview-opportunity", "/prepare/interview/opportunity-questions", "Opportunity-Specific Questions", "Questions to expect for a particular type of opportunity.", "prepare", FC, [
    { kind: "list", title: "Scholarship (sample)", items: [{ title: "How will this scholarship change your plans?" }, { title: "What will you do after the program?" }] },
    { kind: "list", title: "Internship (sample)", items: [{ title: "What do you want to learn here?" }, { title: "Describe a time you worked in a team." }] },
  ], { parent: "prep-interview" }),
  page("prep-interview-feedback", "/prepare/interview/feedback", "Interview Feedback", "Notes from practice sessions.", "prepare", FC, [
    sampleNote,
    { kind: "table", columns: ["Session", "Strength", "To improve"], rows: [["Mock 1 (sample)", "Clear structure", "Add examples"], ["Mock 2 (sample)", "Confident delivery", "Shorter answers"]] },
  ], { parent: "prep-interview" }),
  page("prep-interview-progress", "/prepare/interview/progress", "Interview Progress", "Track improvement over time.", "prepare", FC, [
    sampleNote,
    { kind: "progress", items: [{ label: "Structure", value: 70 }, { label: "Examples", value: 50 }, { label: "Delivery", value: 65 }] },
  ], { parent: "prep-interview" }),

  // Opportunity-specific preparation
  ...group("opportunity", "/prepare/opportunity", "Opportunity-Specific Preparation", "Scholarships, fellowships, internships, exchange and competitions.", "opportunity", [
    ["scholarships", "Scholarship Preparation", "From shortlist to submission.", "Which scholarship are you preparing for?", ["Read the selection criteria twice", "Ask referees early"]],
    ["fellowships", "Fellowship Preparation", "Plan a fellowship application.", "Which fellowship are you preparing for?", ["Show your plan, not only your past", "Align with the host's aims"]],
    ["internships", "Internship Preparation", "CV, outreach and interviews for internships.", "Which role are you targeting?", ["Tailor your CV to the role", "Prepare two stories"]],
    ["exchange", "Exchange Preparation", "Courses, documents and logistics.", "Which exchange are you preparing for?", ["Check course equivalence early", "Plan funding and housing"]],
    ["competitions", "Competition Preparation", "Teams, practice and submission.", "Which competition are you preparing for?", ["Choose teammates with complementary skills", "Rehearse the final presentation"]],
  ]),
];
