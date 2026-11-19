import { FeatureScaffoldPage, scaffoldMetadata } from '@/components/features/feature-scaffold'

// SCAFFOLD: see lib/features/registry.ts ("notification-center") for status, TODOs and acceptance criteria.
export const metadata = scaffoldMetadata('notification-center')

export default function Page() {
  return <FeatureScaffoldPage featureId="notification-center" />
}
