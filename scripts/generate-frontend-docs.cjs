const fs = require("node:fs");
const path = require("node:path");
const { routes, backend } = require("./render-frontend-docs.cjs");
const load = (p) => require(path.resolve(__dirname, "../.scaffold-test-build", p));
const { pages, moduleTitle, moduleBackend } = load("lib/ecosystem/registry.js");
const { allConcreteRoutes, collectionBase } = load("lib/ecosystem/resolve.js");
const { coverage } = load("lib/ecosystem/coverage.js");
const { collections } = load("lib/ecosystem/demo.js");

fs.writeFileSync(path.resolve(__dirname, "../docs/FRONTEND_ROUTES_AND_MODULES.md"), routes({ pages, moduleTitle, coverage, allConcreteRoutes }) + "\n");
fs.writeFileSync(path.resolve(__dirname, "../docs/FRONTEND_BACKEND_REQUIREMENTS.md"), backend({ pages, moduleTitle, moduleBackend, collections, collectionBase }) + "\n");
console.log("frontend docs written:", pages.length, "pages");
