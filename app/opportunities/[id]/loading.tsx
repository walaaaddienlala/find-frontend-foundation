import { Skeleton } from '@/components/ui/skeleton'
import { Container, Section } from '@/components/layout/page-container'

export default function OpportunityDetailLoading() {
  return (
    <Section className="pt-8 sm:pt-10 lg:pt-12">
      <Container className="flex flex-col gap-8">

        {/* Back button */}
        <Skeleton className="h-9 w-36" />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">

          {/* Main content */}
          <div className="flex flex-col gap-8">

            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-28" />
              </div>

              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-48" />

              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>

            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex flex-col gap-4">
                <Skeleton className="h-7 w-56" />

                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4">
            <div className="rounded-xl border border-border p-5">
              <Skeleton className="mb-6 h-7 w-32" />

              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="mb-5 flex flex-col gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-40" />
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-border p-5">
              <Skeleton className="mb-4 h-6 w-40" />
              <Skeleton className="h-10 w-full" />
            </div>
          </aside>

        </div>
      </Container>
    </Section>
  )
}