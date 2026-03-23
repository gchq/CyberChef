/**
 * Tests that CyberChef can be consumed as both CJS and ESM modules.
 * Replaces Grunt exec:setupNodeConsumers, testCJSNodeConsumer, testESMNodeConsumer, teardownNodeConsumers.
 *
 * @author CyberChef Modernization
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import { execSync } from "child_process";
import { mkdirSync, cpSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const testPath = join(homedir(), "tmp-cyberchef");
const nodeFlags = "--no-warnings --no-deprecation";

try {
    console.log("\n--- Testing node consumers ---");

    // Setup
    execSync("npm link", { stdio: "inherit" });
    mkdirSync(testPath, { recursive: true });

    // Copy consumer test files
    const consumersDir = "tests/node/consumers";
    cpSync(consumersDir, testPath, { recursive: true });

    // Link cyberchef in the test directory
    execSync("npm link cyberchef", { cwd: testPath, stdio: "inherit" });

    // Test CJS consumer
    console.log("Testing CJS consumer...");
    execSync(`node ${nodeFlags} cjs-consumer.js`, { cwd: testPath, stdio: "pipe" });
    console.log("CJS consumer test passed.");

    // Test ESM consumer
    console.log("Testing ESM consumer...");
    execSync(`node ${nodeFlags} esm-consumer.mjs`, { cwd: testPath, stdio: "pipe" });
    console.log("ESM consumer test passed.");

    console.log("\n--- Node consumer tests complete ---");
} catch (e) {
    console.error("Node consumer test failed:", e.message);
    process.exitCode = 1;
} finally {
    // Teardown
    if (existsSync(testPath)) {
        rmSync(testPath, { recursive: true, force: true });
    }
}
