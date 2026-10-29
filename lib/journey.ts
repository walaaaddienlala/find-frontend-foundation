import {
  ClipboardCheck,
  Compass,
  GraduationCap,
  ListChecks,
  Search,
  Target,
  type LucideIcon,
} from 'lucide-react'

export type JourneyStep = {
  title: string
  description: string
  icon: LucideIcon
  available: boolean
}

export const journeySteps: JourneyStep[] = [
  {
    title: 'Discover',
    description:
      'Browse internships, scholarships, fellowships, and graduate programs in one place.',
    icon: Search,
    available: true,
  },
  {
    title: 'Understand eligibility',
    description:
      'See who each opportunity is for and what it asks of applicants, in plain language.',
    icon: ListChecks,
    available: true,
  },
  {
    title: 'Assess readiness',
    description:
      'Compare your profile against requirements to see where you already stand.',
    icon: Target,
    available: false,
  },
  {
    title: 'Identify gaps',
    description:
      'Pinpoint the skills, documents, or experience still missing before you apply.',
    icon: Compass,
    available: false,
  },
  {
    title: 'Prepare',
    description:
      'Follow a personalized learning path focused on what matters for your goal.',
    icon: GraduationCap,
    available: false,
  },
  {
    title: 'Track applications',
    description:
      'Keep deadlines, statuses, and next steps organized as you apply.',
    icon: ClipboardCheck,
    available: false,
  },
]
