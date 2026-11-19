const deadlineFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatDeadline(
  isoDate: string | null | undefined,
): string {
  if (!isoDate || !isoDate.trim()) {
    return 'No deadline specified'
  }

  const date = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`)

  if (Number.isNaN(date.getTime())) {
    return 'No deadline specified'
  }

  return deadlineFormatter.format(date)
}