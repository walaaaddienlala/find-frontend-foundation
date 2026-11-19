const test = require('node:test')
const assert = require('node:assert/strict')
const { calculateProgressSummary } = require('../.phase1-test-build/applications/progress.js')

test('separates document readiness from task completion', () => {
  const result = calculateProgressSummary(
    [{ status: 'done' }, { status: 'in_progress' }, { status: 'missing' }],
    [{ status: 'completed' }, { status: 'todo' }],
  )
  assert.deepEqual(result, {
    documentReadiness: 33,
    taskCompletion: 50,
    completedDocuments: 1,
    totalDocuments: 3,
    completedTasks: 1,
    totalTasks: 2,
  })
})

test('returns zero for empty collections without NaN', () => {
  const result = calculateProgressSummary([], [])
  assert.equal(result.documentReadiness, 0)
  assert.equal(result.taskCompletion, 0)
  assert.ok(Number.isFinite(result.documentReadiness))
  assert.ok(Number.isFinite(result.taskCompletion))
})

test('does not treat in-progress items as complete', () => {
  const result = calculateProgressSummary(
    [{ status: 'in_progress' }, { status: 'missing' }],
    [{ status: 'in_progress' }, { status: 'todo' }],
  )
  assert.equal(result.documentReadiness, 0)
  assert.equal(result.taskCompletion, 0)
})
