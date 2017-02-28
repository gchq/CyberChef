/**
 * TestRegister.js
 *
 * This is so individual files can register their tests in one place, and
 * ensure that they will get run by the frontend.
 *
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

(function() {
    /**
     * Object to store and run the list of tests.
     *
     * @class
     * @constructor
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
        this.tests = this.tests.concat(tests);
    };


    /**
     * Runs all the tests in the register.
     */
    TestRegister.prototype.runTests = function() {
        return Promise.all(
            this.tests.map(function(test, i) {
                var chef = new Chef();

                return Promise.resolve(chef.bake(
                    test.input,
                    test.recipeConfig,
                    {},
                    0,
                    false
                ))
                .then(function(result) {
                    var ret = {
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
                        } else {
                            ret.status = "failing";
                            ret.output = [
                                "Expected",
                                "\t" + test.expectedOutput.replace(/\n/g, "\n\t"),
                                "Received",
                                "\t" + result.result.replace(/\n/g, "\n\t"),
                            ].join("\n");
                        }
                    }

                    return ret;
                });
            })
        );
    };


    // Singleton TestRegister, keeping things simple and obvious.
    window.TestRegister = new TestRegister();
})();
