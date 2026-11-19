import { FeatureScaffoldPage, scaffoldMetadata } from '@/components/features/feature-scaffold'

// SCAFFOLD: see lib/features/registry.ts ("academy") for status, TODOs and acceptance criteria.
export const metadata = scaffoldMetadata('academy')

export default function Page() {
  return <FeatureScaffoldPage featureId="academy" />
}
