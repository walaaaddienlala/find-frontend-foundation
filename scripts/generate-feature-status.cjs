const fs = require("node:fs");
const path = require("node:path");
const { features, summarizeFeatures } = require("../.scaffold-test-build/lib/features/registry.js");
const { render } = require("./render-feature-status.cjs");

fs.writeFileSync(path.resolve(__dirname, "../docs/FEATURE_STATUS.md"), render(features, summarizeFeatures) + "\n");
console.log("docs/FEATURE_STATUS.md written for", features.length, "features");
