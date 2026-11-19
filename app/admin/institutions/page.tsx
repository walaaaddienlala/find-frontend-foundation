import { FeatureScaffoldPage, scaffoldMetadata } from '@/components/features/feature-scaffold'

// SCAFFOLD: see lib/features/registry.ts ("admin-institutions") for status, TODOs and acceptance criteria.
export const metadata = scaffoldMetadata('admin-institutions')

export default function Page() {
  return <FeatureScaffoldPage featureId="admin-institutions" />
}
