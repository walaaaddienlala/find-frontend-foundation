import { FeatureScaffoldPage, scaffoldMetadata } from '@/components/features/feature-scaffold'

// SCAFFOLD: see lib/features/registry.ts ("mentors") for status, TODOs and acceptance criteria.
export const metadata = scaffoldMetadata('mentors')

export default function Page() {
  return <FeatureScaffoldPage featureId="mentors" />
}
