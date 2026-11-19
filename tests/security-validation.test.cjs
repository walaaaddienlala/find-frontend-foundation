const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { normalizeHttpUrl } = require(path.resolve(
  __dirname,
  "../.security-test-build/url.js",
));

test("accepts ordinary http and https URLs", () => {
  assert.equal(normalizeHttpUrl("https://example.org/apply"), "https://example.org/apply");
  assert.equal(normalizeHttpUrl("  http://example.org  "), "http://example.org/");
});

test("rejects dangerous or non-web schemes", () => {
  for (const bad of [
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "file:///etc/passwd",
    "ftp://example.org/file",
    "vbscript:msgbox(1)",
  ]) {
    assert.equal(normalizeHttpUrl(bad), null, bad);
  }
});

test("rejects empty, relative, malformed, and credential-bearing URLs", () => {
  for (const bad of ["", "   ", "/relative/path", "example.org", "http://", "https://user:pw@example.org", null, undefined]) {
    assert.equal(normalizeHttpUrl(bad), null, String(bad));
  }
});
