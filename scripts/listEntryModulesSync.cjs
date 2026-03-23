/**
 * Lists all generated module entry points for Webpack/Rspack (CommonJS version).
 * Used by webpack config files which must be CommonJS.
 *
 * @author CyberChef Modernization
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

const { readdirSync } = require("fs");
const { basename, resolve } = require("path");

function listEntryModules() {
    const entryModules = {};
    const modulesDir = "./src/core/config/modules";

    try {
        const files = readdirSync(modulesDir).filter(f => f.endsWith(".mjs"));
        for (const file of files) {
            if (file !== "Default.mjs" && file !== "OpModules.mjs") {
                const name = basename(file, ".mjs");
                entryModules["modules/" + name] = resolve(modulesDir, file);
            }
        }
    } catch (e) {
        console.warn("Warning: Could not read modules directory:", e.message);
    }

    return entryModules;
}

module.exports = { listEntryModules };
