# Plan: Make the build system platform-agnostic (Windows-capable)

> **Agent: keep this plan up to date.** After Leon executes a stage, update the "Progress" section below — check the box, note the commit SHA (if any) and date, and record any deviations from the plan (e.g. new sub-steps discovered, scope changes, verification surprises). If a stage's approach changes mid-flight, edit the corresponding section in "Changes" so the plan stays the source of truth, not a stale snapshot.

## Progress

Stages are executed by Leon, not the agent. Tick each box once the stage is done and verified.

### Section 1 — [Gruntfile.js](Gruntfile.js)
- [x] 1a. `calcDownloadHash` rewritten as custom Grunt task _(2026-05-19, code written, awaiting commit + verification)_
- [x] 1b. `repoSize` rewritten as custom Grunt task _(2026-05-19)_
- [x] 1c. `nodeConsumerTestPath` switched to `os.tmpdir()` _(2026-05-19)_
- [x] 1d. `setupNodeConsumers` / `teardownNodeConsumers` / `testCJSNodeConsumer` / `testESMNodeConsumer` ported _(2026-05-19)_
- [x] 1e. `generateConfig` / `generateNodeIndex` rewritten as custom Grunt tasks _(2026-05-19)_
- [x] 1f. `chainCommands()` helper deleted _(2026-05-19)_
- [x] 1g. Webpack output path uses `path.join` _(2026-05-19)_

### Section 2 — [package.json](package.json)
- [x] 2a. `setheapsize` deleted _(2026-05-19)_
- [x] 2b. `getheapsize` switched to `getHeapSize.mjs` _(2026-05-19)_
- [x] 2c. `minor` / `tag` switched to `.mjs` orchestrators _(2026-05-19)_

### Verification
- [ ] macOS: 7-step verification pass (see "Verification" section below)
- [ ] Windows: 7-step verification pass (if a Windows machine is available)

### Notes / deviations
_(Agent: log any changes from the original plan here, with date.)_

---

## Context

The build is currently tuned to Linux/macOS. A developer on Windows can clone the repo and `npm install`, but `npm run build`, `npm test`, and `npm run testnodeconsumer` will fail because several [Gruntfile.js](Gruntfile.js) `exec` tasks and three `package.json` scripts shell out to Unix utilities (`sha256sum`/`shasum`, `awk`, `sed`, `wc`, `du`, `egrep`, `xargs`, `mkdir`, `cp`, `rm -rf`, `cd`, `export`, backticks, `$(…)` subshells, single-quoted args). A `chainCommands()` helper at [Gruntfile.js:172-183](Gruntfile.js#L172-L183) hints at Windows awareness but no Windows branch exists for the underlying commands.

**Scope (per user):** Local dev only. Goal: `npm install`, `npm run build`, `npm test`, `npm start`, `npm run testnodeconsumer` all work on Windows in addition to macOS/Linux. CI (`ubuntu-latest`-pinned) and docs are out of scope.

**Approach (per user):** Inline Node.js — rewrite shell-out tasks using `crypto`, `fs`, `os`, `path` from the Node 24 stdlib. No new devDependencies. Eliminates platform branching rather than adding more.

**Things that are already fine and should stay untouched:**
- [.gitattributes](.gitattributes) (`* text=auto eol=lf`)
- [.editorconfig](.editorconfig) (`end_of_line = lf`)
- [webpack.config.js](webpack.config.js) and `webpack-dev-server` (cross-platform)
- App code in [src/web/](src/web/) and [src/node/](src/node/) (browser-safe; no `fs`/`child_process` leaks)
- The `chmod` Grunt task — `grunt-chmod` is a silent no-op on Windows, so it doesn't break anything
- The `browserTests` task (`./node_modules/.bin/nightwatch`) — npm creates a `.cmd` shim on Windows; cmd.exe resolves the path. Leave as-is.

---

## Changes

### 1. [Gruntfile.js](Gruntfile.js) — replace shell-out tasks with Node code

Convert the exec tasks below into **custom Grunt tasks** that run Node code directly. This is cleaner than passing JS-as-a-string through `grunt-exec`, and it deletes all platform branching.

#### 1a. `calcDownloadHash` — [Gruntfile.js:331-346](Gruntfile.js#L331-L346)

Currently branches on `darwin` vs default, both shell-only. Replace with:

```js
grunt.registerTask("calcDownloadHash", "Computes the SHA256 of the standalone zip and stamps it into index.html", function () {
    const crypto = require("crypto");
    const fs = require("fs");
    const zipPath = path.join("build", "prod", `CyberChef_v${pkg.version}.zip`);
    const digestPath = path.join("build", "prod", "sha256digest.txt");
    const indexPath = path.join("build", "prod", "index.html");
    const hash = crypto.createHash("sha256").update(fs.readFileSync(zipPath)).digest("hex");
    fs.writeFileSync(digestPath, hash);
    const html = fs.readFileSync(indexPath, "utf8").replace("DOWNLOAD_HASH_PLACEHOLDER", hash);
    fs.writeFileSync(indexPath, html);
});
```

Then in the `prod` task list at [Gruntfile.js:32](Gruntfile.js#L32), change `"exec:calcDownloadHash"` → `"calcDownloadHash"`. Delete the `calcDownloadHash` entry from the `exec` block.

#### 1b. `repoSize` — [Gruntfile.js:347-353](Gruntfile.js#L347-L353)

Cosmetic info printed by the default `lint` task. Replace with:

```js
grunt.registerTask("repoSize", "Reports tracked file count and repo size", function () {
    const { execSync } = require("child_process");
    const fs = require("fs");
    const fileCount = execSync("git ls-files", { encoding: "utf8" }).trim().split("\n").length;
    let bytes = 0;
    const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (entry.name === ".git" || entry.name === "node_modules") continue;
            const p = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(p);
            else if (entry.isFile()) bytes += fs.statSync(p).size;
        }
    };
    walk(".");
    const mb = (bytes / (1024 * 1024)).toFixed(1);
    grunt.log.writeln(`\n${fileCount}\ttracked files`);
    grunt.log.writeln(`${mb}M\trepository size`);
});
```

Update [Gruntfile.js:57](Gruntfile.js#L57) (`default` task) to call `"repoSize"` instead of `"exec:repoSize"`. Delete the `repoSize` entry from the `exec` block.

#### 1c. `nodeConsumerTestPath` — [Gruntfile.js:100](Gruntfile.js#L100)

Replace `"~/tmp-cyberchef"` with `path.join(os.tmpdir(), "tmp-cyberchef")` (add `const os = require("os");` at the top alongside the existing `path` require). `~` is not expanded on Windows, and `os.tmpdir()` is the right answer on every OS.

#### 1d. `setupNodeConsumers` / `teardownNodeConsumers` / `testCJSNodeConsumer` / `testESMNodeConsumer` — [Gruntfile.js:382-412](Gruntfile.js#L382-L412)

These use `mkdir`, `cp`, `cd`, `rm -rf`. Replace with custom Grunt tasks using Node APIs and grunt-exec's `cwd` option:

```js
grunt.registerTask("setupNodeConsumers", "Sets up a temp dir for testing CJS/ESM consumers", function () {
    const fs = require("fs");
    grunt.log.writeln("\n--- Testing node consumers ---");
    fs.mkdirSync(nodeConsumerTestPath, { recursive: true });
    fs.cpSync("tests/node/consumers", nodeConsumerTestPath, { recursive: true });
    require("child_process").execSync("npm link", { stdio: "inherit" });
    require("child_process").execSync("npm link cyberchef", { stdio: "inherit", cwd: nodeConsumerTestPath });
});

grunt.registerTask("teardownNodeConsumers", "Removes the consumer test temp dir", function () {
    require("fs").rmSync(nodeConsumerTestPath, { recursive: true, force: true });
    grunt.log.writeln("\n--- Node consumer tests complete ---");
});
```

For the CJS/ESM consumer test exec entries at [Gruntfile.js:399-412](Gruntfile.js#L399-L412), drop the `cd …` prefix and pass `cwd: nodeConsumerTestPath` on the exec config object instead:

```js
testCJSNodeConsumer: {
    command: `node ${nodeFlags} cjs-consumer.js`,
    cwd: nodeConsumerTestPath,
    stdout: false,
},
testESMNodeConsumer: {
    command: `node ${nodeFlags} esm-consumer.mjs`,
    cwd: nodeConsumerTestPath,
    stdout: false,
},
```

Update the `testnodeconsumer` registered task at [Gruntfile.js:51-53](Gruntfile.js#L51-L53) to reference the new task names (drop the `exec:` prefix for setup/teardown).

#### 1e. `generateConfig` / `generateNodeIndex` — [Gruntfile.js:361-378](Gruntfile.js#L361-L378)

These chain `echo` (with single-quoted args containing `\n`) and `echo [] > …` redirection — single quotes aren't quotes on Windows cmd.exe, and the `\n` handling in `chainCommands` is a band-aid. Replace each with a custom Grunt task that uses `grunt.log.writeln` for the banners and `fs.writeFileSync` for the empty JSON file, then `execSync`s the `node …` calls:

```js
grunt.registerTask("generateConfig", "Regenerates operation config files", function () {
    const { execSync } = require("child_process");
    const fs = require("fs");
    grunt.log.writeln("\n--- Regenerating config files. ---");
    fs.writeFileSync(path.join("src", "core", "config", "OperationConfig.json"), "[]\n");
    execSync(`node ${nodeFlags} src/core/config/scripts/generateOpsIndex.mjs`, { stdio: "inherit" });
    execSync(`node ${nodeFlags} src/core/config/scripts/generateConfig.mjs`, { stdio: "inherit" });
    grunt.log.writeln("--- Config scripts finished. ---\n");
});

grunt.registerTask("generateNodeIndex", "Regenerates the node index", function () {
    const { execSync } = require("child_process");
    grunt.log.writeln("\n--- Regenerating node index ---");
    execSync(`node ${nodeFlags} src/node/config/scripts/generateNodeIndex.mjs`, { stdio: "inherit" });
    grunt.log.writeln("--- Node index generated. ---\n");
});
```

Update the four task lists at [Gruntfile.js:26](Gruntfile.js#L26), [:31](Gruntfile.js#L31), [:38](Gruntfile.js#L38), [:44](Gruntfile.js#L44) to call `"generateConfig"` / `"generateNodeIndex"` instead of `"exec:generateConfig"` / `"exec:generateNodeIndex"`. Update the `watch:config` block at [:321](Gruntfile.js#L321) likewise. Delete the two exec entries.

#### 1f. `chainCommands()` helper — [Gruntfile.js:172-183](Gruntfile.js#L172-L183)

After 1a–1e it has zero call sites. Delete it.

#### 1g. Webpack output path — [Gruntfile.js:113](Gruntfile.js#L113)

Change `__dirname + "/build/prod"` to `path.join(__dirname, "build", "prod")`. Cosmetic (webpack handles `/` on Windows), but matches the rest of the file once we're touching it.

### 2. [package.json](package.json) — fix the three broken scripts

#### 2a. `setheapsize` — [package.json:211](package.json#L211)

`export NODE_OPTIONS=…` in an npm script sets the variable in a subshell that immediately exits — it does nothing useful on **any** platform. It's also broken on Windows (`export` isn't a cmd.exe builtin). **Recommendation: delete it.** Users who need a larger heap can set `NODE_OPTIONS` in their own shell.

#### 2b. `getheapsize` — [package.json:210](package.json#L210)

Uses `node -e '…single-quoted JS…'`. Windows cmd.exe doesn't strip single quotes, so the JS won't parse. Switch to a `.mjs` file:

- Create [src/core/config/scripts/getHeapSize.mjs](src/core/config/scripts/getHeapSize.mjs):
  ```js
  import v8 from "v8";
  console.log(`node heap limit = ${v8.getHeapStatistics().heap_size_limit / (1024 * 1024)} Mb`);
  ```
- Update the script to `"node --no-warnings src/core/config/scripts/getHeapSize.mjs"`.

#### 2c. `minor` and `tag` — [package.json:208-209](package.json#L208-L209)

Both use `$(npm pkg get version | xargs)` which (a) is a subshell (broken on Windows cmd.exe) and (b) relies on `xargs` to strip the quotes npm wraps the version in.

Cleaner: a tiny helper script that prints the bare version. Create [src/core/config/scripts/printVersion.mjs](src/core/config/scripts/printVersion.mjs):

```js
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const pkg = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..", "package.json"), "utf8"));
process.stdout.write(pkg.version);
```

Then in `package.json`, replace both scripts with versions that capture stdout via `node -p` invocations. **Note:** npm scripts on Windows still can't do shell-style command substitution. The portable rewrite uses `node` as the substitution engine. Both `minor` and `tag` involve interactive `git tag -s` / version bumping, so we can also extract the multi-step flow into a single `.mjs` orchestrator — recommended approach:

- Create [src/core/config/scripts/tagRelease.mjs](src/core/config/scripts/tagRelease.mjs) that reads `package.json`, runs `git tag -s "v${version}" -m "${version}"` via `execSync`, and logs the message. The `minor` script likewise calls `newMinorVersion.mjs`, runs `npm version minor --git-tag-version=false`, then re-reads the version and logs the PR/tag prompt.
- Update `package.json` to `"minor": "node src/core/config/scripts/bumpMinor.mjs"` and `"tag": "node src/core/config/scripts/tagRelease.mjs"`.

This eliminates all shell-substitution syntax from `package.json`.

---

## Files to be modified

- [Gruntfile.js](Gruntfile.js) — bulk of the work (sections 1a–1g)
- [package.json](package.json) — script changes (sections 2a–2c)
- New: [src/core/config/scripts/getHeapSize.mjs](src/core/config/scripts/getHeapSize.mjs)
- New: [src/core/config/scripts/bumpMinor.mjs](src/core/config/scripts/bumpMinor.mjs) and [src/core/config/scripts/tagRelease.mjs](src/core/config/scripts/tagRelease.mjs) (or one combined helper)

## Reused utilities

- Node stdlib `crypto.createHash`, `fs.cpSync`, `fs.rmSync`, `fs.readdirSync({ withFileTypes: true })`, `os.tmpdir()`, `path.join` — no new devDependencies
- Existing `grunt-exec` `cwd` option (already part of grunt-exec, no new dep) for the consumer-test exec tasks
- Existing `grunt.log.writeln` instead of `echo`
- Existing pattern from [src/core/config/scripts/newMinorVersion.mjs:50](src/core/config/scripts/newMinorVersion.mjs#L50) (uses `execSync` for git) — same pattern for new helpers

## Verification

Run on macOS first (current dev machine; quickest feedback loop):

1. `rm -rf build/ node_modules/ && npm install` — confirms `postinstall` still passes
2. `npm test` — full test suite must pass (covers `configTests` → `exec:generateConfig` + `exec:generateNodeIndex`, renamed)
3. `npm run build` — exercises the prod task chain including the rewritten `calcDownloadHash`. Verify [build/prod/sha256digest.txt](build/prod/sha256digest.txt) exists and matches `shasum -a 256 build/prod/CyberChef_v*.zip`, and that [build/prod/index.html](build/prod/index.html) contains the hash (no `DOWNLOAD_HASH_PLACEHOLDER` left).
4. `npx grunt` (default lint task) — should print the `repoSize` output with the same shape as before
5. `npm run testnodeconsumer` — verify a tmp dir is created under `os.tmpdir()`, both consumer scripts succeed, and the tmp dir is cleaned up
6. `npm run getheapsize` — should print `node heap limit = … Mb`
7. `npm start` — confirms dev server still launches (no changes to it, but verifies nothing collateral broke)

Then if a Windows machine is available, run the same 7 steps in PowerShell. If not available, the change is structurally safe because every shell-out has been eliminated; the residual risk is in the small set of `execSync("npm link …")` and `execSync("git ls-files")` calls, both of which are documented cross-platform.
