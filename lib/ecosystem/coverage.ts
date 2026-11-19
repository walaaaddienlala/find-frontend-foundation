import { opportunityCategories } from "./demo";

/**
 * Maps every item named in the frontend implementation prompt to the route that
 * provides it (a page, or a section of a page). Tested: each route must resolve.
 * Where an item is a section of a larger page, the route is that page.
 */
export type Coverage = { module: string; item: string; route: string };

const c = (module: string, rows: [string, string][]): Coverage[] => rows.map(([item, route]) => ({ module, item, route }));

export const coverage: Coverage[] = [
  ...c("A. Find Platform", [
    ["Home", "/"], ["About Find", "/about"], ["How It Works", "/how-it-works"], ["Opportunities", "/opportunities"],
    ["Opportunity Categories", "/opportunities/categories"], ["Opportunity Details", "/opportunities/example-id"], ["Advanced Search", "/opportunities/search"],
    ["Saved Opportunities", "/saved"], ["Opportunity Comparison", "/compare"], ["Personalized Feed", "/feed"], ["User Dashboard", "/dashboard"],
    ["User Profile", "/profile"], ["Profile Editing", "/profile/edit"], ["Onboarding", "/onboarding"], ["Settings", "/settings"],
    ["Notifications Center", "/notifications"], ["Application Tracker", "/applications"], ["Application Details", "/applications"],
    ["Application History", "/applications/history"], ["Deadline Calendar", "/calendar"], ["Resources", "/resources"], ["Success Stories", "/success-stories"],
  ]),
  ...c("B. Opportunity Intelligence", [
    ...opportunityCategories.map(([slug, label]) => [label, `/opportunities/category/${slug}`] as [string, string]),
    ["Advanced filtering and search", "/opportunities/search"], ["Opportunity cards, funding and deadline indicators", "/opportunities"],
    ["Eligibility summaries", "/opportunities/example-id"], ["Verification badges (admin review demo)", "/admin/verification"],
    ["Related opportunities and preparation recommendations", "/opportunities/example-id"],
  ]),
  ...c("C. Profile and Passports", [
    ["Personal information", "/profile/edit"], ["Education and academic achievements", "/profile/education"], ["Skills, technical and soft", "/profile/skills"],
    ["Experience, research, volunteering, leadership", "/profile/experience"], ["Projects, publications, certifications", "/profile/projects"],
    ["Interests, career goals, countries, preferences", "/profile/preferences"], ["Uploaded documents and CV", "/profile/documents"],
    ["Profile completeness indicator", "/profile"], ["Skill Passport", "/passport/skills"], ["Opportunity Passport", "/passport/opportunities"],
  ]),
  ...c("D. Find AI", [
    ["AI Dashboard", "/ai"], ["AI Chat Interface", "/ai/chat"], ["Conversation History", "/ai/history"], ["Suggested Prompts", "/ai/prompts"],
    ["Opportunity Matching", "/ai/matching"], ["Eligibility Assessment", "/ai/eligibility"], ["Readiness Assessment and Readiness Score UI", "/ai/readiness"],
    ["Skills Gap Analysis and Gap Dashboard", "/ai/gap-analysis"], ["Personalized Roadmaps and Roadmap UI", "/ai/roadmaps"], ["CV Analysis", "/ai/cv-analysis"],
    ["CV Improvement", "/ai/cv-improvement"], ["Cover Letter Assistance", "/ai/cover-letter"], ["Motivation Letter Assistance", "/ai/motivation-letter"],
    ["Personal Statement Assistance", "/ai/personal-statement"], ["Essay Assistance", "/ai/essay"], ["Document Analysis and Document Review UI", "/ai/document-analysis"],
    ["Interview Preparation and Practice Interface", "/ai/interview-prep"], ["Research Assistance", "/ai/research-assistant"], ["Career Guidance", "/ai/career-guidance"],
    ["Learning Recommendations", "/ai/learning-recommendations"], ["Application Assistance", "/ai/application-assistant"], ["Deadline Assistance", "/ai/deadline-assistant"],
    ["Mentor Recommendations", "/ai/mentor-recommendations"], ["Career Navigation", "/ai/career-navigation"], ["Opportunity Comparison UI", "/ai/compare"],
  ]),
  ...c("E. Find Chatbot", [
    ["Floating chatbot button and expandable window (component, flag-enabled)", "/chat"], ["Full-page chat experience", "/chat"],
    ["Conversation history interface", "/chat/history"], ["Suggested questions", "/chat"], ["Opportunity cards inside conversations", "/chat"],
    ["Login-aware and guest interface", "/chat"], ["Human support handoff interface", "/chat/support"], ["Chat settings", "/chat/settings"],
    ["Feedback interface", "/chat/feedback"], ["WhatsApp and Telegram channel sections", "/chat/channels"],
  ]),
  ...c("F. Preparation Center", [
    ["Preparation Center", "/prepare"], ["Career Preparation", "/prepare/career"], ["CV Builder", "/prepare/career/cv-builder"], ["CV Review", "/prepare/career/cv-review"],
    ["LinkedIn Optimization", "/prepare/career/linkedin"], ["Personal Branding", "/prepare/career/personal-branding"], ["Networking", "/prepare/career/networking"],
    ["Professional Communication", "/prepare/career/communication"], ["Application Preparation", "/prepare/application"], ["Motivation Letters", "/prepare/application/motivation-letters"],
    ["Personal Statements", "/prepare/application/personal-statements"], ["Essays", "/prepare/application/essays"], ["Application Strategy", "/prepare/application/strategy"],
    ["Document Checklists", "/prepare/application/checklists"], ["Application Planning", "/prepare/application/planning"], ["Research Preparation", "/prepare/research"],
    ["Research Methodology", "/prepare/research/methodology"], ["Literature Reviews", "/prepare/research/literature-reviews"], ["Academic Writing", "/prepare/research/academic-writing"],
    ["Research Tools", "/prepare/research/tools"], ["Research Projects", "/prepare/research/projects"], ["Interview Preparation", "/prepare/interview"],
    ["Mock Interviews", "/prepare/interview/mock"], ["Interview Questions", "/prepare/interview/questions"], ["Opportunity-Specific Questions", "/prepare/interview/opportunity-questions"],
    ["Interview Feedback", "/prepare/interview/feedback"], ["Interview Progress", "/prepare/interview/progress"], ["Opportunity-Specific Preparation", "/prepare/opportunity"],
    ["Scholarship Preparation", "/prepare/opportunity/scholarships"], ["Fellowship Preparation", "/prepare/opportunity/fellowships"], ["Internship Preparation", "/prepare/opportunity/internships"],
    ["Exchange Preparation", "/prepare/opportunity/exchange"], ["Competition Preparation", "/prepare/opportunity/competitions"],
  ]),
  ...c("G. Find Academy", [
    ["Academy Homepage", "/academy"], ["Course Catalog", "/academy/courses"], ["Course Categories", "/academy/categories"], ["Course Details", "/academy/courses/scholarship-application-strategy"],
    ["Learning Paths", "/academy/paths"], ["Workshops", "/academy/workshops"], ["Bootcamps", "/academy/bootcamps"], ["Cohorts", "/academy/cohorts"], ["Lessons", "/academy/lessons"],
    ["Video Lesson Interface", "/academy/lessons/lesson-1-setting-your-goal"], ["Course Progress and Learning Dashboard", "/academy/dashboard"], ["Assignments", "/academy/assignments"],
    ["Quizzes", "/academy/quizzes"], ["Assessments", "/academy/assessments"], ["Projects", "/academy/projects"], ["Certificates", "/academy/certificates"],
    ["Instructor Profiles", "/academy/instructors/dr-amal-fathy"], ["Learning Resources", "/academy/resources"], ["My Courses", "/academy/my-courses"], ["Saved Courses", "/academy/saved"],
  ]),
  ...c("H. Find Community", [
    ["Community Homepage", "/community"], ["Community Feed", "/community/feed"], ["Interest-Based Communities", "/community/interest"], ["Goal-Based Communities", "/community/goals"],
    ["Research Communities", "/community/research"], ["Opportunity Communities", "/community/opportunities"], ["Career Communities", "/community/careers"],
    ["Community Details", "/community/scholarship-preparation"], ["Posts, Comments and Replies", "/community/posts/how-do-you-organise-a-long-application"],
    ["Discussions", "/community/discussions"], ["Questions and Answers", "/community/questions"], ["Community Resources", "/community/resources"],
    ["Member Profiles", "/community/members/hana-mostafa"], ["Community Events", "/community/events"], ["Community Guidelines", "/community/guidelines"],
    ["Reporting Interface", "/community/report"], ["Moderation Dashboard", "/community/moderation"],
  ]),
  ...c("I. Find Mentors", [
    ["Mentor Homepage", "/mentors"], ["Mentor Directory, Search, Filters and Expertise", "/mentors/directory"], ["Mentor Profiles", "/mentors/dr-salma-reda"],
    ["Mentor Matching", "/mentors/matching"], ["Mentorship Requests", "/mentors/requests"], ["Booking Interface", "/mentors/book"], ["Available Sessions", "/mentors/sessions"],
    ["Mentorship Dashboard", "/mentors/dashboard"], ["Session History", "/mentors/history"], ["Feedback and Reviews", "/mentors/reviews"], ["Mentor Application Page", "/mentors/apply"],
  ]),
  ...c("J. Someone Who Did It", [
    ["Success Stories Directory", "/success-stories"], ["Individual Success Story Pages", "/success-stories/preparing-a-first-scholarship-application"],
    ["Scholarship Experiences", "/success-stories/scholarships"], ["Fellowship Experiences", "/success-stories/fellowships"], ["Research Experiences", "/success-stories/research"],
    ["Internship Experiences", "/success-stories/internships"], ["Exchange Experiences", "/success-stories/exchange"], ["Application Advice and Lessons Learned", "/someone-who-did-it/advice"],
    ["Ask Someone Who Did It", "/someone-who-did-it/ask"], ["Contributor Profiles", "/someone-who-did-it/contributors"], ["Someone Who Did It home", "/someone-who-did-it"],
  ]),
  ...c("K. Team Finder", [
    ["Team Finder Homepage", "/teams"], ["Discover Teammates", "/teams/discover"], ["Create a Team", "/teams/create"], ["Find Collaborators", "/teams/collaborators"],
    ["Research Teammates", "/teams/research"], ["Competition Teams", "/teams/competitions"], ["Startup Teams", "/teams/startups"], ["Project Teams", "/teams/projects"],
    ["User Skills and Interests", "/teams/skills"], ["Team Requests", "/teams/requests"], ["Team Profiles and Collaboration Details", "/teams/climate-data-research-team"],
  ]),
  ...c("L. Find Events", [
    ["Events Homepage", "/events"], ["Events Calendar", "/events/calendar"], ["Upcoming Events", "/events/upcoming"], ["Workshops", "/events/workshops"], ["Webinars", "/events/webinars"],
    ["Conferences", "/events/conferences"], ["Networking Events", "/events/networking"], ["Career Fairs", "/events/career-fairs"], ["Event Details", "/events/cv-clinic"],
    ["Registration Interface", "/events/register"], ["Attendance Interface", "/events/attendance"], ["Event Resources", "/events/resources"], ["Recordings", "/events/recordings"],
  ]),
  ...c("M. Resource Library", [
    ["Resource Library and Searchable Guides", "/resources"], ["CV Templates", "/resources/cv-templates"], ["Motivation Letter Templates", "/resources/motivation-letter-templates"],
    ["Research Guides", "/resources/research-guides"], ["Scholarship Guides", "/resources/scholarship-guides"], ["Interview Guides", "/resources/interview-guides"],
    ["Application Checklists", "/resources/application-checklists"], ["Download Interfaces", "/resources/downloads"], ["Saved Resources", "/resources/saved"], ["Resource Details", "/resources/simple-cv-template"],
  ]),
  ...c("N. Find Network", [
    ["Network home", "/network"], ["Alumni Directory", "/network/alumni"], ["Ambassadors", "/network/ambassadors"], ["Contributors", "/network/contributors"], ["Trainers", "/network/trainers"],
    ["Community Leaders", "/network/community-leaders"], ["Successful Participants", "/network/participants"], ["Network Profiles", "/network/alumni-member-one"],
    ["Networking Opportunities", "/network/opportunities"], ["Member Discovery", "/network/members"],
  ]),
  ...c("O. Find Agency", [
    ["Agency Homepage", "/agency"], ["Career Guidance Services", "/agency/career-guidance"], ["Application Support Services", "/agency/application-support"], ["Talent Development", "/agency/talent-development"],
    ["Professional Development", "/agency/professional-development"], ["Organizational Services", "/agency/organizational"], ["Training Services", "/agency/training"], ["Talent Matching", "/agency/talent-matching"],
    ["Service Details", "/agency/services/career-guidance-session"], ["Request a Service", "/agency/request"], ["Consultation Booking", "/agency/book"], ["Client Dashboard", "/agency/dashboard"],
  ]),
  ...c("P. Organization Portal", [
    ["Organization Registration", "/organizations/register"], ["Organization Profile", "/organizations/profile"], ["Organization Verification", "/organizations/verification"],
    ["Organization Dashboard", "/organizations/dashboard"], ["Publish Opportunity", "/organizations/opportunities/new"], ["Manage Opportunities", "/organizations/opportunities"],
    ["Edit Opportunities", "/organizations/opportunities/edit"], ["Applicant Management", "/organizations/applicants"], ["Application Overview", "/organizations/applications"],
    ["Talent Discovery", "/organizations/talent"], ["Analytics", "/organizations/analytics"], ["Organization Events", "/organizations/events"], ["Organization Resources", "/organizations/resources"],
    ["Team Management", "/organizations/team"], ["Organization Settings", "/organizations/settings"], ["Portal landing", "/organizations"],
  ]),
  ...c("Q. University Portal", [
    ["University Dashboard", "/universities/dashboard"], ["University Profile", "/universities/profile"], ["Student Opportunities", "/universities/opportunities"], ["University Announcements", "/universities/announcements"],
    ["Publish Opportunities", "/universities/publish"], ["Student Talent Discovery", "/universities/talent"], ["Student Engagement", "/universities/engagement"], ["Events", "/universities/events"],
    ["Workshops", "/universities/workshops"], ["Institutional Analytics", "/universities/analytics"], ["Department Management", "/universities/departments"], ["University Verification", "/universities/verification"],
    ["Portal landing", "/universities"],
  ]),
  ...c("R. Admin Dashboard", [
    ["Admin Overview", "/admin"], ["User Management", "/admin/users"], ["Opportunity Management", "/admin/opportunities"], ["Opportunity Verification", "/admin/verification"],
    ["Application Management", "/admin/applications"], ["Organization Management", "/admin/organizations"], ["University Management", "/admin/universities"], ["Academy Management", "/admin/academy"],
    ["Course Management", "/admin/courses"], ["Community Moderation", "/admin/moderation"], ["Mentor Management", "/admin/mentors"], ["Events Management", "/admin/events"],
    ["Resource Management", "/admin/resources"], ["Success Stories Management", "/admin/stories"], ["AI Configuration Interface", "/admin/ai"], ["Chatbot Configuration", "/admin/chatbot"],
    ["Notification Management", "/admin/notifications"], ["Support Management", "/admin/support"], ["Analytics", "/admin/analytics"], ["Reports", "/admin/reports"], ["Audit Logs", "/admin/audit"],
    ["Roles and Permissions", "/admin/roles"], ["Platform Settings", "/admin/settings"],
  ]),
  ...c("S. Roles", [
    ["Public visitors, registered users, students", "/roles/student"], ["Mentors", "/roles/mentor"], ["Academy instructors", "/roles/instructor"], ["Community moderators", "/roles/moderator"],
    ["Organizations", "/organizations"], ["Universities", "/universities"], ["Administrators", "/admin"], ["Roles hub", "/roles"],
  ]),
  ...c("T. Grow", [["My Roadmaps", "/roadmaps"], ["My Progress", "/progress"], ["Career Development", "/career"], ["Explore everything", "/explore"], ["Alerts", "/alerts"], ["Document vault", "/documents"], ["Notification preferences", "/settings/notifications"]]),
];
