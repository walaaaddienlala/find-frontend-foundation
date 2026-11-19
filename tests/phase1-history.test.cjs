const test = require('node:test')
const assert = require('node:assert/strict')
const { createUnavailableOpportunity } = require('../.phase1-test-build/applications/opportunity-history.js')

test('unavailable opportunity placeholder preserves reference without exposing stale URLs', () => {
  const opportunity = createUnavailableOpportunity('opp-123', '2026-10-01T00:00:00.000Z')
  assert.equal(opportunity.id, 'opp-123')
  assert.match(opportunity.title, /no longer publicly available/i)
  assert.equal(opportunity.applicationUrl, '')
  assert.equal(opportunity.officialSourceUrl, '')
  assert.deepEqual(opportunity.requiredDocuments, [])
})
