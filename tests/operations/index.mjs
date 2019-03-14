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

import {
    setLongTestFailure,
    logTestReport,
} from "../lib/utils";

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

import TestRegister from "../lib/TestRegister";
import "./tests/BCD";
import "./tests/BSON";
import "./tests/Base58";
import "./tests/Base64";
import "./tests/Base62";
import "./tests/BitwiseOp";
import "./tests/ByteRepr";
import "./tests/CartesianProduct";
import "./tests/CharEnc";
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
import "./tests/Jump";
import "./tests/JSONBeautify";
import "./tests/JSONMinify";
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

// Cannot test operations that use the File type yet
//import "./tests/SplitColourChannels";

// import "./tests/nodeApi/nodeApi";
// import "./tests/nodeApi/ops";

const testStatus = {
    allTestsPassing: true,
    counts: {
        total: 0,
    }
};

setLongTestFailure();

const logOpsTestReport = logTestReport.bind(null, testStatus);

TestRegister.runTests()
    .then(logOpsTestReport);

