/**
 * Creates a signed git tag matching the version in package.json,
 * then prints a follow-up message.
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
const version = JSON.parse(readFileSync(pkgPath, "utf8")).version;

execSync(`git tag -s "v${version}" -m "${version}"`, { stdio: "inherit" });
console.log(`Created v${version}, now check and push the tag`);
