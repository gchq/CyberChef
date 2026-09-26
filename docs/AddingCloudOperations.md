# Guide: Adding New Google Cloud Operations to CyberChef

Google Cloud operations need a few steps beyond a standard CyberChef operation, because authentication is shared across a recipe and because the browser's Content Security Policy (CSP) blocks endpoints that are not on its allow-list.

For Claude Code users, the same process is written as a skill with a full checklist: `.claude/skills/add-cloud-operation/SKILL.md`.

## 1. Test the API with curl first

Confirm the endpoint and the request and response shapes before writing any code:

```bash
TOKEN=$(gcloud auth print-access-token)
curl -X POST "https://vision.googleapis.com/v1/images:annotate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-goog-user-project: YOUR_PROJECT_ID" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

See `GCloudServiceAccountLessonsLearned.md` for APIs that read from Cloud Storage.

## 2. Create the operation file

Create `src/core/operations/GCloud<Name>.mjs`, with `this.module = "Cloud"`. Use `gcpFetch` from `src/core/lib/GoogleCloud.mjs`. It applies authentication, adds query parameters, serialises a JSON body, parses the JSON response, and throws an `OperationError` for API errors.

```javascript
import Operation from "../Operation.mjs";
import { gcpFetch } from "../lib/GoogleCloud.mjs";

class GCloudVisionAnalyze extends Operation {
    constructor() {
        super();
        this.name = "GCloud Vision Analyze";
        this.module = "Cloud";
        this.description = "Analyzes an image using Google Cloud Vision.<br><br><b>Requirements:</b> Requires a prior <code>Authenticate Google Cloud</code> operation.";
        this.infoURL = "https://cloud.google.com/vision/docs";
        this.inputType = "ArrayBuffer";
        this.outputType = "JSON";
        this.args = [ /* operation options only, no credentials */ ];
    }

    async run(input, args) {
        return await gcpFetch("https://vision.googleapis.com/v1/images:annotate", {
            method: "POST",
            body: { /* payload */ }
        });
    }
}
```

**Do not** add credential arguments (API keys or tokens) to the operation. Users put the `Authenticate Google Cloud` operation at the top of the recipe, and `gcpFetch` reads the cached credentials. It supports API keys, Personal Access Tokens (PATs) and GIS OAuth tokens.

If you need a non-JSON request or response (for example a binary upload), use the lower-level `applyGCPAuth`. It returns an object:

```javascript
const { url, headers } = applyGCPAuth(baseUrl, new Headers());
```

For examples of each API pattern, see `GCloudGeocode.mjs` (GET with query parameters), `GCloudSpeechToText.mjs` (long-running operation with polling) and `GCloudNaturalLanguage.mjs` (writes output to GCS).

## 3. Update the Content Security Policy (CSP)

The CSP stops cross-site scripting (XSS) from sending the OAuth token held in `sessionStorage` to other hosts. A request to an endpoint that is not on the allow-list is **blocked by the browser**.

1. Open `src/web/html/index.html`.
2. Find the `connect-src` directive in the `<meta http-equiv="Content-Security-Policy">` tag.
3. Append the new host (e.g. `https://vision.googleapis.com`).
4. Add the host to `AuthorizedEndpoints.md`.

## 4. Register the operation

Add the operation's name to the `"Cloud"` category in `src/core/config/Categories.json`. Then regenerate the config and lint:

```bash
npx grunt configTests
npm run lint
```

## 5. Tests

**Offline tests.** These need no network. Create `tests/operations/tests/GCloud<Name>.mjs` and import it in `tests/operations/index.mjs`. Test behaviour that does not call the API, such as empty input or the error raised when there is no `Authenticate Google Cloud` operation. See `tests/operations/tests/GoogleTranslate.mjs`. Run with `npm test`.

**End-to-end tests (Nightwatch).** The PKCE OAuth popup is protected by reCAPTCHA, so it **cannot be automated**. E2E tests authenticate with an API key or PAT from `.env` (see `LocalTesting.md`):

- `browserUtils.getTestAPIKey()` reads `CYBERCHEF_GCP_TEST_API_KEY`.
- `browserUtils.getTestPAT()` reads `CYBERCHEF_GCP_TEST_TOKEN`, or falls back to `gcloud auth print-access-token`.

Create `tests/browser/GCloud<Name>.js`, using `tests/browser/GCloudGeocode.js` as the template. Tests must `return` early when credentials are missing, so that CI passes. Read the output with:

```javascript
browser.execute(function () {
    return window.app.manager.output.outputEditorView.state.doc.toString();
}, [], function ({ value }) {
    browser.assert.ok(value.includes("expected"), `Got: ${value}`);
});
```

Run the test while `npm run start` is running:

```bash
npx nightwatch tests/browser/GCloud<Name>.js
```

Finally, check the operation by hand with **OAuth 2.0 (Web Application: PKCE)** selected in `Authenticate Google Cloud`.
