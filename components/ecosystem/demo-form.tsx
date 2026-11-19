'use client'

import { useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import type { Field } from '@/lib/ecosystem/types'

type Values = Record<string, string | boolean>

export function validateFields(fields: Field[], values: Values): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const field of fields) {
    const value = values[field.name]
    const text = typeof value === 'string' ? value.trim() : ''

    if (field.required && (field.type === 'checkbox' ? value !== true : text === '')) {
      errors[field.name] = field.type === 'checkbox' ? 'Please confirm to continue.' : `${field.label} is required.`
      continue
    }
    if (!text) continue
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) errors[field.name] = 'Enter a valid email address.'
    else if (field.type === 'url' && !/^https?:\/\/\S+$/i.test(text)) errors[field.name] = 'Enter a link starting with http:// or https://.'
    else if (field.type === 'number' && Number.isNaN(Number(text))) errors[field.name] = 'Enter a number.'
    else if (field.minLength && text.length < field.minLength) errors[field.name] = `Please write at least ${field.minLength} characters.`
  }

  return errors
}

const inputClass = 'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm'

export function FieldInputs({ fields, values, errors, onChange }: { fields: Field[]; values: Values; errors: Record<string, string>; onChange: (name: string, value: string | boolean) => void }) {
  const prefix = useId()

  return (
    <>
      {fields.map((field) => {
        const id = `${prefix}-${field.name}`
        const error = errors[field.name]
        const describedBy = error ? `${id}-error` : field.hint ? `${id}-hint` : undefined

        return (
          <div key={field.name} className="flex flex-col gap-1.5">
            {field.type === 'checkbox' ? (
              <label className="flex items-start gap-2 text-sm">
                <input id={id} type="checkbox" checked={values[field.name] === true} onChange={(event) => onChange(field.name, event.target.checked)} aria-invalid={Boolean(error)} aria-describedby={describedBy} className="mt-0.5 size-4" />
                <span>{field.label}{field.required ? ' *' : ''}</span>
              </label>
            ) : (
              <>
                <label htmlFor={id} className="text-sm font-medium">{field.label}{field.required ? ' *' : ''}</label>
                {field.type === 'textarea' ? (
                  <textarea id={id} rows={4} placeholder={field.placeholder} value={(values[field.name] as string) ?? ''} onChange={(event) => onChange(field.name, event.target.value)} aria-invalid={Boolean(error)} aria-describedby={describedBy} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                ) : field.type === 'select' ? (
                  <select id={id} value={(values[field.name] as string) ?? ''} onChange={(event) => onChange(field.name, event.target.value)} aria-invalid={Boolean(error)} aria-describedby={describedBy} className={inputClass}>
                    <option value="">Select…</option>
                    {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : field.type === 'file' ? (
                  <input id={id} type="file" onChange={(event) => onChange(field.name, event.target.files?.[0]?.name ?? '')} aria-describedby={describedBy} className="text-sm" />
                ) : (
                  <input id={id} type={field.type === 'number' ? 'text' : field.type} inputMode={field.type === 'number' ? 'numeric' : undefined} placeholder={field.placeholder} value={(values[field.name] as string) ?? ''} onChange={(event) => onChange(field.name, event.target.value)} aria-invalid={Boolean(error)} aria-describedby={describedBy} className={inputClass} />
                )}
              </>
            )}
            {field.hint && !error ? <p id={`${id}-hint`} className="text-xs text-muted-foreground">{field.hint}</p> : null}
            {error ? <p id={`${id}-error`} role="alert" className="text-xs text-destructive">{error}</p> : null}
          </div>
        )
      })}
    </>
  )
}

/**
 * Demo form: real client-side validation, but submitting never saves or sends
 * anything and the result message says so. It must never claim success.
 */
export function DemoForm({ title, fields, submit, note }: { title?: string; fields: Field[]; submit: string; note?: string }) {
  const [values, setValues] = useState<Values>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [result, setResult] = useState<'idle' | 'valid'>('idle')

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const found = validateFields(fields, values)
        setErrors(found)
        setResult(Object.keys(found).length === 0 ? 'valid' : 'idle')
      }}
      className="flex max-w-2xl flex-col gap-4 rounded-xl border border-border p-4 sm:p-6"
    >
      {title ? <h2 className="text-lg font-semibold">{title}</h2> : null}
      <FieldInputs fields={fields} values={values} errors={errors} onChange={(name, value) => { setValues((current) => ({ ...current, [name]: value })); setResult('idle') }} />
      <div className="flex flex-col items-start gap-2">
        <Button type="submit">{submit}</Button>
        {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
      </div>
      {result === 'valid' ? (
        <p role="status" className="rounded-lg border border-border bg-muted/50 p-3 text-sm">
          Your input looks valid, but this is a demo preview and is not connected. Nothing was saved or sent.
        </p>
      ) : null}
    </form>
  )
}
