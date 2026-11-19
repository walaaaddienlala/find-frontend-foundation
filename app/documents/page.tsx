import { FeatureScaffoldPage, scaffoldMetadata } from '@/components/features/feature-scaffold'

// SCAFFOLD: see lib/features/registry.ts ("documents") for status, TODOs and acceptance criteria.
export const metadata = scaffoldMetadata('documents')

export default function Page() {
  return <FeatureScaffoldPage featureId="documents" />
}
