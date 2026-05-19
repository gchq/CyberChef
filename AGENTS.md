# AGENTS.md

Working agreement for AI coding agents in this repo. Task-specific plans (e.g. [plan-buildsystem-agnostic.md](plan-buildsystem-agnostic.md)) own step-by-step changes; this file owns durable conventions that should outlast any single plan.

When a `plan-*.md` file exists in the repo root, treat it as the source of truth for the in-flight task — read it before proposing changes to the same area.

## Project

CyberChef — client-side web app for encoding, encryption, compression, and data analysis. The same operation source ([src/core/operations/](src/core/operations/)) ships as both a browser bundle and a Node consumer package. Build orchestration is Grunt ([Gruntfile.js](Gruntfile.js)); bundling is webpack ([webpack.config.js](webpack.config.js)).

## Toolchain

- Node **24** (`engines: ">=24 <25"` in [package.json](package.json)). Don't reach for features outside that range or assume newer.
- Package manager: npm.
- **No new devDependencies** without explicit approval. Prefer the Node stdlib (`crypto`, `fs`, `os`, `path`, `child_process`, `v8`).

## Common commands

| Task | Command |
| --- | --- |
| Install (runs `postinstall` Grunt fixups) | `npm install` |
| Dev server | `npm start` |
| Production build | `npm run build` |
| Full test suite | `npm test` |
| Node-consumer tests | `npm run testnodeconsumer` |
| UI tests (Nightwatch) | `npm run testui` |
| Lint | `npm run lint` |

## Build-system conventions

- The build must work on **macOS, Linux, and Windows**. Don't introduce Unix-only shell-outs in [Gruntfile.js](Gruntfile.js) or [package.json](package.json) `scripts` — that means no `sed`, `awk`, `xargs`, `wc`, `du`, `egrep`, `sha256sum`/`shasum`, `$(…)` command substitution, single-quoted JS passed to `node -e`, `~` path expansion, or `export FOO=…` in an npm script. Reach for the Node stdlib first; if a shell command is genuinely needed, confirm it works in both `cmd.exe` and POSIX shells.
- Prefer custom Grunt tasks (`grunt.registerTask`) over `grunt-exec` entries when the work is Node code — they're easier to read, easier to test, and platform-neutral.
- One-off helper scripts live in [src/core/config/scripts/](src/core/config/scripts/) as `.mjs` files. Follow the existing pattern in [newMinorVersion.mjs](src/core/config/scripts/newMinorVersion.mjs) (ESM, top-level `execSync` for git ops, no external deps beyond stdlib).

## Coding conventions

From [CONTRIBUTING.md](CONTRIBUTING.md):

- 4-space indentation, LF line endings, UTF-8 without BOM, trailing newline on every file.
- `CamelCase` for namespaces/objects, `camelCase` for functions/variables, `UNDERSCORE_UPPER_CASE` for constants.
- Vanilla JS preferred. Don't add UI frameworks; jQuery is already vendored but should be avoided for new code.
- Operations must be client-side wherever possible (design principle: works on closed networks / offline).

## Repo layout (orientation)

- [src/core/](src/core/) — operations, config, generation scripts (browser-safe; no `fs`/`child_process` here)
- [src/web/](src/web/) — browser UI
- [src/node/](src/node/) — Node consumer entry points
- [tests/](tests/) — `operations/`, `node/`, and UI (`browser/`) test suites

## Workflow

- **Leon authors all git commits and pushes himself.** Stop at "ready to commit" — do not run `git commit`, `git push`, `gh pr create`, or any branch-moving command without an explicit ask. Suggesting a commit message in chat is fine; executing it is not.
- For multi-step changes, write or update a `plan-*.md` in the repo root before editing. Keep step-by-step task detail in the plan, not in this file.
