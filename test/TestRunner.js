/**
 * TestRunner.js
 *
 * For running the tests in the test register.
 *
 * @author tlwr [toby@toby.codes]
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
var TestRegister = require("./TestRegister.js"),
    allTestsPassing = true,
    testStatusCounts = {
        total: 0,
    };

/**
 * Requires and returns all modules that match.
 *
 * @param {Object} requireContext
 * @returns {Object[]}
 */
function requireAll(requireContext) {
    return requireContext.keys().map(requireContext);
}

// Import all tests
requireAll(require.context("./tests", true, /.+\.js$/));


/**
 * Helper function to convert a status to an icon.
 *
 * @param {string} status
 * @returns {string}
 */
function statusToIcon(status) {
    var icons = {
        erroring: "🔥",
        failing: "❌",
        passing: "✔️️",
    };
    return icons[status] || "?";
}


/**
 * Displays a given test result in the console.
 *
 * @param {Object} testResult
 */
function handleTestResult(testResult) {
    allTestsPassing = allTestsPassing && testResult.status === "passing";
    var newCount = (testStatusCounts[testResult.status] || 0) + 1;
    testStatusCounts[testResult.status] = newCount;
    testStatusCounts.total += 1;

    console.log([
        statusToIcon(testResult.status),
        testResult.test.name
    ].join(" "));

    if (testResult.output) {
        console.log(
            testResult.output
                .trim()
                .replace(/^/, "\t")
                .replace(/\n/g, "\n\t")
        );
    }
}


TestRegister.runTests()
    .then(function(results) {
        results.forEach(handleTestResult);

        console.log("\n");

        for (var testStatus in testStatusCounts) {
            var count = testStatusCounts[testStatus];
            if (count > 0) {
                console.log(testStatus.toUpperCase(), count);
            }
        }

        if (!allTestsPassing) {
            console.log("\nNot all tests are passing");
        }

        process.exit(allTestsPassing ? 0 : 1);
    });
