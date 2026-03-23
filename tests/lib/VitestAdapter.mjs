/**
 * Vitest adapter for CyberChef's TestRegister format.
 * Allows existing test files using TestRegister.addTests() to work with Vitest
 * without modifying every test file.
 *
 * Usage in test files:
 *   import TestRegister from "../../lib/TestRegister.mjs";
 *   TestRegister.addTests([{ name, input, expectedOutput, recipeConfig }]);
 *
 * Then in a .test.mjs file:
 *   import { runRegisteredTests } from "../../lib/VitestAdapter.mjs";
 *   import "./tests/Base64.mjs"; // registers tests
 *   runRegisteredTests();
 *
 * @author CyberChef Modernization
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import { describe, it, expect } from "vitest";
import Chef from "../../src/core/Chef.mjs";
import TestRegister from "./TestRegister.mjs";

/**
 * Run all tests registered via TestRegister.addTests() as Vitest tests.
 *
 * @param {string} [suiteName="CyberChef Operations"] - Name for the test suite
 */
export function runRegisteredTests(suiteName = "CyberChef Operations") {
    describe(suiteName, () => {
        const tests = TestRegister.tests;

        for (const test of tests) {
            it(test.name, async () => {
                const chef = new Chef();
                const result = await chef.bake(
                    test.input,
                    test.recipeConfig,
                    { returnType: "string" }
                );

                if (test.expectedError) {
                    expect(result.error).toBeTruthy();
                    if (test.expectedOutput) {
                        expect(result.error.displayStr).toBe(test.expectedOutput);
                    }
                } else if (result.error) {
                    throw new Error(`Unexpected error: ${result.error.displayStr}`);
                } else if ("expectedMatch" in test) {
                    expect(result.result).toMatch(test.expectedMatch);
                } else if ("unexpectedMatch" in test) {
                    expect(result.result).not.toMatch(test.unexpectedMatch);
                } else {
                    expect(result.result).toBe(test.expectedOutput);
                }
            });
        }
    });
}

/**
 * Run all API tests registered via TestRegister.addApiTests() as Vitest tests.
 *
 * @param {string} [suiteName="CyberChef Node API"] - Name for the test suite
 */
export function runRegisteredApiTests(suiteName = "CyberChef Node API") {
    describe(suiteName, () => {
        const tests = TestRegister.apiTests;

        for (const test of tests) {
            it(test.name, async () => {
                await test.run();
            });
        }
    });
}
