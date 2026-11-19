import { FeatureScaffoldPage, scaffoldMetadata } from '@/components/features/feature-scaffold'

// SCAFFOLD: see lib/features/registry.ts ("community") for status, TODOs and acceptance criteria.
export const metadata = scaffoldMetadata('community')

export default function Page() {
  return <FeatureScaffoldPage featureId="community" />
}
