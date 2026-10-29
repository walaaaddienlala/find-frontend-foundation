'use client'

import { useMemo, useState } from 'react'
import { Search, SearchX } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { EmptyState } from '@/components/shared/states'
import { OpportunityCard } from '@/components/opportunities/opportunity-card'
import { opportunityTypeLabel } from '@/lib/status'
import { opportunityTypes, type Opportunity, type OpportunityType } from '@/lib/types'

type TypeFilter = OpportunityType | 'all'

export function OpportunityBrowser({ opportunities }: { opportunities: Opportunity[] }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<TypeFilter>('all')

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return opportunities.filter((opportunity) => {
      const matchesType = type === 'all' || opportunity.type === type
      if (!matchesType) return false
      if (!normalized) return true
      return [opportunity.title, opportunity.organization, ...opportunity.tags]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    })
  }, [opportunities, query, type])

  const hasFilters = query !== '' || type !== 'all'
  const reset = () => {
    setQuery('')
    setType('all')
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1fr_14rem] sm:p-5"
      >
        <Field>
          <FieldLabel htmlFor="opportunity-search">Search</FieldLabel>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="opportunity-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Title, organization, or skill"
              className="pl-9"
            />
          </div>
        </Field>
        <Field>
          <FieldLabel htmlFor="opportunity-type">Type</FieldLabel>
          <NativeSelect
            id="opportunity-type"
            value={type}
            onChange={(event) => setType(event.target.value as TypeFilter)}
          >
            <NativeSelectOption value="all">All types</NativeSelectOption>
            {opportunityTypes.map((value) => (
              <NativeSelectOption key={value} value={value}>
                {opportunityTypeLabel[value]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
      </form>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {results.length} {results.length === 1 ? 'opportunity' : 'opportunities'}
        </p>
        {hasFilters ? (
          <Button variant="link" size="sm" onClick={reset}>
            Clear filters
          </Button>
        ) : null}
      </div>

      {results.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((opportunity) => (
            <li key={opportunity.id}>
              <OpportunityCard opportunity={opportunity} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={SearchX}
          title="No matching opportunities"
          description="Try a different keyword or opportunity type."
          action={
            <Button variant="outline" onClick={reset}>
              Clear filters
            </Button>
          }
        />
      )}
    </div>
  )
}
