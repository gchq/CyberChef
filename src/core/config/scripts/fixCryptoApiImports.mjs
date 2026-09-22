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
            const updated = content.replace(
                /from "(\.[^"]*)";/g,
                (match, p1) => {
                    if (p1.endsWith(".mjs")) return match;
                    return `from "${p1}.mjs";`;
                }
            );

            if (updated !== content) {
                writeFileSync(fullPath, updated, "utf8");
            }
        }
    }
}

// Run the walker
walk(baseDir);
