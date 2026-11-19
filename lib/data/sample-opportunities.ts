import type { Opportunity } from '@/lib/types'

// Fictional placeholder listings for UI development only.
// Organizations, dates, and details do not refer to real programs.
export const sampleOpportunities: Opportunity[] = [
  {
    id: 'sample-product-design-internship',
    title: 'Product Design Internship',
    organization: 'Sample Studio',
    type: 'internship',
    country: 'Example Country',
    location: 'Example City',
    workMode: 'hybrid',
    fundingType: 'partially_funded',
    deadline: '2027-01-15',
    programStartDate: '2027-06-01',
    programEndDate: '2027-08-24',
    createdAt: '2026-10-01T09:00:00.000Z',
    publishedAt: '2026-10-02T09:00:00.000Z',
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
    academicRequirements: [
      'Currently enrolled in an undergraduate or postgraduate program',
      'Background in design, HCI, computer science, or a related field',
    ],
    skillsRequirements: [
      'User research',
      'Wireframing and prototyping',
      'Figma or equivalent design tools',
      'Communication and teamwork',
    ],
    requiredDocuments: [
      'CV or résumé',
      'Portfolio with 2–3 case studies',
      'Statement of interest',
    ],
    tags: ['Design', 'Research', 'Prototyping'],
    applicationUrl: 'https://example.com/product-design/apply',
    officialSourceUrl: 'https://example.com/product-design',
    contactInformation: 'design@example.com',
  },

  {
    id: 'sample-stem-scholarship',
    title: 'Women in STEM Scholarship',
    organization: 'Example Education Fund',
    type: 'scholarship',
    country: 'Any Country',
    location: 'Any location',
    workMode: 'remote',
    fundingType: 'fully_funded',
    deadline: '2027-02-28',
    programStartDate: '2027-09-01',
    programEndDate: '2028-06-30',
    createdAt: '2026-10-03T09:00:00.000Z',
    publishedAt: '2026-10-04T09:00:00.000Z',
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
    academicRequirements: [
      'Currently enrolled in an undergraduate STEM degree',
      'Academic performance meeting the provider’s minimum requirements',
    ],
    skillsRequirements: [
      'Interest in science and technology',
      'Critical thinking',
      'Communication skills',
    ],
    requiredDocuments: [
      'Academic transcript',
      'Personal essay',
      'One letter of recommendation',
      'Proof of university enrollment',
    ],
    tags: ['STEM', 'Funding', 'Undergraduate'],
    applicationUrl: 'https://example.com/stem-scholarship/apply',
    officialSourceUrl: 'https://example.com/stem-scholarship',
    contactInformation: 'scholarships@example.com',
  },

  {
    id: 'sample-policy-fellowship',
    title: 'Public Policy Fellowship',
    organization: 'Sample Policy Institute',
    type: 'fellowship',
    country: 'Example Country',
    location: 'Example Capital',
    workMode: 'on-site',
    fundingType: 'fully_funded',
    deadline: '2027-03-10',
    programStartDate: '2027-06-01',
    programEndDate: '2028-05-31',
    createdAt: '2026-10-05T09:00:00.000Z',
    publishedAt: '2026-10-06T09:00:00.000Z',
    summary:
      'A one-year paid fellowship for graduates interested in research, writing, and public policy analysis.',
    description:
      'Fellows support research projects, draft briefs, and attend policy roundtables. The program includes mentorship and a professional development stipend.',
    eligibility: [
      'Bachelor’s degree completed by the program start date',
      'Interest in economics, social policy, or governance',
    ],
    requirements: [
      'Résumé',
      'Writing sample',
      'Two references',
    ],
    academicRequirements: [
      'Bachelor’s degree in any relevant discipline',
      'Background in economics, political science, public policy, or social sciences is preferred',
    ],
    skillsRequirements: [
      'Research and analytical writing',
      'Critical thinking',
      'Data interpretation',
      'Presentation skills',
    ],
    requiredDocuments: [
      'CV or résumé',
      'Writing sample',
      'Two professional or academic references',
      'Academic transcript',
    ],
    tags: ['Policy', 'Research', 'Writing'],
    applicationUrl: 'https://example.com/policy-fellowship/apply',
    officialSourceUrl: 'https://example.com/policy-fellowship',
    contactInformation: 'fellowships@example.com',
  },

  {
    id: 'sample-data-graduate-program',
    title: 'Data Analytics Graduate Program',
    organization: 'Example Analytics Co.',
    type: 'graduate-program',
    country: 'Example Country',
    location: 'Example City',
    workMode: 'hybrid',
    fundingType: 'fully_funded',
    deadline: '2027-01-31',
    programStartDate: '2027-07-01',
    programEndDate: '2029-06-30',
    createdAt: '2026-10-07T09:00:00.000Z',
    publishedAt: '2026-10-08T09:00:00.000Z',
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
    academicRequirements: [
      'Bachelor’s degree in statistics, mathematics, computer science, business, or a related quantitative field',
      'Graduated within the last 24 months',
    ],
    skillsRequirements: [
      'Basic SQL',
      'Data analysis',
      'Spreadsheet proficiency',
      'Problem-solving',
    ],
    requiredDocuments: [
      'CV or résumé',
      'Academic transcript',
      'Online assessment results',
    ],
    tags: ['Data', 'SQL', 'Analytics'],
    applicationUrl: 'https://example.com/data-graduate/apply',
    officialSourceUrl: 'https://example.com/data-graduate',
    contactInformation: 'graduates@example.com',
  },

  {
    id: 'sample-social-impact-challenge',
    title: 'Social Impact Innovation Challenge',
    organization: 'Sample Foundation',
    type: 'competition',
    country: 'Any Country',
    location: 'Any location',
    workMode: 'remote',
    fundingType: 'no_fee',
    deadline: '2027-04-05',
    programStartDate: '2027-04-20',
    programEndDate: '2027-07-20',
    createdAt: '2026-10-09T09:00:00.000Z',
    publishedAt: '2026-10-10T09:00:00.000Z',
    summary:
      'Teams of students pitch ideas that address a community challenge, with mentorship for shortlisted teams.',
    description:
      'Participants submit a short proposal, and shortlisted teams develop their ideas with mentor support before a final presentation.',
    eligibility: [
      'Teams of 2–4 students or recent graduates',
      'At least one team member currently enrolled',
    ],
    requirements: [
      'Two-page proposal',
      'Team member details',
    ],
    academicRequirements: [
      'At least one team member must be currently enrolled in an educational institution',
      'Other team members may be students or recent graduates',
    ],
    skillsRequirements: [
      'Creative problem-solving',
      'Teamwork',
      'Project development',
      'Presentation and pitching',
    ],
    requiredDocuments: [
      'Two-page project proposal',
      'Team member details',
      'Short project summary',
    ],
    tags: ['Entrepreneurship', 'Teamwork', 'Pitching'],
    applicationUrl: 'https://example.com/innovation-challenge/apply',
    officialSourceUrl: 'https://example.com/innovation-challenge',
    contactInformation: 'challenge@example.com',
  },

  {
    id: 'sample-software-internship',
    title: 'Software Engineering Internship',
    organization: 'Example Tech Labs',
    type: 'internship',
    country: 'Any Country',
    location: 'Any location',
    workMode: 'remote',
    fundingType: 'partially_funded',
    deadline: '2027-02-14',
    programStartDate: '2027-06-01',
    programEndDate: '2027-08-21',
    createdAt: '2026-10-11T09:00:00.000Z',
    publishedAt: '2026-10-12T09:00:00.000Z',
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
    academicRequirements: [
      'Currently enrolled in computer science, software engineering, or a related degree',
      'Undergraduate students are eligible',
    ],
    skillsRequirements: [
      'Programming fundamentals',
      'JavaScript or TypeScript',
      'Git and version control',
      'Problem-solving',
    ],
    requiredDocuments: [
      'CV or résumé',
      'Link to a code sample or portfolio',
      'Academic transcript',
    ],
    tags: ['Engineering', 'JavaScript', 'Mentorship'],
    applicationUrl: 'https://example.com/software-internship/apply',
    officialSourceUrl: 'https://example.com/software-internship',
    contactInformation: 'careers@example.com',
  },
]