'use client'

import { useState } from 'react'

import { FieldInputs, validateFields } from '@/components/ecosystem/demo-form'
import { Button } from '@/components/ui/button'
import type { Field } from '@/lib/ecosystem/types'

/** AI tool preview: shows a FIXED hand-written sample. It never calls a model and ignores the input. */
export function ToolBlock({ fields, runLabel, sample }: { fields: Field[]; runLabel: string; sample: { title: string; items: string[] } }) {
  const [values, setValues] = useState<Record<string, string | boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [shown, setShown] = useState(false)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          const found = validateFields(fields, values)
          setErrors(found)
          setShown(Object.keys(found).length === 0)
        }}
        className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:p-6"
      >
        <h2 className="text-lg font-semibold">Your input</h2>
        <FieldInputs fields={fields} values={values} errors={errors} onChange={(name, value) => { setValues((c) => ({ ...c, [name]: value })); setShown(false) }} />
        <Button type="submit" className="self-start">{runLabel}</Button>
      </form>

      <section aria-live="polite" className="flex flex-col gap-3 rounded-xl border border-dashed border-border p-4 sm:p-6">
        <h2 className="text-lg font-semibold">Result</h2>
        {shown ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sample output · hand-written · not AI-generated · not based on your input</p>
            <h3 className="font-medium">{sample.title}</h3>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm">{sample.items.map((item) => <li key={item}>{item}</li>)}</ul>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Fill in the form to preview what a result will look like. No analysis is performed.</p>
        )}
      </section>
    </div>
  )
}
