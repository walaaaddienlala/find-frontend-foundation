import { FeatureScaffoldPage, scaffoldMetadata } from '@/components/features/feature-scaffold'

// SCAFFOLD: see lib/features/registry.ts ("institutions") for status, TODOs and acceptance criteria.
export const metadata = scaffoldMetadata('institutions')

export default function Page() {
  return <FeatureScaffoldPage featureId="institutions" />
}
