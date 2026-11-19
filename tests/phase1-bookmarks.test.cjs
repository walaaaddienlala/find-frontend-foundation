const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const dataLayer = fs.readFileSync(path.join(root, 'lib/data/applications.ts'), 'utf8')
const bookmarkButton = fs.readFileSync(path.join(root, 'components/opportunities/save-opportunity-button.tsx'), 'utf8')

test('saved opportunities are read from the dedicated bookmark table', () => {
  const savedFunction = dataLayer.split('export async function getSavedOpportunities')[1].split('export async function getUserApplications')[0]
  assert.match(savedFunction, /from\('saved_opportunities'\)/)
  assert.doesNotMatch(savedFunction, /from\('applications'\)/)
  assert.doesNotMatch(savedFunction, /\.eq\('status',\s*'saved'\)/)
})

test('save and unsave actions only mutate saved_opportunities', () => {
  assert.match(bookmarkButton, /from\('saved_opportunities'\)\.insert/)
  assert.match(bookmarkButton, /from\('saved_opportunities'\)\s*\n\s*\.delete/)
  assert.doesNotMatch(bookmarkButton, /from\('applications'\)/)
  assert.doesNotMatch(bookmarkButton, /status:\s*'saved'/)
})

test('bookmark UI does not block saving merely because an application exists', () => {
  assert.doesNotMatch(bookmarkButton, /hasActiveApplication/)
})

const applicationActions = fs.readFileSync(path.join(root, 'app/applications/actions.ts'), 'utf8')
const startApplicationButton = fs.readFileSync(path.join(root, 'components/applications/start-application-button.tsx'), 'utf8')
const opportunityDetail = fs.readFileSync(path.join(root, 'app/opportunities/[id]/page.tsx'), 'utf8')

test('start application creates a preparing application record, not a bookmark', () => {
  const action = applicationActions.split('export async function startApplicationAction')[1]
  assert.ok(action)
  assert.match(action, /\.from\('applications'\)\s*\n\s*\.insert\(/)
  assert.match(action, /status:\s*'preparing'/)
  assert.match(action, /preparation_progress:\s*0/)
  assert.doesNotMatch(action, /\.from\('saved_opportunities'\)/)
})

test('start application is idempotent and does not reset an existing application', () => {
  const action = applicationActions.split('export async function startApplicationAction')[1]
  assert.match(action, /\.eq\('user_id', user\.id\)/)
  assert.match(action, /\.eq\('opportunity_id', normalizedId\)/)
  assert.match(action, /if \(existing\)/)
  assert.match(action, /alreadyExists:\s*true/)
  assert.match(action, /unique-key race/i)
  assert.doesNotMatch(action, /\.update\(/)
  assert.doesNotMatch(action, /\.delete\(/)
})

test('opportunity detail exposes tracking separately from the external application link', () => {
  assert.match(opportunityDetail, /<StartApplicationButton opportunityId=\{opportunity\.id\}/)
  assert.match(opportunityDetail, /Apply Now/)
  assert.match(startApplicationButton, /startApplicationAction\(opportunityId\)/)
  assert.match(startApplicationButton, /href="\/applications"/)
})
