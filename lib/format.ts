const deadlineFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

/** Formats an ISO date (YYYY-MM-DD) deterministically on server and client. */
export function formatDeadline(isoDate: string) {
  return deadlineFormatter.format(new Date(`${isoDate}T00:00:00Z`))
}
