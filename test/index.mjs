/* eslint no-console: 0 */

/**
 * Test Runner
 *
 * For running the tests in the test register.
 *
 * @author tlwr [toby@toby.codes]
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import "babel-polyfill";

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

import TestRegister from "./TestRegister";
import "./tests/operations/BCD";
import "./tests/operations/BSON";
import "./tests/operations/Base58";
import "./tests/operations/Base64";
import "./tests/operations/BitwiseOp";
import "./tests/operations/ByteRepr";
import "./tests/operations/CartesianProduct";
import "./tests/operations/CharEnc";
import "./tests/operations/Checksum";
import "./tests/operations/Ciphers";
import "./tests/operations/Code";
import "./tests/operations/Comment";
import "./tests/operations/Compress";
import "./tests/operations/ConditionalJump";
import "./tests/operations/Crypt";
import "./tests/operations/DateTime";
import "./tests/operations/ExtractEmailAddresses";
import "./tests/operations/Fork";
import "./tests/operations/FromGeohash.mjs";
import "./tests/operations/Hash";
import "./tests/operations/HaversineDistance";
import "./tests/operations/Hexdump";
import "./tests/operations/Image";
import "./tests/operations/Jump";
import "./tests/operations/JWTDecode";
import "./tests/operations/JWTSign";
import "./tests/operations/JWTVerify";
import "./tests/operations/MS";
import "./tests/operations/Magic";
import "./tests/operations/MorseCode";
import "./tests/operations/NetBIOS";
import "./tests/operations/OTP";
import "./tests/operations/PGP";
import "./tests/operations/PHP";
import "./tests/operations/ParseIPRange";
import "./tests/operations/PowerSet";
import "./tests/operations/Regex";
import "./tests/operations/Register";
import "./tests/operations/Rotate";
import "./tests/operations/SeqUtils";
import "./tests/operations/SetDifference";
import "./tests/operations/SetIntersection";
import "./tests/operations/SetUnion";
import "./tests/operations/StrUtils";
import "./tests/operations/SymmetricDifference";
import "./tests/operations/ToGeohash.mjs";
import "./tests/operations/TranslateDateTimeFormat";
import "./tests/operations/Magic";

let allTestsPassing = true;
const testStatusCounts = {
    total: 0,
};


/**
 * Helper function to convert a status to an icon.
 *
 * @param {string} status
 * @returns {string}
 */
function statusToIcon(status) {
    const icons = {
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
    const newCount = (testStatusCounts[testResult.status] || 0) + 1;
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


/**
 * Fail if the process takes longer than 10 seconds.
 */
setTimeout(function() {
    console.log("Tests took longer than 10 seconds to run, returning.");
    process.exit(1);
}, 10 * 1000);


TestRegister.runTests()
    .then(function(results) {
        results.forEach(handleTestResult);

        console.log("\n");

        for (const testStatus in testStatusCounts) {
            const count = testStatusCounts[testStatus];
            if (count > 0) {
                console.log(testStatus.toUpperCase(), count);
            }
        }

        if (!allTestsPassing) {
            console.log("\nNot all tests are passing");
        }

        process.exit(allTestsPassing ? 0 : 1);
    });
