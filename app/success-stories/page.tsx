import { FeatureScaffoldPage, scaffoldMetadata } from '@/components/features/feature-scaffold'

// SCAFFOLD: see lib/features/registry.ts ("success-stories") for status, TODOs and acceptance criteria.
export const metadata = scaffoldMetadata('success-stories')

export default function Page() {
  return <FeatureScaffoldPage featureId="success-stories" />
}
