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
- Preferred command:
  - `git pull --rebase origin master`
- Only do this automatically when the worktree is clean.
- If there are local changes already present, do not pull/rebase blindly; inspect first and avoid overwriting user work.

## Commit Scope

- Keep commits small and reviewable by default.
- Prefer one commit per individual recipe change when that is practical.
- Otherwise group a commit around one coherent class of change, not multiple unrelated fixes or refactors.
- Split work before committing when a reviewer would benefit from evaluating the pieces independently.
- Only keep changes together when separating them would make the behavior harder to understand, test, or revert.

## Current Project Preference

- For this fork, validate payment-related changes through the Docker-based workflow before judging safety to commit.
- When Docker is unavailable, fix Docker availability first rather than switching to Windows-specific debugging.
