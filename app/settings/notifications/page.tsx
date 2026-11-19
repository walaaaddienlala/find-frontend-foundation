import { FeatureScaffoldPage, scaffoldMetadata } from '@/components/features/feature-scaffold'

// SCAFFOLD: see lib/features/registry.ts ("notification-preferences") for status, TODOs and acceptance criteria.
export const metadata = scaffoldMetadata('notification-preferences')

export default function Page() {
  return <FeatureScaffoldPage featureId="notification-preferences" />
}
