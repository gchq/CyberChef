/**
 * TestRunner.js
 *
 * This is for actually running the tests in the test register.
 *
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

document.addEventListener("DOMContentLoaded", function() {
    TestRegister.runTests()
    .then(function(results) {
        results.forEach(function(testResult) {

            if (typeof window.callPhantom === "function") {
                // If we're running this in PhantomJS
                window.callPhantom(
                    "testResult",
                    testResult
                );
            } else {
                // If we're just viewing this in a normal browser
                var output = [
                    "----------",
                    testResult.test.name,
                    testResult.status,
                    testResult.output,
                ].join("<br>");
                document.querySelector("main").innerHTML += output;
            }
        });

        if (typeof window.callPhantom === "function") {
            window.callPhantom("exit");
        }
    });
});
