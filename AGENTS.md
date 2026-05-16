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

## Current Project Preference

- For this fork, validate payment-related changes through the Docker-based workflow before judging safety to commit.
- When Docker is unavailable, fix Docker availability first rather than switching to Windows-specific debugging.
