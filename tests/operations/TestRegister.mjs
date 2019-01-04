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
import Chef from "../../src/core/Chef";

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
    runTests () {
        return Promise.all(
            this.tests.map(function(test, i) {
                const chef = new Chef();

                return chef.bake(
                    test.input,
                    test.recipeConfig,
                    {},
                    0,
                    false
                ).then(function(result) {
                    const ret = {
                        test: test,
                        status: null,
                        output: null,
                    };

                    if (result.error) {
                        if (test.expectedError) {
                            ret.status = "passing";
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
                        } else if (test.hasOwnProperty("expectedMatch") && test.expectedMatch.test(result.result)) {
                            ret.status = "passing";
                        } else {
                            ret.status = "failing";
                            const expected = test.expectedOutput ? test.expectedOutput :
                                test.expectedMatch ? test.expectedMatch.toString() : "unknown";
                            ret.output = [
                                "Expected",
                                "\t" + expected.replace(/\n/g, "\n\t"),
                                "Received",
                                "\t" + result.result.replace(/\n/g, "\n\t"),
                            ].join("\n");
                        }
                    }

                    return ret;
                });
            })
        );
    }

    /**
     * Run all api related tests and wrap results in report format
     */
    runApiTests() {
        return Promise.all(this.apiTests.map(async function(test, i) {
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
                result.output = e.message;
            }
            return result;
        }));
    }
}

// Export an instance to make a singleton
export default new TestRegister();
