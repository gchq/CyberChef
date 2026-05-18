# Repo Working Notes

## Test And Debugging Baseline

- Use Docker/Linux for installs, builds, and tests by default.
- Treat the CI environment as the source of truth:
  - Ubuntu/Linux
  - Node 24
  - `npm ci`
  - `npm test`
- Do not spend time fixing Windows-only runtime or dependency issues unless explicitly requested.
- Do not commit repo changes whose only purpose is to make local Windows execution work.
- If a failure appears only in the local Windows shell, do not treat it as a code regression until it reproduces in Docker/Linux.

## Session Start

- At the start of a session, sync with `origin/master` before doing substantive work.
- Preferred command: `git pull --rebase origin master`
- Only do this automatically when the worktree is clean.
- If there are local changes already present, do not pull/rebase blindly; inspect first and avoid overwriting user work.

## Commit Scope

- Keep commits small and reviewable by default.
- Prefer one commit per individual recipe change when that is practical.
- Otherwise group a commit around one coherent class of change, not multiple unrelated fixes or refactors.
- Split work before committing when a reviewer would benefit from evaluating the pieces independently.
- Only keep changes together when separating them would make the behavior harder to understand, test, or revert.

## Payment Operation Maintenance

When adding, renaming, or removing a payment operation:

1. **Update `PAYMENT_RECIPES.md`** — add the operation to the correct numbered section and, if it introduces a new chaining pattern, add a lettered chaining pattern entry. Remove or mark deprecated any operations that are replaced.
2. **Follow the naming convention** — all payment operation display names use Title Case. Acronyms (DUKPT, AES, EMV, MAC, PAN, TR-31, TR-34, KCV) stay upper-case. Brand names keep their canonical form (`payShield`). Pattern: `[Domain Prefix] [Verb] [Qualifier]` — the domain/protocol prefix comes first so operations sort and scan by topic in the UI list. Example: `EMV Verify MAC`, `DUKPT Derive TDES Key`, `PIN Block Parse`. See the Naming Convention section in `PAYMENT_RECIPES.md`.
5. **Only operations written for this fork belong in the Payments category** — do not add upstream CyberChef ops (AES Encrypt, HMAC, CMAC, Triple DES Encrypt, AES Key Wrap, etc.) even as convenience shortcuts. If an op wasn't authored here, it stays in its own upstream category only.
3. **Keep `this.name` and file name consistent** — the CyberChef UI shows `this.name`; the file name is the class name in PascalCase. Both should reflect the same intent.
4. **Do not rename `this.name` without updating `PAYMENT_RECIPES.md`** — stale names in the doc are confusing and break recipe search.
6. **Regenerate the build config after any add, rename, or delete** — three files are gitignored and auto-generated; editing `this.name` or `Categories.json` alone is not enough:
   - `src/core/operations/index.mjs` — full op list; built by `generateOpsIndex.mjs`
   - `src/core/config/modules/Payment.mjs` — maps `this.name` → constructor for the Payment module chunk; built by `generateConfig.mjs`
   - `src/core/config/OperationConfig.json` — op metadata for the UI
   Run from the project root after any op change:
   ```
   node src/core/config/scripts/generateOpsIndex.mjs && node src/core/config/scripts/generateConfig.mjs
   ```
   Or `npx grunt dev` / `npx grunt prod`, which runs both steps automatically. CI runs them on every build. **Symptom of a stale registry:** `TypeError: f[e.module][e.name] is not a constructor` at runtime.

## Current Project Preference

- For this fork, validate payment-related changes through the Docker-based workflow before judging safety to commit.
- When Docker is unavailable, fix Docker availability first rather than switching to Windows-specific debugging.
