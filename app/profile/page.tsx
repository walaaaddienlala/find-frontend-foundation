import { FeatureScaffoldPage, scaffoldMetadata } from '@/components/features/feature-scaffold'

// SCAFFOLD: see lib/features/registry.ts ("profile") for status, TODOs and acceptance criteria.
export const metadata = scaffoldMetadata('profile')

export default function Page() {
  return <FeatureScaffoldPage featureId="profile" />
}
