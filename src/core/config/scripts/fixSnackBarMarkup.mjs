/**
 * This script updates snackbarjs package
 * Replaces self-closing div with standard opening div
 *
 * before:
 * <div id=snackbar-container/>
 * after:
 * <div id=snackbar-container>
 *
 */

/* eslint no-console: ["off"] */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Base directory of snackbarjs source
const filePath = join(process.cwd(), "node_modules/snackbarjs/src/snackbar.js");

const content = readFileSync(filePath, "utf8");

// Replace self-closing div with standard opening div
const updated = content.replace(
    /<div id=snackbar-container\/>/g,
    "<div id=snackbar-container>"
);

writeFileSync(filePath, updated, "utf8");
