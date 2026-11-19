import { academyCategories } from "./demo";
import { F, FC, RI, coll, dash, detail, hub, page } from "./dsl";
import { sampleNote } from "./pages-core";
import type { PageDef } from "./types";

export const academyPages: PageDef[] = [
  hub("academy", "/academy", "Find Academy", "Courses, learning paths, workshops and bootcamps connected to your gaps and goals.", "academy", FC, undefined, [
    { kind: "notice", tone: "info", body: "Demo preview: every course, instructor and cohort is sample data. Enrollment, progress, quizzes and certificates are not connected." },
    { kind: "stats", items: [{ label: "Courses", value: "12", hint: "sample" }, { label: "Learning paths", value: "5", hint: "sample" }, { label: "Workshops", value: "5", hint: "sample" }, { label: "Instructors", value: "6", hint: "sample" }] },
    { kind: "collection", collection: "courses", limit: 3, title: "Featured courses (sample)" },
  ], { explicitRoute: true }),
  coll("academy-courses", "/academy/courses", "Course Catalog", "Search and filter sample courses.", "academy", FC, "courses", undefined, "academy"),
  detail("academy-course-detail", "/academy/courses/[slug]", "Course Details", "Syllabus, instructor, format and enrollment.", "academy", "courses", "academy-courses", "Enroll (not available)"),
  page("academy-categories", "/academy/categories", "Course Categories", "Browse by topic.", "academy", FC, [
    { kind: "cards", cols: 3, items: academyCategories.map(([slug, label]) => ({ title: label, body: "View sample courses", href: `/academy/courses?tag=${slug}` })) },
  ], { parent: "academy" }),
  coll("academy-paths", "/academy/paths", "Learning Paths", "Sequences of courses toward a goal.", "academy", FC, "paths", undefined, "academy"),
  detail("academy-path-detail", "/academy/paths/[slug]", "Learning Path", "Courses and milestones in this path.", "academy", "paths", "academy-paths", "Start this path (not available)"),
  coll("academy-workshops", "/academy/workshops", "Workshops", "Short live sessions.", "academy", FC, "workshops", undefined, "academy"),
  detail("academy-workshop-detail", "/academy/workshops/[slug]", "Workshop", "Agenda and registration.", "academy", "workshops", "academy-workshops", "Register (not available)"),
  coll("academy-bootcamps", "/academy/bootcamps", "Bootcamps", "Intensive, project-based programs.", "academy", FC, "bootcamps", undefined, "academy"),
  detail("academy-bootcamp-detail", "/academy/bootcamps/[slug]", "Bootcamp", "Format, schedule and outcomes.", "academy", "bootcamps", "academy-bootcamps", "Apply (not available)"),
  coll("academy-cohorts", "/academy/cohorts", "Cohorts and Learning Groups", "Learn with a group.", "academy", FC, "cohorts", undefined, "academy"),
  detail("academy-cohort-detail", "/academy/cohorts/[slug]", "Cohort", "Dates, facilitator and seats.", "academy", "cohorts", "academy-cohorts", "Join waitlist (not available)"),
  coll("academy-instructors", "/academy/instructors", "Instructors", "Sample instructor profiles.", "academy", FC, "instructors", undefined, "academy"),
  detail("academy-instructor-detail", "/academy/instructors/[slug]", "Instructor Profile", "Background and courses.", "academy", "instructors", "academy-instructors", "Follow (not available)"),
  page("academy-lesson", "/academy/lessons/[slug]", "Lesson", "Video lesson interface with notes and lesson list.", "academy", RI, [
    { kind: "video" },
    { kind: "item" },
    { kind: "form", title: "Notes", fields: [F.area("notes", "Your notes")], submit: "Save notes", note: "Not connected: notes are not saved." },
  ], { detailOf: "lessons", parent: "academy" }),
  coll("academy-lessons", "/academy/lessons", "Lessons", "All sample lessons.", "academy", RI, "lessons", undefined, "academy", [{ kind: "notice", tone: "warning", body: "Requires integration: video hosting is not connected." }]),
  dash("academy-dashboard", "/academy/dashboard", "Learning Dashboard", "Your learning at a glance.", "academy", FC, [
    sampleNote,
    { kind: "stats", items: [{ label: "In progress", value: "2", hint: "sample" }, { label: "Completed", value: "3", hint: "sample" }, { label: "Hours learned", value: "27", hint: "sample" }, { label: "Certificates", value: "1", hint: "sample" }] },
    { kind: "progress", title: "Course progress (sample)", items: [{ label: "Scholarship Application Strategy", value: 75 }, { label: "Python for Beginners", value: 30 }] },
    { kind: "children", title: "Learning tools" },
  ], "academy", { audience: "Learner" }),
  page("academy-my-courses", "/academy/my-courses", "My Courses", "Courses you enrolled in.", "academy", FC, [sampleNote, { kind: "collection", collection: "courses", limit: 2, title: "Sample enrolled courses" }], { parent: "academy-dashboard", audience: "Learner" }),
  page("academy-saved", "/academy/saved", "Saved Courses", "Courses you saved for later.", "academy", FC, [sampleNote, { kind: "collection", collection: "courses", limit: 3, title: "Sample saved courses" }], { parent: "academy-dashboard", audience: "Learner" }),
  page("academy-assignments", "/academy/assignments", "Assignments", "Work to submit and feedback received.", "academy", FC, [
    sampleNote,
    { kind: "table", columns: ["Assignment", "Course", "Due", "Status"], rows: [["Draft paragraph", "Academic Writing Clinic", "Sample date", "Not submitted"], ["Mock CV", "CV and LinkedIn Workshop", "Sample date", "Reviewed"]] },
    { kind: "form", title: "Submit work", fields: [F.text("title", "Title", true), F.file("file", "File"), F.area("note", "Note to the instructor")], submit: "Submit (not available)", note: "Not connected: nothing is submitted." },
  ], { parent: "academy-dashboard" }),
  page("academy-quizzes", "/academy/quizzes", "Quizzes", "Check what you learned.", "academy", FC, [
    { kind: "notice", tone: "info", body: "The sample quiz below runs in your browser to show the interface. Scores are not saved." },
    { kind: "quiz" },
  ], { parent: "academy-dashboard" }),
  page("academy-assessments", "/academy/assessments", "Assessments", "Skill assessments and results.", "academy", FC, [
    sampleNote,
    { kind: "table", columns: ["Assessment", "Result", "Date"], rows: [["Writing basics (sample)", "Passed", "Sample"], ["Data basics (sample)", "In progress", "Sample"]] },
  ], { parent: "academy-dashboard" }),
  page("academy-projects", "/academy/projects", "Projects", "Practical projects that build your portfolio.", "academy", FC, [
    sampleNote,
    { kind: "cards", cols: 3, items: [{ title: "Sample research summary", body: "A one-page summary (sample).", badge: "Sample" }, { title: "Sample data notebook", body: "Clean and chart a dataset (sample).", badge: "Sample" }, { title: "Sample CV portfolio", body: "Before and after (sample).", badge: "Sample" }] },
  ], { parent: "academy-dashboard" }),
  page("academy-certificates", "/academy/certificates", "Certificates", "Certificates you earned.", "academy", RI, [
    { kind: "notice", tone: "warning", body: "Requires backend: certificates are not issued yet. The card below is a sample layout." },
    { kind: "cards", items: [{ title: "Certificate of Completion (sample)", body: "Scholarship Application Strategy ┬╖ verification code: SAMPLE-0000", badge: "Sample" }] },
  ], { parent: "academy-dashboard" }),
  coll("academy-resources", "/academy/resources", "Learning Resources", "Guides and templates for learners.", "academy", FC, "resources", undefined, "academy-dashboard"),
];