import type { CollectionId, DemoItem } from "./types";

/**
 * SAMPLE DATA ONLY. Every person, course, community, event and story below is
 * invented for layout demonstration. Nothing here is real platform data, and the
 * UI labels it "Sample" everywhere it appears. Replace with API-backed data later
 * (see docs/FRONTEND_BACKEND_REQUIREMENTS.md).
 */
export function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

type Row = [title: string, tag: string, subtitle: string, summary: string, m1?: string, m2?: string];
type Sections = (title: string) => DemoItem["sections"];

function mk(rows: Row[], keys: [string, string], sections: Sections): DemoItem[] {
  return rows.map(([title, tag, subtitle, summary, m1, m2]) => ({
    slug: slugify(title),
    title,
    subtitle,
    summary,
    tags: [tag],
    meta: [[keys[0], m1 ?? "Sample"], [keys[1], m2 ?? "Sample"]],
    sections: sections(title),
  }));
}

const generic: Sections = (t) => [
  { title: "About (sample)", items: [`${t} is a sample entry used to demonstrate this layout.`, "Real content will come from the platform once the backend is connected."] },
];

export const academyCategories = [
  ["career-development", "Career Development"], ["research", "Research"], ["academic-writing", "Academic Writing"],
  ["scholarships", "Scholarships"], ["cv-and-linkedin", "CV and LinkedIn"], ["interview-preparation", "Interview Preparation"],
  ["communication", "Communication"], ["leadership", "Leadership"], ["entrepreneurship", "Entrepreneurship"],
  ["programming", "Programming"], ["data-science", "Data Science"], ["technical-skills", "Technical Skills"],
] as const;

export const opportunityCategories = [
  ["scholarship", "Scholarships"], ["internship", "Internships"], ["research", "Research Opportunities"],
  ["fellowship", "Fellowships"], ["exchange", "Exchange Programs"], ["summer-school", "Summer Schools"],
  ["conference", "Conferences"], ["competition", "Competitions"], ["grants", "Grants"],
  ["volunteering", "Volunteering"], ["jobs", "Jobs"], ["training", "Training Programs"],
  ["entrepreneurship", "Entrepreneurship Programs"], ["incubators", "Incubators"], ["accelerators", "Accelerators"],
  ["leadership", "Leadership Programs"], ["graduate-program", "Graduate Opportunities"],
] as const;

const courseSections: Sections = () => [
  { title: "What you will learn (sample)", items: ["Core concepts and vocabulary", "Guided practice with feedback", "A short portfolio piece"] },
  { title: "Syllabus (sample)", items: ["Module 1 · Foundations", "Module 2 · Practice", "Module 3 · Review and next steps"] },
];

const personSections: Sections = (t) => [
  { title: "Background (sample)", items: [`${t} is an invented profile for layout purposes.`, "No real credentials are claimed."] },
  { title: "Can help with (sample)", items: ["Application strategy", "Reviewing drafts", "Choosing next steps"] },
];

const storySections: Sections = () => [
  { title: "Background (sample)", items: ["Where the person started", "Why they chose this path"] },
  { title: "Preparation (sample)", items: ["Timeline and weekly routine", "Documents prepared", "Mistakes and what they would change"] },
  { title: "Advice (sample)", items: ["Start early", "Ask for feedback", "Keep a record of achievements"] },
];

const eventSections: Sections = () => [
  { title: "Agenda (sample)", items: ["Welcome and introductions", "Main session", "Q&A and networking"] },
  { title: "What to prepare (sample)", items: ["A question you want answered", "Your current CV if you want feedback"] },
];

const resourceSections: Sections = () => [
  { title: "What is inside (sample)", items: ["Step-by-step structure", "Worked example", "Common mistakes to avoid"] },
];

export const collections: Record<CollectionId, DemoItem[]> = {
  courses: mk([
    ["Career Planning Basics", "career-development", "Beginner", "Map your goals to concrete next steps.", "6 hours", "Self-paced"],
    ["Research Methods Foundations", "research", "Beginner", "Questions, methods and reading papers.", "8 hours", "Cohort"],
    ["Academic Writing Clinic", "academic-writing", "Intermediate", "Structure, clarity and citations.", "5 hours", "Self-paced"],
    ["Scholarship Application Strategy", "scholarships", "Beginner", "Plan, write and review a strong application.", "4 hours", "Self-paced"],
    ["CV and LinkedIn Workshop", "cv-and-linkedin", "Beginner", "Build a clear CV and profile.", "3 hours", "Live"],
    ["Interview Skills Lab", "interview-preparation", "Intermediate", "Practice common questions with feedback.", "4 hours", "Live"],
    ["Professional Communication", "communication", "Beginner", "Emails, meetings and presentations.", "5 hours", "Self-paced"],
    ["Leadership Fundamentals", "leadership", "Intermediate", "Lead teams and projects.", "6 hours", "Cohort"],
    ["Entrepreneurship Starter", "entrepreneurship", "Beginner", "Test ideas before you build.", "7 hours", "Cohort"],
    ["Python for Beginners", "programming", "Beginner", "Write your first programs.", "10 hours", "Self-paced"],
    ["Data Science Essentials", "data-science", "Intermediate", "Data cleaning, charts and basic models.", "12 hours", "Self-paced"],
    ["Technical Skills Toolkit", "technical-skills", "Beginner", "Spreadsheets, version control and documentation.", "6 hours", "Self-paced"],
  ], ["Duration", "Format"], courseSections),
  paths: mk([
    ["Scholarship Ready", "scholarships", "4 courses", "From research to submitted application.", "8 weeks", "Beginner"],
    ["Research Career Starter", "research", "5 courses", "Skills for your first research project.", "10 weeks", "Beginner"],
    ["Internship Ready", "career-development", "3 courses", "CV, interview and outreach.", "6 weeks", "Beginner"],
    ["Data Career Track", "data-science", "6 courses", "Foundations of data work.", "12 weeks", "Intermediate"],
    ["Founder Basics", "entrepreneurship", "4 courses", "From idea to first pilot.", "8 weeks", "Beginner"],
  ], ["Length", "Level"], courseSections),
  workshops: mk([
    ["Motivation Letter Workshop", "scholarships", "Live · 2 hours", "Draft and peer-review a letter.", "Sample date", "Online"],
    ["Poster and Slides Clinic", "communication", "Live · 90 min", "Present research clearly.", "Sample date", "Online"],
    ["LinkedIn Profile Review", "cv-and-linkedin", "Live · 60 min", "Get structured feedback.", "Sample date", "Online"],
    ["Mock Interview Night", "interview-preparation", "Live · 2 hours", "Practice in small groups.", "Sample date", "Online"],
    ["Intro to Literature Reviews", "research", "Live · 2 hours", "Find and organise sources.", "Sample date", "Online"],
  ], ["When", "Mode"], courseSections),
  bootcamps: mk([
    ["Application Bootcamp", "scholarships", "4 weeks", "Weekly deadlines, feedback and accountability.", "4 weeks", "Cohort"],
    ["Data Skills Bootcamp", "data-science", "6 weeks", "Project-based data practice.", "6 weeks", "Cohort"],
    ["Research Writing Bootcamp", "academic-writing", "4 weeks", "Write a short paper draft.", "4 weeks", "Cohort"],
  ], ["Length", "Format"], courseSections),
  cohorts: mk([
    ["Spring Cohort A", "scholarships", "Open (sample)", "Small group with a facilitator.", "Sample start", "20 seats"],
    ["Spring Cohort B", "research", "Open (sample)", "Weekly research reading group.", "Sample start", "15 seats"],
    ["Summer Cohort", "career-development", "Planned (sample)", "Career planning cohort.", "Sample start", "25 seats"],
    ["Data Cohort", "data-science", "Planned (sample)", "Applied data projects.", "Sample start", "20 seats"],
  ], ["Starts", "Seats"], courseSections),
  instructors: mk([
    ["Dr. Amal Fathy", "research", "Research methods", "Invented instructor profile.", "Sample", "Sample"],
    ["Karim Saad", "career-development", "Career coaching", "Invented instructor profile.", "Sample", "Sample"],
    ["Nour Ibrahim", "academic-writing", "Academic writing", "Invented instructor profile.", "Sample", "Sample"],
    ["Mariam Adel", "data-science", "Data science", "Invented instructor profile.", "Sample", "Sample"],
    ["Omar Hegazy", "programming", "Programming", "Invented instructor profile.", "Sample", "Sample"],
    ["Salma Yassin", "leadership", "Leadership", "Invented instructor profile.", "Sample", "Sample"],
  ], ["Courses", "Rating"], personSections),
  lessons: mk([
    ["Lesson 1 · Setting your goal", "career-development", "8 min video (sample)", "Sample lesson page layout.", "8 min", "Video"],
    ["Lesson 2 · Reading a call for applications", "scholarships", "12 min video (sample)", "Sample lesson page layout.", "12 min", "Video"],
    ["Lesson 3 · Drafting your first paragraph", "academic-writing", "10 min video (sample)", "Sample lesson page layout.", "10 min", "Video"],
  ], ["Length", "Type"], courseSections),
  communities: mk([
    ["AI and Machine Learning", "interest", "Interest community", "Share projects and ask questions.", "1.2k members (sample)", "Active"],
    ["Entrepreneurship Circle", "interest", "Interest community", "Ideas, pilots and feedback.", "640 members (sample)", "Active"],
    ["Design and Creativity", "interest", "Interest community", "Portfolios and critiques.", "410 members (sample)", "Active"],
    ["Study Abroad Planners", "goal", "Goal community", "Plan applications together.", "980 members (sample)", "Active"],
    ["Scholarship Preparation", "goal", "Goal community", "Accountability and feedback.", "1.5k members (sample)", "Active"],
    ["Research Career Track", "goal", "Goal community", "Path from undergraduate to research.", "720 members (sample)", "Active"],
    ["Quantum and Physics Research", "research", "Research community", "Papers, tools and questions.", "300 members (sample)", "Active"],
    ["Biology and Health Research", "research", "Research community", "Methods and reading groups.", "350 members (sample)", "Active"],
    ["Fellowship Seekers", "opportunity", "Opportunity community", "Share experiences and timelines.", "560 members (sample)", "Active"],
    ["Internship Hunters", "opportunity", "Opportunity community", "Leads, CV swaps and mock interviews.", "890 members (sample)", "Active"],
    ["Data Science Careers", "career", "Career community", "Roles, skills and portfolios.", "770 members (sample)", "Active"],
    ["Engineering Careers", "career", "Career community", "Paths and project ideas.", "830 members (sample)", "Active"],
  ], ["Members", "Status"], generic),
  members: mk([
    ["Hana Mostafa", "member", "Student · Data", "Invented member profile.", "Sample", "Sample"],
    ["Youssef Tarek", "member", "Student · Engineering", "Invented member profile.", "Sample", "Sample"],
    ["Rana Khaled", "moderator", "Moderator (sample)", "Invented member profile.", "Sample", "Sample"],
    ["Ahmed Samir", "member", "Graduate · Biology", "Invented member profile.", "Sample", "Sample"],
    ["Dina Farouk", "member", "Student · Design", "Invented member profile.", "Sample", "Sample"],
    ["Tamer Nabil", "member", "Student · Physics", "Invented member profile.", "Sample", "Sample"],
    ["Laila Gad", "moderator", "Moderator (sample)", "Invented member profile.", "Sample", "Sample"],
    ["Mostafa Zaki", "member", "Graduate · CS", "Invented member profile.", "Sample", "Sample"],
  ], ["Joined", "Posts"], personSections),
  posts: mk([
    ["How do you organise a long application?", "discussion", "Posted in Scholarship Preparation (sample)", "A sample discussion post.", "12 replies (sample)", "Sample"],
    ["Best way to read a paper quickly?", "question", "Posted in Research Career Track (sample)", "A sample question post.", "7 answers (sample)", "Sample"],
    ["Share your internship CV structure", "discussion", "Posted in Internship Hunters (sample)", "A sample discussion post.", "20 replies (sample)", "Sample"],
    ["What makes a good reference letter request?", "question", "Posted in Fellowship Seekers (sample)", "A sample question post.", "5 answers (sample)", "Sample"],
    ["Weekly check-in thread", "discussion", "Posted in Study Abroad Planners (sample)", "A sample discussion post.", "31 replies (sample)", "Sample"],
    ["Python or R for a first data project?", "question", "Posted in Data Science Careers (sample)", "A sample question post.", "9 answers (sample)", "Sample"],
    ["Resources for academic writing", "discussion", "Posted in AI and Machine Learning (sample)", "A sample discussion post.", "4 replies (sample)", "Sample"],
    ["How long should a personal statement be?", "question", "Posted in Scholarship Preparation (sample)", "A sample question post.", "11 answers (sample)", "Sample"],
  ], ["Activity", "Status"], generic),
  mentors: mk([
    ["Dr. Salma Reda", "scholarships", "Scholarship strategy", "Invented mentor profile.", "English, Arabic", "Weekdays (sample)"],
    ["Karim Fouad", "research", "Research careers", "Invented mentor profile.", "English, Arabic", "Weekends (sample)"],
    ["Nada Hassan", "data-science", "Data science", "Invented mentor profile.", "English", "Evenings (sample)"],
    ["Ali Mansour", "engineering", "Engineering paths", "Invented mentor profile.", "English, Arabic", "Weekdays (sample)"],
    ["Yara Sherif", "entrepreneurship", "Startups", "Invented mentor profile.", "English, French", "Weekends (sample)"],
    ["Hossam Lotfy", "career-development", "Career coaching", "Invented mentor profile.", "English, Arabic", "Evenings (sample)"],
    ["Mai Abdelrahman", "study-abroad", "Study abroad", "Invented mentor profile.", "English, Arabic", "Weekdays (sample)"],
    ["Walid Younes", "writing", "Application writing", "Invented mentor profile.", "English", "Weekends (sample)"],
    ["Fatma Ezzat", "research", "Lab research", "Invented mentor profile.", "English, Arabic", "Evenings (sample)"],
    ["Sherif Ashraf", "data-science", "Machine learning", "Invented mentor profile.", "English", "Weekdays (sample)"],
  ], ["Languages", "Availability"], personSections),
  stories: mk([
    ["Preparing a first scholarship application", "scholarship", "Sample story", "An invented story layout.", "Field: Engineering (sample)", "Timeline: 4 months (sample)"],
    ["Another scholarship, a second try", "scholarship", "Sample story", "An invented story layout.", "Field: Biology (sample)", "Timeline: 6 months (sample)"],
    ["Applying to a fellowship from scratch", "fellowship", "Sample story", "An invented story layout.", "Field: Policy (sample)", "Timeline: 5 months (sample)"],
    ["Finding a first research position", "research", "Sample story", "An invented story layout.", "Field: Physics (sample)", "Timeline: 3 months (sample)"],
    ["Landing a summer internship", "internship", "Sample story", "An invented story layout.", "Field: Data (sample)", "Timeline: 2 months (sample)"],
    ["An internship after two rejections", "internship", "Sample story", "An invented story layout.", "Field: Design (sample)", "Timeline: 5 months (sample)"],
    ["Preparing for an exchange semester", "exchange", "Sample story", "An invented story layout.", "Field: Business (sample)", "Timeline: 6 months (sample)"],
    ["A research assistant role during studies", "research", "Sample story", "An invented story layout.", "Field: Chemistry (sample)", "Timeline: 3 months (sample)"],
  ], ["Field", "Timeline"], storySections),
  teams: mk([
    ["Climate Data Research Team", "research", "Looking for 2 members", "Sample team profile.", "Roles: analyst, writer", "Size: 4 (sample)"],
    ["Hackathon Team Alpha", "competition", "Looking for 1 member", "Sample team profile.", "Roles: frontend", "Size: 4 (sample)"],
    ["Campus Marketplace Startup", "startup", "Looking for 3 members", "Sample team profile.", "Roles: design, sales, dev", "Size: 5 (sample)"],
    ["Open Source Study Tools", "project", "Looking for 2 members", "Sample team profile.", "Roles: dev, docs", "Size: 4 (sample)"],
    ["Health Survey Project", "research", "Looking for 1 member", "Sample team profile.", "Roles: statistics", "Size: 3 (sample)"],
    ["Robotics Competition Team", "competition", "Looking for 2 members", "Sample team profile.", "Roles: hardware, software", "Size: 6 (sample)"],
  ], ["Needs", "Size"], generic),
  events: mk([
    ["Scholarship Q&A Webinar", "webinar", "Online · sample date", "Questions answered by sample panelists.", "2026-12-04", "Online"],
    ["CV Clinic", "workshop", "Online · sample date", "Bring your CV for structured feedback.", "2026-12-09", "Online"],
    ["Research Careers Panel", "webinar", "Online · sample date", "Paths into research.", "2026-12-12", "Online"],
    ["Student Networking Evening", "networking", "In person · sample", "Meet students from other fields.", "2026-12-15", "Cairo (sample)"],
    ["Career Fair Preview", "career-fair", "In person · sample", "Preview of a career fair format.", "2026-12-18", "Cairo (sample)"],
    ["Opportunities Conference", "conference", "Hybrid · sample", "A one-day sample conference.", "2027-01-08", "Hybrid"],
    ["Interview Practice Workshop", "workshop", "Online · sample date", "Small-group mock interviews.", "2027-01-12", "Online"],
    ["Data Careers Webinar", "webinar", "Online · sample date", "Roles and skills in data.", "2027-01-15", "Online"],
    ["Alumni Networking Night", "networking", "Online · sample date", "Meet alumni (sample).", "2027-01-20", "Online"],
    ["Research Showcase", "conference", "In person · sample", "Student research posters.", "2027-01-27", "Cairo (sample)"],
  ], ["Date (sample)", "Location"], eventSections),
  resources: mk([
    ["Simple CV Template", "cv-template", "Template", "A one-page CV layout.", "DOCX (sample)", "1 page"],
    ["Academic CV Template", "cv-template", "Template", "A longer CV for research roles.", "DOCX (sample)", "2 pages"],
    ["Motivation Letter Template", "letter-template", "Template", "A structure for motivation letters.", "DOCX (sample)", "1 page"],
    ["Personal Statement Outline", "letter-template", "Template", "An outline for statements.", "DOCX (sample)", "1 page"],
    ["Starting Research Guide", "research-guide", "Guide", "From a question to a plan.", "PDF (sample)", "12 pages"],
    ["Literature Review Guide", "research-guide", "Guide", "Search, read and summarise.", "PDF (sample)", "10 pages"],
    ["Scholarship Search Guide", "scholarship-guide", "Guide", "Evaluate and shortlist programs.", "PDF (sample)", "9 pages"],
    ["Scholarship Timeline Guide", "scholarship-guide", "Guide", "Plan backwards from the deadline.", "PDF (sample)", "6 pages"],
    ["Interview Questions Guide", "interview-guide", "Guide", "Common questions and structure.", "PDF (sample)", "8 pages"],
    ["Behavioural Answers Guide", "interview-guide", "Guide", "Structure stories clearly.", "PDF (sample)", "6 pages"],
    ["Application Checklist", "checklist", "Checklist", "Documents and steps.", "PDF (sample)", "2 pages"],
    ["Scholarship Checklist", "checklist", "Checklist", "A scholarship-specific checklist.", "PDF (sample)", "2 pages"],
    ["Internship Checklist", "checklist", "Checklist", "An internship-specific checklist.", "PDF (sample)", "2 pages"],
    ["Reference Letter Request Template", "letter-template", "Template", "Ask a referee clearly.", "DOCX (sample)", "1 page"],
  ], ["Format", "Length"], resourceSections),
  network: mk([
    ["Alumni Member One", "alumni", "Alumni (sample)", "Invented network profile.", "Sample", "Sample"],
    ["Alumni Member Two", "alumni", "Alumni (sample)", "Invented network profile.", "Sample", "Sample"],
    ["Campus Ambassador One", "ambassador", "Ambassador (sample)", "Invented network profile.", "Sample", "Sample"],
    ["Campus Ambassador Two", "ambassador", "Ambassador (sample)", "Invented network profile.", "Sample", "Sample"],
    ["Contributor One", "contributor", "Contributor (sample)", "Invented network profile.", "Sample", "Sample"],
    ["Contributor Two", "contributor", "Contributor (sample)", "Invented network profile.", "Sample", "Sample"],
    ["Trainer One", "trainer", "Trainer (sample)", "Invented network profile.", "Sample", "Sample"],
    ["Trainer Two", "trainer", "Trainer (sample)", "Invented network profile.", "Sample", "Sample"],
    ["Community Leader One", "leader", "Community leader (sample)", "Invented network profile.", "Sample", "Sample"],
    ["Community Leader Two", "leader", "Community leader (sample)", "Invented network profile.", "Sample", "Sample"],
    ["Participant One", "participant", "Successful participant (sample)", "Invented network profile.", "Sample", "Sample"],
    ["Participant Two", "participant", "Successful participant (sample)", "Invented network profile.", "Sample", "Sample"],
  ], ["Field", "Location"], personSections),
  services: mk([
    ["Career Guidance Session", "career-guidance", "60 minutes", "One-to-one planning conversation.", "Sample price: not set", "Online"],
    ["Application Review", "application-support", "Written feedback", "Detailed review of a draft.", "Sample price: not set", "Online"],
    ["Scholarship Strategy Package", "application-support", "4 sessions", "Plan and review an application.", "Sample price: not set", "Online"],
    ["Talent Development Program", "talent-development", "6 weeks", "Skills plan with check-ins.", "Sample price: not set", "Hybrid"],
    ["Professional Development Workshop", "professional-development", "Half day", "Skills for the workplace.", "Sample price: not set", "In person"],
    ["Organizational Workshop", "organizational", "Custom", "Workshops for teams and institutions.", "Sample price: not set", "On request"],
    ["Training Program", "training", "Custom", "Structured training delivery.", "Sample price: not set", "On request"],
    ["Talent Matching", "talent-matching", "Custom", "Connect organizations with candidates.", "Sample price: not set", "On request"],
  ], ["Format", "Delivery"], generic),
};

export function getCollectionItem(collection: CollectionId, slug: string): DemoItem | undefined {
  return collections[collection].find((item) => item.slug === slug);
}
