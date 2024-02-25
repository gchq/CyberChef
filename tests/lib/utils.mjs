/**
 * Utils for test suite
 *
 * @author d98762625@gmail.com
 * @author tlwr [toby@toby.codes]
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

/**
 * Helper function to convert a status to an icon.
 *
 * @param {string} status
 * @returns {string}
 */
function statusToIcon(status) {
    return (
        {
            erroring: "🔥",
            failing: "❌",
            passing: "✔️️"
        }[status] || "?"
    );
}

/**
 * Counts test statuses.
 *
 * @param {Object} testStatus
 * @param {Object} testResult
 */
function handleTestResult(testStatus, testResult) {
    testStatus.allTestsPassing = testStatus.allTestsPassing && testResult.status === "passing";
    testStatus.counts[testResult.status] = (testStatus.counts[testResult.status] || 0) + 1;
    testStatus.counts.total += 1;

    if (testResult.duration > 2000) {
        console.log(`'${testResult.test.name}' took ${(testResult.duration / 1000).toFixed(1)}s to complete`);
    }
}

/**
 * Log each test result, count tests and failures.
 *
 * @param {Object} testStatus - object describing test run data
 * @param {Object[]} results - results from TestRegister
 */
export function logTestReport(testStatus, results) {
    results.forEach((r) => handleTestResult(testStatus, r));

    console.log();
    for (const testStatusCount in testStatus.counts) {
        const count = testStatus.counts[testStatusCount];
        if (count > 0) {
            console.log(testStatusCount.toUpperCase() + "\t" + count);
        }
    }
    console.log();

    // Print error messages for tests that didn't pass
    results
        .filter((res) => res.status !== "passing")
        .forEach((testResult) => {
            console.log([statusToIcon(testResult.status), testResult.test.name].join("  "));

            if (testResult.output) {
                console.log(testResult.output.trim().replace(/^/, "\t").replace(/\n/g, "\n\t"));
            }
        });
    console.log();

    process.exit(testStatus.allTestsPassing ? 0 : 1);
}

/**
 * Fail if the process takes longer than 60 seconds.
 */
export function setLongTestFailure() {
    const timeLimit = 120;
    setTimeout(function () {
        console.log(`Tests took longer than ${timeLimit} seconds to run, returning.`);
        process.exit(1);
    }, timeLimit * 1000);
}
