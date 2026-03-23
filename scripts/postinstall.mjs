/**
 * Cross-platform postinstall script.
 * Fixes known issues in dependencies without requiring platform-specific `sed`.
 * Replaces Grunt exec:fixCryptoApiImports and exec:fixSnackbarMarkup.
 *
 * @author CyberChef Modernization
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

/**
 * Recursively find all files in a directory.
 */
function findFiles(dir, files = []) {
    try {
        const entries = readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory() && entry.name !== ".git") {
                findFiles(fullPath, files);
            } else if (entry.isFile()) {
                files.push(fullPath);
            }
        }
    } catch {
        // Directory may not exist
    }
    return files;
}

// Fix 1: crypto-api imports - add .mjs extensions to relative imports
console.log("Fixing crypto-api imports...");
const cryptoApiDir = join("node_modules", "crypto-api", "src");
let cryptoApiFixed = 0;

try {
    const files = findFiles(cryptoApiDir);
    for (const file of files) {
        let content = readFileSync(file, "utf8");
        const original = content;

        // Add .mjs extension to relative imports that don't already have it
        content = content.replace(/from\s+"(\.[^"]*?)(?<!\.mjs)";/g, (match, importPath) => {
            // Don't add .mjs if it already has a file extension
            if (extname(importPath) !== "") return match;
            return `from "${importPath}.mjs";`;
        });

        if (content !== original) {
            writeFileSync(file, content);
            cryptoApiFixed++;
        }
    }
    console.log(`  Fixed ${cryptoApiFixed} files in crypto-api.`);
} catch (e) {
    console.log(`  Skipping crypto-api fix (not installed or not found): ${e.message}`);
}

// Fix 2: snackbarjs - fix self-closing div
console.log("Fixing snackbarjs markup...");
const snackbarFile = join("node_modules", "snackbarjs", "src", "snackbar.js");

try {
    let content = readFileSync(snackbarFile, "utf8");
    const original = content;
    content = content.replace(/<div id=snackbar-container\/>/g, "<div id=snackbar-container>");

    if (content !== original) {
        writeFileSync(snackbarFile, content);
        console.log("  Fixed snackbarjs self-closing div.");
    } else {
        console.log("  snackbarjs already fixed or pattern not found.");
    }
} catch (e) {
    console.log(`  Skipping snackbarjs fix (not installed or not found): ${e.message}`);
}

console.log("Postinstall complete.");
