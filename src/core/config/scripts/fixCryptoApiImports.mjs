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
            const content = readFileSync(fullPath, "utf8");

            // Add .mjs to imports if not present
            let updated = content.replace(
                /from "(\.[^"]*)";/g,
                (match, p1) => {
                    if (p1.endsWith(".mjs")) return match;
                    return `from "${p1}.mjs";`;
                }
            );

            // Patch sha512.mjs default rounds and loop step logic
            if (entry.name === "sha512.mjs") {
                updated = updated
                    .replace("options.rounds = options.rounds || 160;", "options.rounds = options.rounds || 80;")
                    .replace("for (let i = 0; i < this.options.rounds; i += 2) {", "for (let i = 0; i < this.options.rounds * 2; i += 2) {")
                    .replace("this.W = new Array(160);", "this.W = new Array(this.options.rounds * 2);")
                    .replace("options.rounds=160", "options.rounds=80")
                    .replace("(Must be greater than 32)", "(Must be greater than 16)");
            }

            if (updated !== content) {
                writeFileSync(fullPath, updated, "utf8");
            }
        }
    }
}

// Run the walker
walk(baseDir);
