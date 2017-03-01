/* eslint-env node */
/* globals phantom */

/**
 * PhantomRunner.js
 *
 * This file navigates to build/test/index.html and logs the test results.
 *
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

var page = require("webpage").create(),
    allTestsPassing = true,
    testStatusCounts = {
        total: 0,
    };


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
 * Callback function to handle test results.
 */
page.onCallback = function(messageType) {
    if (messageType === "testResult") {
        var testResult = arguments[1];

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
    } else if (messageType === "exit") {

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

        phantom.exit(allTestsPassing ? 0 : 1);
    }
};


/**
 * Open the test webpage in PhantomJS.
 */
page.open("build/test/index.html", function(status) {
    if (status !== "success") {
        console.log("STATUS: ", status);
        phantom.exit(1);
    }
});


/**
 * Fail if the process takes longer than 10 seconds.
 */
setTimeout(function() {
    console.log("Tests took longer than 10 seconds to run, returning.");
    phantom.exit(1);
}, 10 * 1000);
