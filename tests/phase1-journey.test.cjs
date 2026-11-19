const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const actions = read('app/applications/actions.ts')
const applicationsData = read('lib/data/applications.ts')
const applicationsPage = read('app/applications/page.tsx')
const checklist = read('components/applications/application-checklist.tsx')
const manager = read('components/applications/application-manager.tsx')
const saveButton = read('components/opportunities/save-opportunity-button.tsx')
const savedPage = read('app/saved/page.tsx')
const opportunityPage = read('app/opportunities/[id]/page.tsx')
const startButton = read('components/applications/start-application-button.tsx')

test('journey: bookmarking remains independent from application tracking', () => {
  assert.match(saveButton, /from\('saved_opportunities'\)\.insert/)
  assert.match(saveButton, /from\('saved_opportunities'\)\s*\n\s*\.delete/)
  assert.doesNotMatch(saveButton, /from\('applications'\)/)
  assert.match(savedPage, /getSavedOpportunities/)
  assert.match(applicationsData, /from\('saved_opportunities'\)/)
})

test('journey: starting tracking requires a published opportunity and authenticated user', () => {
  const start = actions.split('export async function startApplicationAction')[1]
  assert.ok(start)
  assert.match(start, /getAuthenticatedUser\(\)/)
  assert.match(start, /from\('opportunities'\)/)
  assert.match(start, /\.eq\('status',\s*'published'\)/)
  assert.match(start, /status:\s*'preparing'/)
  assert.match(start, /preparation_progress:\s*0/)
})

test('journey: starting tracking is idempotent and preserves existing lifecycle state', () => {
  const start = actions.split('export async function startApplicationAction')[1]
  assert.match(start, /\.eq\('user_id',\s*user\.id\)/)
  assert.match(start, /\.eq\('opportunity_id',\s*normalizedId\)/)
  assert.match(start, /if \(existing\)/)
  assert.match(start, /unique-key race/i)
  assert.doesNotMatch(start, /\.update\(/)
  assert.doesNotMatch(start, /\.delete\(/)
})

test('journey: My Applications loads only the signed-in user’s application records', () => {
  assert.match(applicationsData, /\.from\('applications'\)/)
  assert.match(applicationsData, /\.eq\('user_id',\s*user\.id\)/)
  assert.match(applicationsPage, /getUserApplications\(\)/)
  assert.match(applicationsPage, /redirect\('\/sign-in'\)/)
})

test('journey: checklist CRUD is scoped by application and authenticated user', () => {
  for (const operation of ['select', 'insert', 'update', 'delete']) {
    assert.match(checklist, new RegExp(`\\.from\\('application_checklist_items'\\)`))
  }
  assert.match(checklist, /\.eq\('application_id',\s*applicationId\)/)
  assert.match(checklist, /\.eq\('user_id',\s*user\.id\)/)
  assert.match(checklist, /status:\s*'missing'/)
  assert.match(checklist, /\.update\(\{\s*status\s*\}\)/)
})

test('journey: checklist readiness and task completion remain separate metrics', () => {
  assert.match(applicationsData, /calculateChecklistProgress\(applicationChecklist\)/)
  assert.match(applicationsData, /item\.status === 'done'/)
  assert.match(manager, /onReadinessChange=\{setDocumentsReady\}/)
  assert.match(manager, /documentsReady=\{documentsReady\}/)
  assert.match(applicationsPage, /completedTasks/)
  assert.match(applicationsPage, /preparationProgress/)
})

test('journey: application tracking and external Apply Now are distinct actions', () => {
  assert.match(opportunityPage, /<StartApplicationButton opportunityId=\{opportunity\.id\}/)
  assert.match(opportunityPage, /Apply Now/)
  assert.match(startButton, /startApplicationAction\(opportunityId\)/)
  assert.match(startButton, /href="\/applications"/)
})

test('journey: no checklist or bookmark operation deletes an application record', () => {
  assert.doesNotMatch(checklist, /\.from\('applications'\)\s*\n\s*\.delete/)
  assert.doesNotMatch(saveButton, /\.from\('applications'\)/)
  assert.doesNotMatch(checklist, /\.from\('saved_opportunities'\)/)
})
