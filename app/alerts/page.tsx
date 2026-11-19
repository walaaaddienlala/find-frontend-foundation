import { FeatureScaffoldPage, scaffoldMetadata } from '@/components/features/feature-scaffold'

// SCAFFOLD: see lib/features/registry.ts ("alert-rules") for status, TODOs and acceptance criteria.
export const metadata = scaffoldMetadata('alert-rules')

export default function Page() {
  return <FeatureScaffoldPage featureId="alert-rules" />
}
