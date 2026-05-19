/**
 * Orchestrates a minor version bump: regenerates the CHANGELOG via
 * newMinorVersion.mjs, runs `npm version minor` (without a git tag),
 * then prints a follow-up message that includes the new version.
 *
 * Replaces the previous shell-substitution npm script so it works on
 * Windows cmd.exe as well as POSIX shells.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

/* eslint no-console: ["off"] */

import { execSync } from "child_process";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const pkgPath = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..", "package.json");

execSync("node src/core/config/scripts/newMinorVersion.mjs", { stdio: "inherit" });
execSync("npm version minor --git-tag-version=false", { stdio: "inherit" });

const version = JSON.parse(readFileSync(pkgPath, "utf8")).version;
console.log(`Updated to version v${version}, please create a pull request and once merged use 'npm run tag'`);
