/**
 * This script updates crypto-api package
 * It adds .mjs to local imports where its missing
 *
 * before:
 * import foo from "./bar";
 * after
 * import foo from "./bar.mjs";
 *
 */

/* eslint no-console: ["off"] */

import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Base directory of crypto-api source
const baseDir = join(process.cwd(), "node_modules/crypto-api/src");

/**
 * Recursively walk a directory, updating import statements
 * to include ".mjs" if missing
 */
function walk(dir) {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.name === ".git") continue;

        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
            walk(fullPath);
        } else if (entry.isFile()) {
            let content = readFileSync(fullPath, "utf8");
            const original = content;

            // Add .mjs to imports if not present
            content = content.replace(
                /from "(\.[^"]*)";/g,
                (match, p1) => {
                    if (p1.endsWith(".mjs")) return match;
                    return `from "${p1}.mjs";`;
                }
            );

            // Fix the SHA-512 round counter: the library counts 32-bit
            // message-schedule entries (2 per round), so a SHA-512 run of
            // 80 actual rounds was reported and configured as 160.
            if (entry.name === "sha512.mjs") {
                content = content
                    .replace("options.rounds = options.rounds || 160;", "options.rounds = options.rounds || 80;")
                    .replace("this.W = new Array(160);", "this.W = new Array(this.options.rounds * 2);")
                    .replace("for (let i = 0; i < this.options.rounds; i += 2) {", "for (let i = 0; i < this.options.rounds * 2; i += 2) {")
                    .replace("[options.rounds=160] - Number of rounds (Must be greater than 32)", "[options.rounds=80] - Number of rounds (Must be greater than 16)");
            }

            if (content !== original) {
                writeFileSync(fullPath, content, "utf8");
            }
        }
    }
}

// Run the walker
walk(baseDir);
