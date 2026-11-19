const test = require('node:test')
const assert = require('node:assert/strict')
const { canUnsaveApplication } = require('../.phase0-test-build/applications/save-state.js')
const { getSafeReturnTo } = require('../.phase0-test-build/auth/redirect.js')

test('Unsave is allowed only for saved records', () => {
  for (const status of ['preparing', 'in_progress', 'submitted', 'interview', 'accepted', 'rejected', 'waitlisted', 'archived', null, undefined, '']) {
    assert.equal(canUnsaveApplication(status), false, `must protect status=${status}`)
  }
  assert.equal(canUnsaveApplication('saved'), true)
})

test('safe return path preserves a local opportunity route', () => {
  assert.equal(getSafeReturnTo('/opportunities/example?ref=save#details', 'https://find.example'), '/opportunities/example?ref=save#details')
})

test('safe return path rejects external and malformed destinations', () => {
  for (const candidate of ['https://evil.example', '//evil.example/path', '/\\\\evil.example', '/\\evil.example', 'javascript:alert(1)', null, '', 'not-a-path']) {
    assert.equal(getSafeReturnTo(candidate, 'https://find.example'), '/opportunities', `must reject ${candidate}`)
  }
})
