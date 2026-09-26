---
name: add-cloud-operation
description: Add a new Google Cloud (or other cloud API) operation to CyberChefCloud end to end. Covers the op file using gcpFetch, the CSP connect-src allow-list, Categories.json, AuthorizedEndpoints.md, offline and Nightwatch E2E tests, and verification. Use when asked to add, create, or scaffold a new GCloud/Google/cloud ingredient or operation, wire up a new Google API, or test a cloud op.
---

# Add a cloud operation

Work through the steps in order. Each one has caused a real failure when skipped: a missing CSP entry, a missing category, or missing config regeneration all give an op that silently doesn't appear or doesn't connect.

## 0. Check the API with curl before writing any code

Confirm the endpoint, request shape and response shape with a raw call:

```bash
TOKEN=$(gcloud auth print-access-token)
curl -X POST "https://<service>.googleapis.com/v1/<method>" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-goog-user-project: <PROJECT_ID>" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

- If you get 403 "requires a quota project": the `x-goog-user-project` header is missing. The op gets this header from the Quota Project set in `Authenticate Google Cloud`.
- If you get 401/403 on GCS: this is an IAM problem, not an auth problem. See `docs/Troubleshooting.md`.
- If the API reads from GCS on your behalf, see `docs/GCloudServiceAccountLessonsLearned.md` (Google-managed service agents, lazy provisioning, cross-project grants).

## 1. Create the operation file

Create `src/core/operations/GCloud<Name>.mjs`. The display name is `"GCloud <Name>"`. Read a similar existing op first:

| Shape of API | Reference op |
| :--- | :--- |
| Simple GET with query params | `GCloudGeocode.mjs` |
| POST JSON, sync response | `GCloudVisionLabelImage.mjs`, `GCloudNaturalLanguage.mjs` |
| Long-running op (submit + poll) | `GCloudSpeechToText.mjs` (`pollLongRunningOperation`) |
| Reads `gs://` input / writes GCS output | `GCloudNaturalLanguage.mjs`, `GCloudRedactImage.mjs` |
| Regional / Vertex endpoint | `PromptLLM.mjs` (uses `defaultRegion` from credentials) |

Skeleton:

```javascript
/**
 * @author CyberChefCloud
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { gcpFetch } from "../lib/GoogleCloud.mjs";

const API_URL = "https://<service>.googleapis.com/v1/<method>";

/**
 * GCloud <Name> operation
 */
class GCloud<Name> extends Operation {

    /**
     * GCloud<Name> constructor
     */
    constructor() {
        super();

        this.name = "GCloud <Name>";
        this.module = "Cloud";
        this.description = [
            "What it does, in one sentence.",
            "<br><br>",
            "<b>Inputs:</b> ...",
            "<br>",
            "<b>Outputs:</b> ...",
            "<br><br>",
            "<b>Requirements:</b> Requires a prior <code>Authenticate Google Cloud</code> operation."
        ].join("\n");
        this.infoURL = "https://cloud.google.com/<service>/docs";
        this.inputType = "string";   // or "ArrayBuffer" for binary (images/audio)
        this.outputType = "string";  // or "JSON"
        this.args = [
            { name: "Output Format", type: "option", value: ["Text Summary", "JSON"] }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const [outputFormat] = args;
        if (!input || input.trim() === "") return "";

        const data = await gcpFetch(API_URL, {
            method: "POST",
            body: { /* payload */ }
        });

        if (outputFormat === "JSON") return JSON.stringify(data, null, 2);
        // ...format a readable summary
    }
}

export default GCloud<Name>;
```

Rules:
- **Never add credential args.** `gcpFetch` handles auth, JSON, query params and errors, and throws `OperationError("GCP API Error (status): msg")`. Only drop down to `applyGCPAuth` + `fetch` if you need a non-JSON body or response (binary upload/download).
- `applyGCPAuth` returns `{url, headers}` (an object, not an array). `docs/AddingCloudOperations.md` shows array destructuring, which is wrong.
- `toggleString` args arrive as `{option, string}`, so unpack `.string`.
- Offer a `JSON` output option (raw response) alongside a readable format. This is what the rest of the Cloud ops do, and it helps with chaining.
- Handle multi-line input as a batch (one API call per line) where it makes sense, as `GCloudGeocode` does.
- JSDoc on every class, function and method, or `npm run lint` fails.

## 2. Allow the endpoint in the CSP

Open `src/web/html/index.html` and find the `connect-src` directive in the `Content-Security-Policy` meta tag. If the host isn't already allowed, append it. (There is a `https://*.googleapis.com` wildcard today, but list specific hosts explicitly anyway, as the existing entries do.) Non-Google hosts, such as Cloud Run proxies, always need an explicit entry.

Then add the same host, with a short label, to `docs/AuthorizedEndpoints.md`.

## 3. Register in the UI category

Add `"GCloud <Name>"` (the exact `this.name`) to the `"Cloud"` category in `src/core/config/Categories.json`. You can also add it to a thematic category if one fits; the Vision ops are listed in an image category as well, for example.

## 4. Regenerate config and lint

```bash
npx grunt configTests   # regenerates OperationConfig / module index
npm run lint
```

Fix all lint errors. Ops that are missing from the generated config give "Unknown operation" in tests and don't show in the UI.

## 5. Offline operation test

Add a test for behaviour that needs no network, e.g. the error when no `Authenticate Google Cloud` op is present, or empty input returning `""`. Create `tests/operations/tests/GCloud<Name>.mjs`:

```javascript
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "GCloud <Name>: errors without auth",
        input: "some input",
        expectedError: true,
        // expectedError is a flag; the exact error display string goes in expectedOutput
        expectedOutput: "No Google Cloud credentials found. Please add the 'Authenticate Google Cloud' operation before this one.",
        recipeConfig: [{ op: "GCloud <Name>", args: ["Text Summary"] }]
    }
]);
```

If the string doesn't match, the test runner prints the string it received, so run once and copy that in.

Import it in `tests/operations/index.mjs` alongside the others (`import "./tests/GCloud<Name>.mjs";`), then run `npm test`. The existing `tests/operations/tests/GoogleTranslate.mjs` is stale and isn't imported, so don't copy its args.

## 6. Nightwatch E2E test against the live API

Create `tests/browser/GCloud<Name>.js`, modelled on `tests/browser/GCloudGeocode.js`:

```javascript
const browserUtils = require("./browserUtils.js");
require("dotenv").config();

module.exports = {
    before: browser => {
        browser
            .resizeWindow(1280, 800)
            .url(browser.launchUrl)
            .useCss()
            .waitForElementNotPresent("#preloader", 10000)
            .click("#auto-bake-label");
    },

    "GCloud <Name>: <expected behaviour>": function (browser) {
        const token = browserUtils.getTestPAT();          // or getTestAPIKey()
        if (!token) {
            console.log("Skipping live API test: no credentials.");
            return;                                         // graceful skip, so CI stays green
        }

        browserUtils.loadRecipeConfig(browser, [
            {
                op: "Authenticate Google Cloud",
                // [authType, credentials(toggleString), quotaProject, defaultRegion, apiKey, outputLogs]
                args: ["Personal Access Token (PAT)", { option: "UTF8", string: token }, "<quota-project>", "us-central1"]
            },
            { op: "GCloud <Name>", args: ["Text Summary"] }
        ], "test input");

        browser.waitForElementNotVisible("#snackbar-container", 6000);
        browserUtils.bake(browser);
        browser.pause(5000); // wait for the API call; longer for LROs

        browser.saveScreenshot("tests/browser/output/GCloud<Name>.png");
        browser.execute(function () {
            return window.app.manager.output.outputEditorView.state.doc.toString();
        }, [], function ({ value }) {
            browser.assert.ok(value.includes("<expected>"), `Got: ${value}`);
        });
    },

    after: browser => browser.end()
};
```

- Choose PAT or API key based on what the API accepts. Maps/Places work with an API key; most other APIs need OAuth/PAT. `getTestAPIKey()` reads `CYBERCHEF_GCP_TEST_API_KEY`. `getTestPAT()` reads `CYBERCHEF_GCP_TEST_TOKEN` or falls back to `gcloud`.
- Assert on stable substrings, not on exact AI/ML output.
- Don't use `browserUtils.expectOutput` for async cloud ops. It gives false timeouts.

Run it with the dev server running in another terminal (start it in the background with `npm run start` and wait for it to compile):

```bash
npx nightwatch tests/browser/GCloud<Name>.js
```

If the test fails, read the screenshot to see the UI state (error snackbar, hung spinner, output) before changing code. Chromedriver logs are in `tests/browser/output/`.

## 7. Manual check (tell the user)

The OAuth PKCE popup can't be automated. Ask the user to check the op by hand at http://localhost:8080 with `Authenticate Google Cloud` set to **OAuth 2.0 (Web Application: PKCE)**. Also list any API they need to enable in their GCP project. If the API needs enabling or IAM setup, add a line to `docs/GoogleCloudSetup.md` Step 2.

## Checklist

- [ ] curl check done
- [ ] `src/core/operations/GCloud<Name>.mjs` uses `gcpFetch`, has no auth args, and has JSDoc
- [ ] Host in CSP `connect-src` (`src/web/html/index.html`) and in `docs/AuthorizedEndpoints.md`
- [ ] Added to `"Cloud"` in `src/core/config/Categories.json`
- [ ] `npx grunt configTests` and `npm run lint` pass
- [ ] Offline test added, imported in `tests/operations/index.mjs`, and `npm test` passes
- [ ] Nightwatch test added, skips without credentials, and passes with them
- [ ] User told what to check manually and which APIs to enable
