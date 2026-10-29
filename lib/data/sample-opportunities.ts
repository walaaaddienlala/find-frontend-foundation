import type { Opportunity } from '@/lib/types'

// Fictional placeholder listings for UI development only.
// Organizations, dates, and details do not refer to real programs.
export const sampleOpportunities: Opportunity[] = [
  {
    id: 'sample-product-design-internship',
    title: 'Product Design Internship',
    organization: 'Sample Studio',
    type: 'internship',
    location: 'Example City',
    workMode: 'hybrid',
    deadline: '2027-01-15',
    summary:
      'A 12-week internship working alongside a product team on research, prototyping, and interface design.',
    description:
      'Interns join a cross-functional team and contribute to real product work. You will run small research sessions, turn findings into flows and prototypes, and present your work at the end of the program.',
    eligibility: [
      'Currently enrolled in a degree program or graduated within the last 12 months',
      'Studying design, HCI, computer science, or a related field',
    ],
    requirements: [
      'Portfolio with 2–3 case studies',
      'Short statement of interest (300 words)',
      'Familiarity with a design tool such as Figma',
    ],
    tags: ['Design', 'Research', 'Prototyping'],
  },
  {
    id: 'sample-stem-scholarship',
    title: 'Women in STEM Scholarship',
    organization: 'Example Education Fund',
    type: 'scholarship',
    location: 'Any location',
    workMode: 'remote',
    deadline: '2027-02-28',
    summary:
      'Tuition support for undergraduate women pursuing degrees in science, technology, engineering, or mathematics.',
    description:
      'This placeholder scholarship illustrates how funding opportunities will appear in Find, including eligibility criteria, required documents, and deadlines.',
    eligibility: [
      'Undergraduate student in a STEM program',
      'Minimum academic standing as defined by the provider',
    ],
    requirements: [
      'Academic transcript',
      'Personal essay (500 words)',
      'One letter of recommendation',
    ],
    tags: ['STEM', 'Funding', 'Undergraduate'],
  },
  {
    id: 'sample-policy-fellowship',
    title: 'Public Policy Fellowship',
    organization: 'Sample Policy Institute',
    type: 'fellowship',
    location: 'Example Capital',
    workMode: 'on-site',
    deadline: '2027-03-10',
    summary:
      'A one-year paid fellowship for graduates interested in research, writing, and public policy analysis.',
    description:
      'Fellows support research projects, draft briefs, and attend policy roundtables. The program includes mentorship and a professional development stipend.',
    eligibility: [
      'Bachelor’s degree completed by the program start date',
      'Interest in economics, social policy, or governance',
    ],
    requirements: ['Résumé', 'Writing sample', 'Two references'],
    tags: ['Policy', 'Research', 'Writing'],
  },
  {
    id: 'sample-data-graduate-program',
    title: 'Data Analytics Graduate Program',
    organization: 'Example Analytics Co.',
    type: 'graduate-program',
    location: 'Example City',
    workMode: 'hybrid',
    deadline: '2027-01-31',
    summary:
      'A two-year rotational program for recent graduates building careers in data analysis and business intelligence.',
    description:
      'Graduates rotate across three teams, building dashboards, cleaning datasets, and presenting insights to stakeholders, with structured training throughout.',
    eligibility: [
      'Graduated within the last 24 months',
      'Coursework in statistics, mathematics, or a quantitative field',
    ],
    requirements: [
      'Résumé',
      'Online assessment',
      'Basic SQL or spreadsheet skills',
    ],
    tags: ['Data', 'SQL', 'Analytics'],
  },
  {
    id: 'sample-social-impact-challenge',
    title: 'Social Impact Innovation Challenge',
    organization: 'Sample Foundation',
    type: 'competition',
    location: 'Any location',
    workMode: 'remote',
    deadline: '2027-04-05',
    summary:
      'Teams of students pitch ideas that address a community challenge, with mentorship for shortlisted teams.',
    description:
      'Participants submit a short proposal, and shortlisted teams develop their ideas with mentor support before a final presentation.',
    eligibility: [
      'Teams of 2–4 students or recent graduates',
      'At least one team member currently enrolled',
    ],
    requirements: ['Two-page proposal', 'Team member details'],
    tags: ['Entrepreneurship', 'Teamwork', 'Pitching'],
  },
  {
    id: 'sample-software-internship',
    title: 'Software Engineering Internship',
    organization: 'Example Tech Labs',
    type: 'internship',
    location: 'Any location',
    workMode: 'remote',
    deadline: '2027-02-14',
    summary:
      'A remote summer internship building and shipping features with a small engineering team.',
    description:
      'Interns pair with a mentor, take a feature from design to production, and learn code review, testing, and deployment practices.',
    eligibility: [
      'Currently enrolled in a computer science or related degree',
      'Available for 10–12 weeks over the summer',
    ],
    requirements: [
      'Résumé',
      'Link to a code sample or project',
      'Technical interview',
    ],
    tags: ['Engineering', 'JavaScript', 'Mentorship'],
  },
]
