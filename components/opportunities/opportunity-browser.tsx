'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  SearchX,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { EmptyState } from '@/components/shared/states'
import { OpportunityCard } from '@/components/opportunities/opportunity-card'
import { opportunityTypeLabel } from '@/lib/status'

import {
  opportunityTypes,
  type Opportunity,
  type OpportunityType,
  type FundingType,
  type DeadlineStatus,
} from '@/lib/types'

type TypeFilter = OpportunityType | 'all'
type WorkModeFilter = Opportunity['workMode'] | 'all'
type FundingFilter = FundingType | 'all'

type SortOption = 'deadline' | 'newest' | 'title'

type Filters = {
  query: string
  type: TypeFilter
  country: string
  location: string
  workMode: WorkModeFilter
  funding: FundingFilter
  deadlineStatus: DeadlineStatus | 'all'
  sort: SortOption
}

const PAGE_SIZE = 9

const initialFilters: Filters = {
  query: '',
  type: 'all',
  country: 'all',
  location: 'all',
  workMode: 'all',
  funding: 'all',
  deadlineStatus: 'all',
  sort: 'deadline',
}

function getSearchableText(opportunity: Opportunity) {
  return [
    opportunity.title,
    opportunity.organization,
    opportunity.country,
    opportunity.location,
    opportunity.summary,
    opportunity.description,
    opportunity.fundingType,
    ...opportunity.tags,
    ...opportunity.requirements,
    ...opportunity.eligibility,
  ]
    .join(' ')
    .toLowerCase()
}

function getDeadlineTimestamp(deadline: string) {
  if (!deadline) return Number.POSITIVE_INFINITY

  const timestamp = new Date(`${deadline}T00:00:00Z`).getTime()

  return Number.isNaN(timestamp)
    ? Number.POSITIVE_INFINITY
    : timestamp
}

function getDeadlineStatus(deadline: string): DeadlineStatus {
  if (!deadline) return 'open'

  const deadlineTimestamp = getDeadlineTimestamp(deadline)

  if (!Number.isFinite(deadlineTimestamp)) return 'open'

  const now = new Date()

  const today = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )

  const remainingDays = Math.floor(
    (deadlineTimestamp - today) / (1000 * 60 * 60 * 24),
  )

  if (remainingDays < 0) return 'closed'

  if (remainingDays <= 7) return 'closing-soon'

  return 'open'
}

function getFundingLabel(funding: FundingType) {
  switch (funding) {
    case 'fully_funded':
      return 'Fully Funded'
    case 'partially_funded':
      return 'Partially Funded'
    case 'unfunded':
      return 'Unfunded'
    case 'no_fee':
      return 'No Fee'
    default:
      return 'Not Specified'
  }
}

function getLocationDisplay(opportunity: Opportunity) {
  const parts = [
    opportunity.location,
    opportunity.country,
  ].filter(
    (value) => value && value !== 'Not specified',
  )

  return parts.length > 0
    ? parts.join(', ')
    : 'Location not specified'
}

export function OpportunityBrowser({
  opportunities,
}: {
  opportunities: Opportunity[]
}) {
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)

  // Available countries
  const countries = useMemo(() => {
    return Array.from(
      new Set(
        opportunities
          .map((opportunity) => opportunity.country)
          .filter(
            (country) =>
              country && country !== 'Not specified',
          ),
      ),
    ).sort((a, b) => a.localeCompare(b))
  }, [opportunities])

  // Available locations
  const locations = useMemo(() => {
    const filteredByCountry =
      filters.country === 'all'
        ? opportunities
        : opportunities.filter(
            (opportunity) =>
              opportunity.country === filters.country,
          )

    return Array.from(
      new Set(
        filteredByCountry
          .map((opportunity) => opportunity.location)
          .filter(
            (location) =>
              location && location !== 'Not specified',
          ),
      ),
    ).sort((a, b) => a.localeCompare(b))
  }, [opportunities, filters.country])

  // Filter and sort opportunities
  const results = useMemo(() => {
    const normalizedQuery = filters.query.trim().toLowerCase()

    const filtered = opportunities.filter((opportunity) => {
      const matchesQuery =
        !normalizedQuery ||
        getSearchableText(opportunity).includes(normalizedQuery)

      const matchesType =
        filters.type === 'all' ||
        opportunity.type === filters.type

      const matchesCountry =
        filters.country === 'all' ||
        opportunity.country === filters.country

      const matchesLocation =
        filters.location === 'all' ||
        opportunity.location === filters.location

      const matchesWorkMode =
        filters.workMode === 'all' ||
        opportunity.workMode === filters.workMode

      const matchesFunding =
        filters.funding === 'all' ||
        opportunity.fundingType === filters.funding

      const deadlineStatus = getDeadlineStatus(
        opportunity.deadline,
      )

      const matchesDeadlineStatus =
        filters.deadlineStatus === 'all' ||
        deadlineStatus === filters.deadlineStatus

      return (
        matchesQuery &&
        matchesType &&
        matchesCountry &&
        matchesLocation &&
        matchesWorkMode &&
        matchesFunding &&
        matchesDeadlineStatus
      )
    })

    return filtered.sort((a, b) => {
      switch (filters.sort) {
        case 'title':
          return a.title.localeCompare(b.title)

        case 'newest':
          return (
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
          )

        case 'deadline':
        default:
          return (
            getDeadlineTimestamp(a.deadline) -
            getDeadlineTimestamp(b.deadline)
          )
      }
    })
  }, [opportunities, filters])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const totalPages = Math.max(
    1,
    Math.ceil(results.length / PAGE_SIZE),
  )

  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE

    return results.slice(
      startIndex,
      startIndex + PAGE_SIZE,
    )
  }, [results, currentPage])

  const hasFilters =
    filters.query.trim() !== '' ||
    filters.type !== 'all' ||
    filters.country !== 'all' ||
    filters.location !== 'all' ||
    filters.workMode !== 'all' ||
    filters.funding !== 'all' ||
    filters.deadlineStatus !== 'all'

  const updateFilter = <K extends keyof Filters>(
    key: K,
    value: Filters[K],
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value,

      // Changing the country resets the location filter
      ...(key === 'country' ? { location: 'all' } : {}),
    }))
  }

  const resetFilters = () => {
    setFilters(initialFilters)
    setCurrentPage(1)
  }

  const firstResult =
    results.length === 0
      ? 0
      : (currentPage - 1) * PAGE_SIZE + 1

  const lastResult = Math.min(
    currentPage * PAGE_SIZE,
    results.length,
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Search and filters */}
      <section
        aria-label="Search and filter opportunities"
        className="rounded-2xl border border-border bg-card p-4 sm:p-6"
      >
        <div className="mb-5 flex items-center gap-2">
          <SlidersHorizontal
            className="size-5 text-primary"
            aria-hidden="true"
          />

          <h2 className="font-semibold">
            Find your opportunity
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Search */}
          <div className="sm:col-span-2 lg:col-span-3">
            <Field>
              <FieldLabel htmlFor="opportunity-search">
                Search opportunities
              </FieldLabel>

              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />

                <Input
                  id="opportunity-search"
                  type="search"
                  value={filters.query}
                  onChange={(event) =>
                    updateFilter('query', event.target.value)
                  }
                  placeholder="Search by title, organization, skill, or keyword..."
                  className="pl-9"
                />
              </div>
            </Field>
          </div>

          {/* Opportunity type */}
          <Field>
            <FieldLabel htmlFor="opportunity-type">
              Opportunity Type
            </FieldLabel>

            <NativeSelect
              id="opportunity-type"
              value={filters.type}
              onChange={(event) =>
                updateFilter(
                  'type',
                  event.target.value as TypeFilter,
                )
              }
            >
              <NativeSelectOption value="all">
                All types
              </NativeSelectOption>

              {opportunityTypes.map((value) => (
                <NativeSelectOption key={value} value={value}>
                  {opportunityTypeLabel[value]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          {/* Country */}
          <Field>
            <FieldLabel htmlFor="opportunity-country">
              Country
            </FieldLabel>

            <NativeSelect
              id="opportunity-country"
              value={filters.country}
              onChange={(event) =>
                updateFilter('country', event.target.value)
              }
            >
              <NativeSelectOption value="all">
                All countries
              </NativeSelectOption>

              {countries.map((country) => (
                <NativeSelectOption
                  key={country}
                  value={country}
                >
                  {country}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          {/* Location */}
          <Field>
            <FieldLabel htmlFor="opportunity-location">
              City / Location
            </FieldLabel>

            <NativeSelect
              id="opportunity-location"
              value={filters.location}
              onChange={(event) =>
                updateFilter('location', event.target.value)
              }
            >
              <NativeSelectOption value="all">
                All locations
              </NativeSelectOption>

              {locations.map((location) => (
                <NativeSelectOption
                  key={location}
                  value={location}
                >
                  {location}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          {/* Delivery mode */}
          <Field>
            <FieldLabel htmlFor="opportunity-work-mode">
              Delivery Mode
            </FieldLabel>

            <NativeSelect
              id="opportunity-work-mode"
              value={filters.workMode}
              onChange={(event) =>
                updateFilter(
                  'workMode',
                  event.target.value as WorkModeFilter,
                )
              }
            >
              <NativeSelectOption value="all">
                All delivery modes
              </NativeSelectOption>

              <NativeSelectOption value="remote">
                Remote
              </NativeSelectOption>

              <NativeSelectOption value="on-site">
                On-site
              </NativeSelectOption>
              <NativeSelectOption value="unspecified">
                Not specified
              </NativeSelectOption>

              <NativeSelectOption value="hybrid">
                Hybrid
              </NativeSelectOption>
            </NativeSelect>
          </Field>

          {/* Funding */}
          <Field>
            <FieldLabel htmlFor="opportunity-funding">
              Funding Type
            </FieldLabel>

            <NativeSelect
              id="opportunity-funding"
              value={filters.funding}
              onChange={(event) =>
                updateFilter(
                  'funding',
                  event.target.value as FundingFilter,
                )
              }
            >
              <NativeSelectOption value="all">
                All funding types
              </NativeSelectOption>

              <NativeSelectOption value="fully_funded">
                Fully Funded
              </NativeSelectOption>

              <NativeSelectOption value="partially_funded">
                Partially Funded
              </NativeSelectOption>

              <NativeSelectOption value="unfunded">
                Unfunded
              </NativeSelectOption>

              <NativeSelectOption value="no_fee">
                No Fee
              </NativeSelectOption>

              <NativeSelectOption value="unspecified">
                Not Specified
              </NativeSelectOption>
            </NativeSelect>
          </Field>

          {/* Deadline status */}
          <Field>
            <FieldLabel htmlFor="opportunity-deadline-status">
              Deadline Status
            </FieldLabel>

            <NativeSelect
              id="opportunity-deadline-status"
              value={filters.deadlineStatus}
              onChange={(event) =>
                updateFilter(
                  'deadlineStatus',
                  event.target.value as DeadlineStatus | 'all',
                )
              }
            >
              <NativeSelectOption value="all">
                All deadlines
              </NativeSelectOption>

              <NativeSelectOption value="open">
                Open
              </NativeSelectOption>

              <NativeSelectOption value="closing-soon">
                Closing Soon (7 days)
              </NativeSelectOption>

              <NativeSelectOption value="closed">
                Closed
              </NativeSelectOption>
            </NativeSelect>
          </Field>

          {/* Sorting */}
          <Field>
            <FieldLabel htmlFor="opportunity-sort">
              Sort By
            </FieldLabel>

            <NativeSelect
              id="opportunity-sort"
              value={filters.sort}
              onChange={(event) =>
                updateFilter(
                  'sort',
                  event.target.value as SortOption,
                )
              }
            >
              <NativeSelectOption value="deadline">
                Nearest Deadline
              </NativeSelectOption>

              <NativeSelectOption value="newest">
                Newest First
              </NativeSelectOption>

              <NativeSelectOption value="title">
                Title (A–Z)
              </NativeSelectOption>
            </NativeSelect>
          </Field>
        </div>

        {/* Active filters */}
        {hasFilters && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              Filters are currently applied to your results.
            </p>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="gap-2"
            >
              <X className="size-4" aria-hidden="true" />
              Clear all filters
            </Button>
          </div>
        )}
      </section>

      {/* Results header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold">
            Explore Opportunities
          </h2>

          <p
            className="mt-1 text-sm text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            Showing {firstResult}–{lastResult} of {results.length}{' '}
            {results.length === 1
              ? 'opportunity'
              : 'opportunities'}
          </p>
        </div>

        {hasFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetFilters}
          >
            Reset search
          </Button>
        )}
      </div>

      {/* Opportunity results */}
      {paginatedResults.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedResults.map((opportunity) => (
            <li key={opportunity.id}>
              <OpportunityCard opportunity={opportunity} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={SearchX}
          title="No matching opportunities"
          description={
            opportunities.length === 0
              ? 'There are no published opportunities available right now. Check back soon!'
              : 'We could not find opportunities matching your search. Try changing your keywords or filters.'
          }
          action={
            hasFilters ? (
              <Button
                type="button"
                variant="outline"
                onClick={resetFilters}
              >
                Clear all filters
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Pagination */}
      {results.length > PAGE_SIZE && (
        <nav
          aria-label="Opportunity results pagination"
          className="flex flex-wrap items-center justify-center gap-3 border-t border-border pt-6"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage((page) => Math.max(1, page - 1))
            }
            className="gap-2"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((page) =>
                Math.min(totalPages, page + 1),
              )
            }
            className="gap-2"
          >
            Next
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </nav>
      )}

      {/* Funding information for screen readers / future card use */}
      <span className="sr-only">
        {results.map((opportunity) =>
          getFundingLabel(opportunity.fundingType),
        ).join(', ')}
        {results.map(getLocationDisplay).join(', ')}
      </span>
    </div>
  )
}