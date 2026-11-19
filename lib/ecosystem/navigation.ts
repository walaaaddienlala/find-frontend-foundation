import type { NavSection } from "./types";

/**
 * The single navigation model: header menu, mobile menu, footer, /explore and the
 * tests all read this. A test asserts every href resolves to a real page.
 */
export const navSections: NavSection[] = [
  { title: "Discover", items: [
    { label: "Opportunities", href: "/opportunities" },
    { label: "Personalized Feed", href: "/feed" },
    { label: "Success Stories", href: "/success-stories" },
    { label: "Events", href: "/events" },
  ] },
  { title: "Understand", items: [
    { label: "My Profile", href: "/profile" },
    { label: "Opportunity Passport", href: "/passport/opportunities" },
    { label: "Skill Passport", href: "/passport/skills" },
    { label: "Find AI", href: "/ai" },
  ] },
  { title: "Prepare", items: [
    { label: "Preparation Center", href: "/prepare" },
    { label: "Find Academy", href: "/academy" },
    { label: "Learning Paths", href: "/academy/paths" },
    { label: "Resources", href: "/resources" },
  ] },
  { title: "Connect", items: [
    { label: "Community", href: "/community" },
    { label: "Find Mentors", href: "/mentors" },
    { label: "Someone Who Did It", href: "/someone-who-did-it" },
    { label: "Team Finder", href: "/teams" },
    { label: "Find Network", href: "/network" },
  ] },
  { title: "Grow", items: [
    { label: "My Roadmaps", href: "/roadmaps" },
    { label: "My Applications", href: "/applications" },
    { label: "My Progress", href: "/progress" },
    { label: "Career Development", href: "/career" },
  ] },
  { title: "For Organizations", items: [
    { label: "Organization Portal", href: "/organizations" },
    { label: "University Portal", href: "/universities" },
    { label: "Find Agency", href: "/agency" },
  ] },
];

/** Utility links shown beside the menu. */
export const utilityNav = [
  { label: "Explore everything", href: "/explore" },
  { label: "Find Chat", href: "/chat" },
  { label: "Experiences by role", href: "/roles" },
  { label: "Settings", href: "/settings" },
];
