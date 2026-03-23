/**
 * Watches for changes in operations and regenerates config files.
 * Replaces Grunt watch:config task.
 * Uses Node.js --watch-path flag for file watching.
 *
 * @author CyberChef Modernization
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import { execSync } from "child_process";
import { watch } from "fs";
import { join } from "path";

const opsDir = "src/core/operations";
let debounceTimer = null;

function regenerateConfig() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        console.log("\n--- Regenerating config files ---");
        try {
            execSync("node --no-warnings --no-deprecation src/node/config/scripts/generateNodeIndex.mjs", { stdio: "inherit" });
            execSync("node --no-warnings --no-deprecation src/core/config/scripts/generateOpsIndex.mjs", { stdio: "inherit" });
            execSync("node --no-warnings --no-deprecation src/core/config/scripts/generateConfig.mjs", { stdio: "inherit" });
            console.log("--- Config regenerated ---\n");
        } catch (e) {
            console.error("Config generation failed:", e.message);
        }
    }, 500);
}

console.log(`Watching ${opsDir} for changes...`);

watch(opsDir, { recursive: true }, (eventType, filename) => {
    if (filename && filename !== "index.mjs") {
        console.log(`Change detected: ${filename}`);
        regenerateConfig();
    }
});

// Keep process alive
process.on("SIGINT", () => process.exit(0));
