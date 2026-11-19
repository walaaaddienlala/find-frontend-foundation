const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const t = require(path.resolve(__dirname, "../.scaffold-test-build/lib/applications/transitions.js"));

test("normal forward progress is allowed", () => {
  for (const [from, to] of [
    ["preparing", "in_progress"], ["in_progress", "submitted"], ["preparing", "submitted"],
    ["submitted", "interview"], ["interview", "accepted"], ["interview", "rejected"],
    ["submitted", "waitlisted"], ["waitlisted", "accepted"], ["saved", "preparing"],
  ]) {
    assert.deepEqual(t.validateTransition(from, to), { ok: true }, `${from} -> ${to}`);
  }
});

test("invalid jumps are rejected with a message", () => {
  for (const [from, to] of [
    ["preparing", "accepted"], ["preparing", "interview"], ["in_progress", "rejected"],
    ["accepted", "rejected"], ["rejected", "accepted"], ["saved", "accepted"], ["interview", "preparing"],
  ]) {
    const result = t.validateTransition(from, to);
    assert.equal(result.ok, false, `${from} -> ${to}`);
    assert.ok(result.message.length > 5);
  }
});

test("nothing can be moved INTO the legacy 'saved' status, but legacy saved rows can move out", () => {
  for (const from of t.applicationStatuses) {
    if (from === "saved") continue;
    assert.equal(t.validateTransition(from, "saved").ok, false, `${from} -> saved`);
  }
  assert.equal(t.validateTransition("saved", "saved").ok, true, "re-selecting the same status is idempotent");
  assert.ok(t.allowedTransitions("saved").length > 0);
});

test("mistakes can be undone, decisions can be revised", () => {
  assert.equal(t.validateTransition("submitted", "preparing").ok, true);
  assert.equal(t.validateTransition("accepted", "waitlisted").ok, true);
  assert.equal(t.validateTransition("rejected", "interview").ok, true);
});

test("unknown values never brick data or allow garbage targets", () => {
  assert.equal(t.validateTransition("legacy_weird", "preparing").ok, true, "unknown current status may move to a known one");
  assert.equal(t.validateTransition("preparing", "hacked").ok, false);
  assert.equal(t.validateTransition("preparing", "").ok, false);
  assert.deepEqual(t.allowedTransitions("legacy_weird"), []);
});

test("transition table is internally consistent", () => {
  for (const from of t.applicationStatuses) {
    for (const to of t.allowedTransitions(from)) {
      assert.ok(t.isKnownStatus(to), `${from} -> unknown ${to}`);
      assert.notEqual(to, "saved", `${from} must not target saved`);
      assert.notEqual(to, from, `${from} must not list itself`);
    }
  }
});

test("UI select offers only the current status and valid next statuses", () => {
  const offered = t.applicationStatuses.filter((s) => t.isStatusSelectable("preparing", s));
  assert.deepEqual(offered.sort(), ["in_progress", "preparing", "submitted"].sort());
  assert.equal(t.isStatusSelectable("saved", "saved"), true, "legacy row still shows its own status");
  assert.equal(t.isStatusSelectable("legacy_weird", "saved"), false);
  assert.equal(t.isStatusSelectable("legacy_weird", "preparing"), true);
});
