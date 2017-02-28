/**
 * TestRunner.js
 *
 * This is for actually running the tests in the test register.
 *
 * @author tlwr [toby@toby.codes
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 *
 */
(function() {
    document.addEventListener("DOMContentLoaded", function() {
        TestRegister.runTests()
        .then(function(results) {
            results.forEach(function(testResult) {
                if (typeof window.callPhantom === "function") {
                    window.callPhantom(
                        "testResult",
                        testResult
                    );
                } else {
                    var output = [
                        "----------",
                        testResult.test.name,
                        testResult.status,
                        testResult.output,
                    ].join("<br>");
                    document.body.innerHTML += "<div>" + output + "</div>";
                }
            });

            if (typeof window.callPhantom === "function") {
                window.callPhantom("exit");
            }
        });
    });
})();
