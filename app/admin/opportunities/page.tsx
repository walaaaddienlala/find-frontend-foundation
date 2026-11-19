import { isSupabaseConfigured } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import {
  createOpportunity,
  updateOpportunity,
} from './actions'

export const metadata = {
  title: 'Manage Opportunities | Find Admin',
}

export const dynamic = 'force-dynamic'

type Opportunity = {
  id: string
  title: string
  provider: string
  opportunity_type: string
  description: string
  eligibility: string | null
  academic_requirements: string | null
  skills_requirements: string[] | null
  required_documents: string[] | null
  country: string | null
  location: string | null
  delivery_mode: string
  funding_type: string
  deadline: string | null
  program_start_date: string | null
  program_end_date: string | null
  application_url: string
  official_source_url: string
  contact_information: string | null
  tags: string[] | null
  verification_status: string
  status: string
  created_at: string
}

function formatDate(value: string | null) {
  if (!value) return ''

  return value.slice(0, 10)
}

function formatDateTime(value: string | null) {
  if (!value) return ''

  const date = new Date(value)

  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60_000)

  return localDate.toISOString().slice(0, 16)
}

function toText(value: string[] | null) {
  return value?.join('\n') ?? ''
}

function Field({
  label,
  name,
  defaultValue = '',
  required = false,
  type = 'text',
}: {
  label: string
  name: string
  defaultValue?: string
  required?: boolean
  type?: string
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>

      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
    </label>
  )
}

function TextArea({
  label,
  name,
  defaultValue = '',
  required = false,
  rows = 3,
}: {
  label: string
  name: string
  defaultValue?: string
  required?: boolean
  rows?: number
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>

      <textarea
        name={name}
        defaultValue={defaultValue}
        required={required}
        rows={rows}
        className="w-full resize-y rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
    </label>
  )
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string
  name: string
  defaultValue: string
  options: { label: string; value: string }[]
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">
        {label}
      </span>

      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

const typeOptions = [
  { label: 'Scholarship', value: 'scholarship' },
  { label: 'Internship', value: 'internship' },
  { label: 'Fellowship', value: 'fellowship' },
  { label: 'Graduate Program', value: 'graduate_program' },
  { label: 'Competition', value: 'competition' },
  { label: 'Volunteering', value: 'volunteering' },
  { label: 'Conference', value: 'conference' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Other', value: 'other' },
]

const deliveryOptions = [
  { label: 'Unspecified', value: 'unspecified' },
  { label: 'Remote', value: 'remote' },
  { label: 'In Person', value: 'in_person' },
  { label: 'Hybrid', value: 'hybrid' },
]

const fundingOptions = [
  { label: 'Unspecified', value: 'unspecified' },
  { label: 'Fully Funded', value: 'fully_funded' },
  { label: 'Partially Funded', value: 'partially_funded' },
  { label: 'Unfunded', value: 'unfunded' },
  { label: 'No Fee', value: 'no_fee' },
]

function StatusBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    published: 'bg-emerald-500/10 text-emerald-700',
    draft: 'bg-amber-500/10 text-amber-700',
    archived: 'bg-muted text-muted-foreground',
    unverified: 'bg-muted text-muted-foreground',
    pending_review: 'bg-blue-500/10 text-blue-700',
    needs_update: 'bg-red-500/10 text-red-700',
  }

  const label = value.replaceAll('_', ' ')

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
        styles[value] ?? 'bg-muted text-muted-foreground'
      }`}
    >
      {label}
    </span>
  )
}

function OpportunityForm({
  opportunity,
}: {
  opportunity?: Opportunity
}) {
  const isEditing = Boolean(opportunity)

  return (
    <form
      action={isEditing ? updateOpportunity : createOpportunity}
      className="space-y-6"
    >
      {opportunity && (
        <input type="hidden" name="id" value={opportunity.id} />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Opportunity Title"
          name="title"
          defaultValue={opportunity?.title}
          required
        />

        <Field
          label="Provider / Organization"
          name="provider"
          defaultValue={opportunity?.provider}
          required
        />

        <SelectField
          label="Opportunity Type"
          name="opportunity_type"
          defaultValue={opportunity?.opportunity_type ?? 'scholarship'}
          options={typeOptions}
        />

        <SelectField
          label="Delivery Mode"
          name="delivery_mode"
          defaultValue={opportunity?.delivery_mode ?? 'unspecified'}
          options={deliveryOptions}
        />

        <SelectField
          label="Funding Type"
          name="funding_type"
          defaultValue={opportunity?.funding_type ?? 'unspecified'}
          options={fundingOptions}
        />

        <Field
          label="Country"
          name="country"
          defaultValue={opportunity?.country ?? ''}
        />

        <Field
          label="Location"
          name="location"
          defaultValue={opportunity?.location ?? ''}
        />

        <Field
          label="Application Deadline"
          name="deadline"
          type="datetime-local"
          defaultValue={formatDateTime(opportunity?.deadline ?? null)}
        />

        <Field
          label="Program Start Date"
          name="program_start_date"
          type="date"
          defaultValue={formatDate(opportunity?.program_start_date ?? null)}
        />

        <Field
          label="Program End Date"
          name="program_end_date"
          type="date"
          defaultValue={formatDate(opportunity?.program_end_date ?? null)}
        />
      </div>

      <TextArea
        label="Description"
        name="description"
        defaultValue={opportunity?.description}
        required
        rows={5}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextArea
          label="Eligibility"
          name="eligibility"
          defaultValue={opportunity?.eligibility ?? ''}
        />

        <TextArea
          label="Academic Requirements"
          name="academic_requirements"
          defaultValue={opportunity?.academic_requirements ?? ''}
        />

        <TextArea
          label="Required Skills"
          name="skills_requirements"
          defaultValue={toText(opportunity?.skills_requirements ?? null)}
        />

        <TextArea
          label="Required Documents"
          name="required_documents"
          defaultValue={toText(opportunity?.required_documents ?? null)}
        />

        <TextArea
          label="Tags"
          name="tags"
          defaultValue={toText(opportunity?.tags ?? null)}
        />

        <TextArea
          label="Contact Information"
          name="contact_information"
          defaultValue={opportunity?.contact_information ?? ''}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Application URL"
          name="application_url"
          type="url"
          defaultValue={opportunity?.application_url}
          required
        />

        <Field
          label="Official Source URL"
          name="official_source_url"
          type="url"
          defaultValue={opportunity?.official_source_url}
          required
        />
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
        New opportunities are always saved as unverified drafts. Publication and verification status are managed only through the dedicated review workflow.
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <button
          type="submit"
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          {isEditing ? 'Save Changes' : 'Create Opportunity'}
        </button>

        <p className="text-xs text-muted-foreground">
          Fields marked with * are required.
        </p>
      </div>
    </form>
  )
}

export default async function AdminOpportunitiesPage() {
  // The admin layout redirects when Supabase is not configured; do not create a client here.
  if (!isSupabaseConfigured()) return null

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .order('created_at', { ascending: false })

  const opportunities = (data ?? []) as Opportunity[]

  const publishedCount = opportunities.filter(
    (item) => item.status === 'published',
  ).length

  const draftCount = opportunities.filter(
    (item) => item.status === 'draft',
  ).length

  const archivedCount = opportunities.filter(
    (item) => item.status === 'archived',
  ).length

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-primary">
          Content Management
        </p>

        <h1 className="mt-2 font-heading text-3xl font-bold">
          Opportunities
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Create, manage, verify, and publish opportunities across the
          Find platform.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Could not load opportunities: {error.message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Opportunities', value: opportunities.length },
          { label: 'Published', value: publishedCount },
          { label: 'Drafts', value: draftCount },
          { label: 'Archived', value: archivedCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <p className="text-sm text-muted-foreground">
              {stat.label}
            </p>

            <p className="mt-3 text-3xl font-bold">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="mb-6">
          <h2 className="text-xl font-bold">
            Add New Opportunity
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Enter the opportunity details below.
          </p>
        </div>

        <OpportunityForm />
      </div>

      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold">
            Existing Opportunities
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage and update your existing listings.
          </p>
        </div>

        {opportunities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <h3 className="font-semibold">
              No opportunities yet
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Create your first opportunity using the form above.
            </p>
          </div>
        ) : (
          opportunities.map((opportunity) => (
            <details
              key={opportunity.id}
              className="group rounded-2xl border border-border bg-card"
            >
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">
                    {opportunity.title}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {opportunity.provider} ·{' '}
                    {opportunity.opportunity_type.replaceAll('_', ' ')}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge value={opportunity.status} />
                    <StatusBadge
                      value={opportunity.verification_status}
                    />
                  </div>
                </div>

                <span className="text-sm font-medium text-primary">
                  Edit Details ↓
                </span>
              </summary>

              <div className="border-t border-border p-5 sm:p-7">
                <OpportunityForm opportunity={opportunity} />
              </div>
            </details>
          ))
        )}
      </div>
    </section>
  )
}