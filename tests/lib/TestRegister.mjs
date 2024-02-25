/**
 * TestRegister.js
 *
 * This is so individual files can register their tests in one place, and
 * ensure that they will get run by the frontend.
 *
 * @author tlwr [toby@toby.codes]
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import Chef from "../../src/core/Chef.mjs";
import Utils from "../../src/core/Utils.mjs";
import cliProgress from "cli-progress";
import log from "loglevel";

/**
 * Object to store and run the list of tests.
 *
 * @class
 * @constructor
 */
class TestRegister {
    /**
     * initialise with no tests
     */
    constructor() {
        this.tests = [];
        this.apiTests = [];
    }

    /**
     * Add a list of tests to the register.
     *
     * @param {Object[]} tests
     */
    addTests(tests) {
        this.tests = this.tests.concat(tests);
    }

    /**
     * Add a list of api tests to the register
     * @param {Object[]} tests
     */
    addApiTests(tests) {
        this.apiTests = this.apiTests.concat(tests);
    }

    /**
     * Runs all the tests in the register.
     */
    async runTests() {
        // Turn off logging to avoid messy errors
        log.setLevel("silent", false);

        const progBar = new cliProgress.SingleBar(
            {
                format: formatter,
                stopOnComplete: true,
            },
            cliProgress.Presets.shades_classic,
        );
        const testResults = [];

        console.log("Running operation tests...");
        progBar.start(this.tests.length, 0, {
            msg: "Setting up",
        });

        for (const test of this.tests) {
            progBar.update(testResults.length, {
                msg: test.name,
            });

            const chef = new Chef();
            const result = await chef.bake(test.input, test.recipeConfig, {
                returnType: "string",
            });

            const ret = {
                test: test,
                status: null,
                output: null,
                duration: result.duration,
            };

            if (result.error) {
                if (test.expectedError) {
                    if (result.error.displayStr === test.expectedOutput) {
                        ret.status = "passing";
                    } else {
                        ret.status = "failing";
                        ret.output = [
                            "Expected",
                            "\t" + test.expectedOutput.replace(/\n/g, "\n\t"),
                            "Received",
                            "\t" +
                                result.error.displayStr.replace(/\n/g, "\n\t"),
                        ].join("\n");
                    }
                } else {
                    ret.status = "erroring";
                    ret.output = result.error.displayStr;
                }
            } else {
                if (test.expectedError) {
                    ret.status = "failing";
                    ret.output = "Expected an error but did not receive one.";
                } else if (result.result === test.expectedOutput) {
                    ret.status = "passing";
                } else if (
                    "expectedMatch" in test &&
                    test.expectedMatch.test(result.result)
                ) {
                    ret.status = "passing";
                } else if (
                    "unexpectedMatch" in test &&
                    !test.unexpectedMatch.test(result.result)
                ) {
                    ret.status = "passing";
                } else {
                    ret.status = "failing";
                    const expected = test.expectedOutput
                        ? test.expectedOutput
                        : test.expectedMatch
                          ? test.expectedMatch.toString()
                          : test.unexpectedMatch
                              ? "to not find " + test.unexpectedMatch.toString()
                              : "unknown";
                    ret.output = [
                        "Expected",
                        "\t" + expected.replace(/\n/g, "\n\t"),
                        "Received",
                        "\t" + result.result.replace(/\n/g, "\n\t"),
                    ].join("\n");
                }
            }

            testResults.push(ret);
            progBar.increment();
        }

        // Turn logging back on
        log.setLevel("info", false);

        return testResults;
    }

    /**
     * Run all api related tests and wrap results in report format
     */
    async runApiTests() {
        const progBar = new cliProgress.SingleBar(
            {
                format: formatter,
                stopOnComplete: true,
            },
            cliProgress.Presets.shades_classic,
        );
        const testResults = [];

        console.log("Running Node API tests...");
        progBar.start(this.apiTests.length, 0, {
            msg: "Setting up",
        });

        global.TESTING = true;
        for (const test of this.apiTests) {
            progBar.update(testResults.length, {
                msg: test.name,
            });

            const result = {
                test: test,
                status: null,
                output: null,
            };
            try {
                await test.run();
                result.status = "passing";
            } catch (e) {
                result.status = "erroring";
                result.output = `${e.message}\nError: ${e.stack}`;
            }

            testResults.push(result);
            progBar.increment();
        }

        return testResults;
    }
}

/**
 * Formatter for the progress bar
 *
 * @param {Object} options
 * @param {Object} params
 * @param {Object} payload
 * @returns {string}
 */
function formatter(options, params, payload) {
    const bar =
        options.barCompleteString.substr(
            0,
            Math.round(params.progress * options.barsize),
        ) +
        options.barIncompleteString.substr(
            0,
            Math.round((1 - params.progress) * options.barsize),
        );

    const percentage = Math.floor(params.progress * 100),
        duration = Math.floor((Date.now() - params.startTime) / 1000);

    let testName = payload.msg ? payload.msg : "";
    if (params.value >= params.total) testName = "Tests completed";
    testName = Utils.truncate(testName, 25).padEnd(25, " ");

    return `${testName} ${bar} ${params.value}/${params.total} | ${percentage}% | Duration: ${duration}s`;
}

// Export an instance to make a singleton
export default new TestRegister();
