export type ChecklistProgressItem = { status: string }
export type TaskProgressItem = { status: string }

export type ProgressSummary = {
  documentReadiness: number
  taskCompletion: number
  completedDocuments: number
  totalDocuments: number
  completedTasks: number
  totalTasks: number
}

function percentage(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

/** Required-document readiness is independent from task completion. */
export function calculateProgressSummary(
  checklist: ChecklistProgressItem[],
  tasks: TaskProgressItem[],
): ProgressSummary {
  const completedDocuments = checklist.filter((item) => item.status === 'done').length
  const completedTasks = tasks.filter((item) => item.status === 'completed').length

  return {
    documentReadiness: percentage(completedDocuments, checklist.length),
    taskCompletion: percentage(completedTasks, tasks.length),
    completedDocuments,
    totalDocuments: checklist.length,
    completedTasks,
    totalTasks: tasks.length,
  }
}
