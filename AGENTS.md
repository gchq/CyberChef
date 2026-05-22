# Repo Working Notes

## Test And Debugging Baseline

- Use Docker/Linux for installs, builds, and tests by default.
- Treat the CI environment as the source of truth:
  - Ubuntu/Linux
  - Node 24
  - `npm ci`
  - `npm test`
- **Before committing any JS/MJS change, run the full lint suite in Docker:**
  ```
  npx grunt eslint
  ```
  This runs all five targets: `eslint:configs`, `eslint:core`, `eslint:web`, `eslint:node`, `eslint:tests`. Running only `eslint:core` misses errors in test files and other targets. Do not push without a clean lint run.
- Dev server with auto-rebuild: `npm start` (port 8080). Production build: `npm run build` (output in `build/prod/`). If the production build OOMs, set `NODE_OPTIONS=--max_old_space_size=2048`.
- **Do not run `npm run build` or `npm start` on Windows.** The local Node version is not guaranteed to match CI and webpack builds will silently fail or produce wrong output. Build verification belongs in Docker/Linux CI only.
- Do not spend time fixing Windows-only runtime or dependency issues unless explicitly requested.
- Do not commit repo changes whose only purpose is to make local Windows execution work.
- If a failure appears only in the local Windows shell, do not treat it as a code regression until it reproduces in Docker/Linux.
- When Docker is unavailable, restore Docker availability first rather than switching to Windows-specific debugging.

## Session Start

- At the start of a session, sync with `origin/master` before doing substantive work.
- Preferred command: `git pull --rebase origin master`
- Only do this automatically when the worktree is clean.
- If there are local changes already present, do not pull/rebase blindly; inspect first and avoid overwriting user work.

## Code Style

Follow `CONTRIBUTING.md` coding conventions: 4-space indentation, CamelCase class identifiers, camelCase function/variable names, UNDERSCORE_UPPER_CASE constants, UTF-8 source encoding, UNIX line endings, all files end with a newline.

## Commit Scope

- Keep commits small and reviewable by default.
- Prefer one commit per individual recipe change when that is practical.
- Otherwise group a commit around one coherent class of change, not multiple unrelated fixes or refactors.
- Split work before committing when a reviewer would benefit from evaluating the pieces independently.
- Only keep changes together when separating them would make the behavior harder to understand, test, or revert.
- Prefer squash or amend for related consecutive changes — if a follow-up commit only fixes or extends the immediately preceding commit, squash them into one rather than leaving a trail of iterative noise in the log.
- When CI flags a lint or test failure after a push, fix it locally and **amend or squash into the failing commit** (using `git push --force-with-lease`) rather than adding a new fix commit on top. A chain of "Fix lint" commits is the failure mode this rule prevents.

## APC Cross-Reference (Standing Instruction)

Whenever a payment cryptography question arises — algorithm behavior, key types, format support, operation design, test vector validation — **first query the APC-agent MCP tools** to check what AWS Payment Cryptography exposes for that operation. Use ToolSearch to load the relevant tool before calling it.

If the data is not available via APC-agent (endpoint doesn't exist, key-mode constraint, API gap), **treat that as a documented gap** — file a GitHub issue at `J8k3/CyberChef` capturing the operation, what was tried, and what's needed to close it. Do not guess APC behavior from training data; use the live tools.

**Knowledge contribution (reciprocal):** When this session surfaces new payment domain knowledge — a PCI rule, an algorithm edge case, an APC API constraint, an HSM command mapping — write it back into the MCP server in the same session: `payment-knowledge-base.md` for domain facts, `hsm_analysis.py` for HSM commands, `compliance.py` for enforcement rules. Do not defer. The two repos are a knowledge loop: CyberChef proves behavior in tests; the MCP server codifies it for LLM consumption.

This check is for internal development and validation only. APC must never appear in CyberChef UI text (operation names, descriptions, inline help, arg labels).

## Security Constraint

**Never mention AWS, APC, or AWS Payment Cryptography in any CyberChef UI-facing text.** This includes operation names, descriptions, arg labels, inline help text, and output strings. Internal code comments and test file comments are fine.

## ESLint

- Continuation lines inside `args: [` must be aligned to **23 spaces**
- All module-level functions require JSDoc (`jsdoc/require-jsdoc`). Constructors must have their own JSDoc — either `/** @inheritdoc */` or a named comment block. The class-level JSDoc does not satisfy this.
- No unused imports
- No inline single-line blocks: `try { x; } catch` or `if (x) { y; }` — statement and closing brace must each be on their own line (`brace-style` rule)
- Ternary `?` and `:` must be at the **end** of the line, not the start (`operator-linebreak` rule). Write `condition ?\n    a :\n    b` not `condition\n    ? a\n    : b`.

## Payment Operation Maintenance

After completing any substantive payment operation work, ask: *"Did I learn anything in this session that isn't captured in AGENTS.md?"* If yes, add it before committing.

**Before committing any new or changed payment operation, verify all of the following are in the same commit:**
- `PAYMENT_RECIPES.md` updated (numbered section + lettered chaining entry if new pattern)
- APC-agent queried for the relevant endpoint and any gap documented
- Tests passing

Do not commit the operation first and defer docs or APC check to a follow-up. If the user has to ask whether the docs were updated, the process was not followed.

When adding, renaming, or removing a payment operation:

1. **Update `PAYMENT_RECIPES.md`** — add the operation to the correct numbered section and, if it introduces a new chaining pattern, add a lettered chaining pattern entry. Remove or mark deprecated any operations that are replaced.
2. **Follow the naming convention** — all payment operation display names use Title Case. Acronyms (DUKPT, AES, EMV, MAC, PAN, TR-31, TR-34, KCV) stay upper-case. Brand names keep their canonical form (`payShield`). Pattern: `[Domain Prefix] [Verb] [Qualifier]` — the domain/protocol prefix comes first so operations sort and scan by topic in the UI list. Example: `EMV Verify MAC`, `DUKPT Derive TDES Key`, `PIN Block Parse`. When a vendor name is a sub-specifier of a PIN method, embed it after the PIN domain prefix: `PIN IBM 3624 Offset Generate`, `PIN IBM 3624 Verify`. See the Naming Convention section in `PAYMENT_RECIPES.md`.
3. **Only operations written for this fork belong in the Payments category** — do not add upstream CyberChef ops (AES Encrypt, HMAC, CMAC, Triple DES Encrypt, AES Key Wrap, etc.) even as convenience shortcuts. If an op wasn't authored here, it stays in its own upstream category only.
4. **Keep `this.name` and file name consistent** — the CyberChef UI shows `this.name`; the file name is the class name in PascalCase. Both should reflect the same intent.
5. **Do not rename `this.name` without updating `PAYMENT_RECIPES.md`** — stale names in the doc are confusing and break recipe search.
6. **Review and update `this.description`, `this.inlineHelp`, and `this.testDataSamples`** whenever changing a recipe — operation descriptions, inline help text, and sample args must stay consistent with the current arg list and behavior. A renamed arg, added arg, or changed default silently breaks the tooltip if the description still references the old shape.
7. **Regenerate the build config after any add, rename, or delete** — three files are gitignored and auto-generated; editing `this.name` or `Categories.json` alone is not enough:
   - `src/core/operations/index.mjs` — full op list; built by `generateOpsIndex.mjs`
   - `src/core/config/modules/Payment.mjs` — maps `this.name` → constructor for the Payment module chunk; built by `generateConfig.mjs`
   - `src/core/config/OperationConfig.json` — op metadata for the UI
   Run from the project root after any op change:
   ```
   node src/core/config/scripts/generateOpsIndex.mjs && node src/core/config/scripts/generateConfig.mjs
   ```
   Or `npx grunt dev` / `npx grunt prod`, which runs both steps automatically. CI runs them on every build. **Symptom of a stale registry:** `TypeError: f[e.module][e.name] is not a constructor` at runtime.
   **Grunt alias:** if using grunt tasks directly, the correct task is `npx grunt exec:generateConfig`. `npx grunt exec:generateNodeIndex` is a *different* task — it only regenerates the Node API wrapper (`src/node/index.mjs`) and does NOT update `OperationConfig.json` or `modules/Payment.mjs`.

