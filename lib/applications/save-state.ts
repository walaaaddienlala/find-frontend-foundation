/** Only a saved bookmark may be removed through the Save/Unsave control. */
export function canUnsaveApplication(status: string | null | undefined): boolean {
  return status === 'saved'
}
