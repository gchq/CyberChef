# CLAUDE.md

CyberChefCloud is a fork of GCHQ's CyberChef that adds Google Cloud APIs (Translate, Vision, Speech, GCS, Maps, Vertex AI/Gemini, DLP, etc.) as recipe operations ("ingredients"). Everything runs client-side in the browser: operations call Google APIs directly with `fetch()` from a Web Worker. There is no backend, apart from two small Cloud Run proxies (see `infrastructure/`).

## Environment

- **Node 18** (`.nvmrc`, CI). `npm test` fails on Node 24: the test scripts pass `--no-experimental-fetch`, which Node 24 rejects. The flag is needed because argon2-browser's WASM loader breaks when Node's built-in `fetch` is present.
- Development normally happens in **WSL** (Ubuntu). Headless Chromium for Nightwatch needs extra system libraries there; see `docs/LocalTesting.md`. `node_modules` contains platform-specific binaries (e.g. chromedriver), so run `npm install` on whichever OS you test on.

## Commands

| Task | Command |
| :--- | :--- |
| Install | `npm install` (runs postinstall patch tasks) |
| Dev server | `npm run start` → http://localhost:8080 |
| Production build | `npm run build` |
| Lint | `npm run lint` (ESLint via Grunt) |
| Unit/operation tests | `npm test` (regenerates op config first, then runs `tests/node` + `tests/operations`) |
| Browser E2E, one file | `npx nightwatch tests/browser/GCloudGeocode.js` (dev server must be running) |
| Browser E2E, dev target | `npm run testuidev` |
| Scaffold a new op | `npm run newop` (interactive) |

After adding or renaming an operation, the generated config must be rebuilt (`npm test`, `npm run start`, or `npx grunt configTests` all do this). If an op doesn't appear in the UI, this is usually why.

## Layout

- `src/core/operations/*.mjs`: one class per operation. Cloud ops are named `GCloud*.mjs` (plus `GoogleTranslate`, `GoogleHTTPRequest`, `AuthenticateGoogleCloud`, `AIAgent`, `PromptLLM`, `CloudConvert`) and set `this.module = "Cloud"`.
- `src/core/lib/GoogleCloud.mjs`: shared cloud helpers. Use these; don't reimplement them.
  - `gcpFetch(url, {method, params, body, headers})`: auth + query params + JSON + error handling. **Default choice for new ops.**
  - `applyGCPAuth(url, headers)`: low-level auth injection (API key → `?key=`, OAuth/PAT → `Authorization: Bearer` + `x-goog-user-project`). Maps/Places APIs get special handling.
  - `getGcpCredentials()`: `{authType, authString, quotaProject, defaultRegion, apiKey}` set by the `Authenticate Google Cloud` op.
  - `generateGCSDestinationUri`, `writeGCSText`, `writeGCSBytes`: GCS output helpers.
- `src/core/config/Categories.json`: ops must be listed here (in the `"Cloud"` category) to appear in the UI.
- `src/web/html/index.html`: holds the **CSP `connect-src`** allow-list. A new Google endpoint that isn't covered there is blocked by the browser.
- `tests/browser/GCloud*.js`: Nightwatch E2E tests against live APIs, one file per op. Helpers are in `tests/browser/browserUtils.js`.
- `tests/operations/tests/`: offline operation tests, registered in `tests/operations/index.mjs`.
- `infrastructure/google-http-proxy/`: Cloud Run proxy used by `GoogleHTTPRequest`.
- `docs/`: design notes, setup guides and lessons learned (see below).

## Conventions for cloud operations

- **Auth is never an op argument.** Users put `Authenticate Google Cloud` at the top of the recipe; ops read the cached credentials via `gcpFetch`/`applyGCPAuth`. The description should say it requires a prior `Authenticate Google Cloud` operation.
- Throw `OperationError` with a readable message for user-facing failures.
- `toggleString` args arrive as `{option, string}` objects, not strings, so unpack `.string`.
- Long-running operations (Speech, Video Intelligence) submit and then poll `/v1/operations/{id}`. See `pollLongRunningOperation` in `GCloudSpeechToText.mjs`.
- Ops that write outputs to GCS default to the input's directory with a `_ccc_<suffix>` filename suffix (`generateGCSDestinationUri`).
- The `AIAgent` op discovers other operations from the registry automatically, so a new op can be used as an agent tool without being registered anywhere else.
- File header: `@author CyberChefCloud`, `@copyright Crown Copyright 2026`, `@license Apache-2.0`. Every class and method gets a JSDoc comment (ESLint enforces this).

To add a new cloud operation end to end (op, CSP, category, tests), use the **`add-cloud-operation`** skill in `.claude/skills/`.

## Testing notes

- OAuth PKCE (Google Identity Services popup) **cannot be automated** because of reCAPTCHA. E2E tests authenticate with an API key or PAT; the PKCE flow is checked by hand.
- Credentials come from `.env` (gitignored; copy from `.env.template`). `browserUtils.getTestAPIKey()` reads `CYBERCHEF_GCP_TEST_API_KEY`, falling back to the old name `CYBERCHEF_GCP_TEST_KEY`. `getTestPAT()` reads `CYBERCHEF_GCP_TEST_TOKEN` and falls back to `gcloud auth print-access-token`.
- Live tests must **skip gracefully** (`return;`) when credentials are missing, so that CI passes.
- Read output via `window.app.manager.output.outputEditorView.state.doc.toString()` in `browser.execute`. Don't use `browserUtils.expectOutput`, which has given false timeouts on async cloud ops.
- To see the UI state when a test fails, use `browser.saveScreenshot("tests/browser/output/debug.png")` and read the image.
- Check a raw API call with `curl` + `gcloud auth print-access-token` before writing op code.

## Docs index (`docs/`)

- `AddingCloudOperations.md`: original guide for new cloud ops (the skill supersedes it; some paths in it are out of date).
- `AuthorizedEndpoints.md`: list of CSP-allowed endpoints. Keep it in sync with `index.html`.
- `LocalTesting.md`, `how to test with an LLM.md`: dev server, Nightwatch, and agent-specific testing lessons.
- `GoogleCloudSetup.md`, `GCloudGCSSetup.md`: user-facing GCP project, OAuth, bucket, and IAM setup.
- `GCloudAuthenticationArchitecture.md`: why auth works the way it does (quota project header, toggleString).
- `GCloudServiceAccountLessonsLearned.md`: service agents, cross-project GCS access, LRO polling URL format.
- `Troubleshooting.md`: 401/403 IAM problems.
- `*_ResearchReport.md`, `GCS_SpeechToText_*`: background research and past plans.
