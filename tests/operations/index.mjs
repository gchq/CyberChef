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
import "./tests/BCD";
import "./tests/BSON";
import "./tests/Base58";
import "./tests/Base64";
import "./tests/Base62";
import "./tests/BitwiseOp";
import "./tests/ByteRepr";
import "./tests/CartesianProduct";
import "./tests/CharEnc";
import "./tests/Charts";
import "./tests/Checksum";
import "./tests/Ciphers";
import "./tests/Code";
import "./tests/Comment";
import "./tests/Compress";
import "./tests/ConditionalJump";
import "./tests/Crypt";
import "./tests/CSV";
import "./tests/DateTime";
import "./tests/ExtractEmailAddresses";
import "./tests/Fork";
import "./tests/FromDecimal";
import "./tests/Hash";
import "./tests/HaversineDistance";
import "./tests/Hexdump";
import "./tests/Image";
import "./tests/IndexOfCoincidence";
import "./tests/Jump";
import "./tests/JSONBeautify";
import "./tests/JSONMinify";
import "./tests/JSONtoCSV";
import "./tests/JWTDecode";
import "./tests/JWTSign";
import "./tests/JWTVerify";
import "./tests/MS";
import "./tests/Magic";
import "./tests/MorseCode";
import "./tests/NetBIOS";
import "./tests/OTP";
import "./tests/PGP";
import "./tests/PHP";
import "./tests/ParseIPRange";
import "./tests/ParseQRCode";
import "./tests/PowerSet";
import "./tests/Regex";
import "./tests/Register";
import "./tests/RemoveDiacritics";
import "./tests/Rotate";
import "./tests/SeqUtils";
import "./tests/SetDifference";
import "./tests/SetIntersection";
import "./tests/SetUnion";
import "./tests/StrUtils";
import "./tests/SymmetricDifference";
import "./tests/TextEncodingBruteForce";
import "./tests/TranslateDateTimeFormat";
import "./tests/Magic";
import "./tests/ParseTLV";
import "./tests/Media";
import "./tests/ToFromInsensitiveRegex";
import "./tests/YARA.mjs";
import "./tests/ConvertCoordinateFormat";
import "./tests/Enigma";
import "./tests/Bombe";
import "./tests/MultipleBombe";
import "./tests/Typex";
import "./tests/BLAKE2b";
import "./tests/BLAKE2s";
import "./tests/Protobuf";

// Cannot test operations that use the File type yet
//import "./tests/SplitColourChannels";

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
 * Fail if the process takes longer than 60 seconds.
 */
setTimeout(function() {
    console.log("Tests took longer than 60 seconds to run, returning.");
    process.exit(1);
}, 60 * 1000);


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
            console.log("\nFailing tests:\n");
            results.filter(r => r.status !== "passing").forEach(handleTestResult);
        }

        process.exit(allTestsPassing ? 0 : 1);
    });
