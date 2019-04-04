/**
 * Utils for test suite
 *
 * @author d98762625@gmail.com
 * @author tlwr [toby@toby.codes]
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

// Define global environment functions
global.ENVIRONMENT_IS_WORKER = function() {
    return typeof importScripts === "function";
};
global.ENVIRONMENT_IS_NODE = function() {
    return typeof process === "object" && typeof require === "function";
};
global.ENVIRONMENT_IS_WEB = function() {
    return typeof window === "object";
};

/**
 * Helper function to convert a status to an icon.
 *
 * @param {string} status
 * @returns {string}
 */
const statusToIcon = function statusToIcon(status) {
    const icons = {
        erroring: "🔥",
        failing: "❌",
        passing: "✔️️",
    };
    return icons[status] || "?";
};


/**
 * Displays a given test result in the console.
 * Counts test statuses.
 *
 * @param {Object} testStatusCounts
 * @param {Object} testResult
 */
function handleTestResult(testStatus, testResult) {
    testStatus.allTestsPassing = testStatus.allTestsPassing && testResult.status === "passing";
    const newCount = (testStatus.counts[testResult.status] || 0) + 1;
    testStatus.counts[testResult.status] = newCount;
    testStatus.counts.total += 1;
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

/**
 * Log each test result, count tests and failures. Log test suite run duration.
 *
 * @param {Object} testStatus - object describing test run data
 * @param {Object[]} results - results from TestRegister
 */
export function logTestReport(testStatus, results) {
    results.forEach(r => handleTestResult(testStatus, r));
    console.log("\n");

    for (const testStatusCount in testStatus.counts) {
        const count = testStatus.counts[testStatusCount];
        if (count > 0) {
            console.log(testStatusCount.toUpperCase(), count);
        }
    }

    process.exit(testStatus.allTestsPassing ? 0 : 1);
}

/**
 * Fail if the process takes longer than 60 seconds.
 */
export function setLongTestFailure() {
    setTimeout(function() {
        console.log("Tests took longer than 60 seconds to run, returning.");
        process.exit(1);
    }, 60 * 1000);
}

