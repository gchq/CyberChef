/**
 * TestRegister.js
 *
 * This is so individual files can register their tests in one place, and
 * ensure that they will get run by the frontend.
 *
 * @author tlwr [toby@toby.codes
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 *
 */
(function() {
    /**
     * Add a list of tests to the register.
     *
     * @class
     */
    function TestRegister() {
        this.tests = [];
    }

    /**
     * Add a list of tests to the register.
     *
     * @param {Object[]} tests
     */
    TestRegister.prototype.addTests = function(tests) {
        this.tests = this.tests.concat(tests.map(function(test) {

            test.status = "waiting";
            test.output = "";

            return test;
        }));
    };

    /**
     * Returns the list of tests.
     *
     * @returns {Object[]} tests
     */
    TestRegister.prototype.getTests = function() {
        return this.tests;
    };

    /**
     * Runs all the tests in the register and updates the state of each test.
     *
     */
    TestRegister.prototype.runTests = function() {
        this.tests.forEach(function(test, i) {
            var chef = new Chef();

            // This resolve is to not instantly break when async operations are
            // supported. Marked as TODO.
            Promise.resolve(chef.bake(
                test.input,
                test.recipeConfig,
                {},
                0,
                0
            ))
                .then(function(result) {
                    if (result.error) {
                        if (test.expectedError) {
                            test.status = "passing";
                        } else {
                            test.status = "erroring";
                            test.output = [
                                "Erroring",
                                "-------",
                                result.error.displayStr,
                            ].join("\n");
                        }
                    } else {
                        if (test.expectedError) {
                            test.status = "failing";
                            test.output = [
                                "Failing",
                                "-------",
                                "Expected an error but did not receive one.",
                            ].join("\n");
                        } else if (result.result === test.expectedOutput) {
                            test.status = "passing";
                        } else {
                            test.status = "failing";
                            test.output = [
                                "Failing",
                                "-------",
                                "Expected",
                                "-------",
                                test.expectedOutput,
                                "Actual",
                                "-------",
                                result.result,
                            ].join("\n");
                        }
                    }
                });
        });
    };

    // Singleton TestRegister, keeping things simple and obvious.
    window.TestRegister = new TestRegister();
})();
