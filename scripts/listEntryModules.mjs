/**
 * Lists all generated module entry points for Webpack/Rspack.
 * Replaces the Grunt findModules task.
 *
 * @author CyberChef Modernization
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import { readdirSync } from "fs";
import { basename, resolve } from "path";

/**
 * Generates an entry list for all the modules.
 * @returns {Object} Entry point mapping
 */
export function listEntryModules() {
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
        // Modules directory may not exist yet during initial config generation
        console.warn("Warning: Could not read modules directory:", e.message);
    }

    return entryModules;
}

// When run directly, print the module list
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("listEntryModules.mjs")) {
    const modules = listEntryModules();
    console.log(`Found ${Object.keys(modules).length} modules:`);
    for (const [name, path] of Object.entries(modules)) {
        console.log(`  ${name}: ${path}`);
    }
}
