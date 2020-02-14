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

import {
    setLongTestFailure,
    logTestReport,
} from "../lib/utils.mjs";

import TestRegister from "../lib/TestRegister.mjs";
import "./tests/BCD.mjs";
import "./tests/BSON.mjs";
import "./tests/BaconCipher.mjs";
import "./tests/Base58.mjs";
import "./tests/Base64.mjs";
import "./tests/Base62.mjs";
import "./tests/BitwiseOp.mjs";
import "./tests/ByteRepr.mjs";
import "./tests/CartesianProduct.mjs";
import "./tests/CharEnc.mjs";
import "./tests/ChangeIPFormat.mjs";
import "./tests/Charts.mjs";
import "./tests/Checksum.mjs";
import "./tests/Ciphers.mjs";
import "./tests/Code.mjs";
import "./tests/Comment.mjs";
import "./tests/Compress.mjs";
import "./tests/ConditionalJump.mjs";
import "./tests/Crypt.mjs";
import "./tests/CSV.mjs";
import "./tests/DateTime.mjs";
import "./tests/ExtractEmailAddresses.mjs";
import "./tests/Fork.mjs";
import "./tests/FromDecimal.mjs";
import "./tests/Gzip.mjs";
import "./tests/Gunzip.mjs";
import "./tests/Hash.mjs";
import "./tests/HaversineDistance.mjs";
import "./tests/Hexdump.mjs";
import "./tests/Image.mjs";
import "./tests/IndexOfCoincidence.mjs";
import "./tests/Jump.mjs";
import "./tests/JSONBeautify.mjs";
import "./tests/JSONMinify.mjs";
import "./tests/JSONtoCSV.mjs";
import "./tests/JWTDecode.mjs";
import "./tests/JWTSign.mjs";
import "./tests/JWTVerify.mjs";
import "./tests/MS.mjs";
import "./tests/Magic.mjs";
import "./tests/MorseCode.mjs";
import "./tests/NetBIOS.mjs";
import "./tests/NormaliseUnicode.mjs";
import "./tests/OTP.mjs";
import "./tests/PGP.mjs";
import "./tests/PHP.mjs";
import "./tests/ParseIPRange.mjs";
import "./tests/ParseQRCode.mjs";
import "./tests/PowerSet.mjs";
import "./tests/Regex.mjs";
import "./tests/Register.mjs";
import "./tests/RemoveDiacritics.mjs";
import "./tests/Rotate.mjs";
import "./tests/SeqUtils.mjs";
import "./tests/SetDifference.mjs";
import "./tests/SetIntersection.mjs";
import "./tests/SetUnion.mjs";
import "./tests/StrUtils.mjs";
import "./tests/SymmetricDifference.mjs";
import "./tests/TextEncodingBruteForce.mjs";
import "./tests/TranslateDateTimeFormat.mjs";
import "./tests/Magic.mjs";
import "./tests/ParseTLV.mjs";
import "./tests/Media.mjs";
import "./tests/ToFromInsensitiveRegex.mjs";
import "./tests/YARA.mjs";
import "./tests/ConvertCoordinateFormat.mjs";
import "./tests/Enigma.mjs";
import "./tests/Bombe.mjs";
import "./tests/MultipleBombe.mjs";
import "./tests/Typex.mjs";
import "./tests/BLAKE2b.mjs";
import "./tests/BLAKE2s.mjs";
import "./tests/Protobuf.mjs";
import "./tests/ParseSSHHostKey.mjs";
import "./tests/DefangIP.mjs";
import "./tests/ParseUDP.mjs";
import "./tests/AvroToJSON.mjs";
import "./tests/Lorenz.mjs";
import "./tests/CipherSaber2";


// Cannot test operations that use the File type yet
// import "./tests/SplitColourChannels.mjs";

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
