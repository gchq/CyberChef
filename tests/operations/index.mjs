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

import { setLongTestFailure, logTestReport } from "../lib/utils.mjs";

import TestRegister from "../lib/TestRegister.mjs";
import "./tests/AESKeyWrap.mjs";
import "./tests/AESKeyWrapWithPadding.mjs";
import "./tests/AlternatingCaps.mjs";
import "./tests/AvroToJSON.mjs";
import "./tests/BaconCipher.mjs";
import "./tests/Base32.mjs";
import "./tests/Base45.mjs";
import "./tests/Base58.mjs";
import "./tests/Base62.mjs";
import "./tests/Base64.mjs";
import "./tests/Base85.mjs";
import "./tests/Base92.mjs";
import "./tests/BCD.mjs";
import "./tests/Bech32.mjs";
import "./tests/BitwiseOp.mjs";
import "./tests/BLAKE2b.mjs";
import "./tests/BLAKE2s.mjs";
import "./tests/BLAKE3.mjs";
import "./tests/Bombe.mjs";
import "./tests/BSON.mjs";
import "./tests/ByteRepr.mjs";
import "./tests/CaesarBoxCipher.mjs";
import "./tests/CaretMdecode.mjs";
import "./tests/CartesianProduct.mjs";
import "./tests/CBORDecode.mjs";
import "./tests/CBOREncode.mjs";
import "./tests/CetaceanCipherDecode.mjs";
import "./tests/CetaceanCipherEncode.mjs";
import "./tests/ChaCha.mjs";
import "./tests/ChangeIPFormat.mjs";
import "./tests/CharEnc.mjs";
import "./tests/Charts.mjs";
import "./tests/Ciphers.mjs";
import "./tests/CipherSaber2.mjs";
import "./tests/CMAC.mjs";
import "./tests/Code.mjs";
import "./tests/Colossus.mjs";
import "./tests/Comment.mjs";
import "./tests/Compress.mjs";
import "./tests/ConditionalJump.mjs";
import "./tests/ConvertCoordinateFormat.mjs";
import "./tests/ConvertLeetSpeak.mjs";
import "./tests/ConvertToNATOAlphabet.mjs";
import "./tests/CRCChecksum.mjs";
import "./tests/Crypt.mjs";
import "./tests/CSV.mjs";
import "./tests/DateTime.mjs";
import "./tests/DefangIP.mjs";
import "./tests/DropNthBytes.mjs";
import "./tests/ECDSA.mjs";
import "./tests/ELFInfo.mjs";
import "./tests/Enigma.mjs";
import "./tests/ExtractEmailAddresses.mjs";
import "./tests/ExtractHashes.mjs";
import "./tests/ExtractIPAddresses.mjs";
import "./tests/Float.mjs";
import "./tests/FileTree.mjs";
import "./tests/FletcherChecksum.mjs";
import "./tests/Fork.mjs";
import "./tests/FromDecimal.mjs";
import "./tests/GenerateAllChecksums.mjs";
import "./tests/GenerateAllHashes.mjs";
import "./tests/GenerateDeBruijnSequence.mjs";
import "./tests/GenerateQRCode.mjs";
import "./tests/GetAllCasings.mjs";
import "./tests/GOST.mjs";
import "./tests/Gunzip.mjs";
import "./tests/Gzip.mjs";
import "./tests/Hash.mjs";
import "./tests/HASSH.mjs";
import "./tests/HaversineDistance.mjs";
import "./tests/Hex.mjs";
import "./tests/Hexdump.mjs";
import "./tests/HKDF.mjs";
import "./tests/Image.mjs";
import "./tests/IndexOfCoincidence.mjs";
import "./tests/JA3Fingerprint.mjs";
import "./tests/JA4.mjs";
import "./tests/JA3SFingerprint.mjs";
import "./tests/Jsonata.mjs";
import "./tests/JSONBeautify.mjs";
import "./tests/JSONMinify.mjs";
import "./tests/JSONtoCSV.mjs";
import "./tests/Jump.mjs";
import "./tests/JWK.mjs";
import "./tests/JWTDecode.mjs";
import "./tests/JWTSign.mjs";
import "./tests/JWTVerify.mjs";
import "./tests/LevenshteinDistance.mjs";
import "./tests/Lorenz.mjs";
import "./tests/LS47.mjs";
import "./tests/LuhnChecksum.mjs";
import "./tests/LZNT1Decompress.mjs";
import "./tests/LZString.mjs";
import "./tests/Magic.mjs";
import "./tests/Media.mjs";
import "./tests/MIMEDecoding.mjs";
import "./tests/Modhex.mjs";
import "./tests/MorseCode.mjs";
import "./tests/MS.mjs";
import "./tests/MultipleBombe.mjs";
import "./tests/MurmurHash3.mjs";
import "./tests/NetBIOS.mjs";
import "./tests/NormaliseUnicode.mjs";
import "./tests/NTLM.mjs";
import "./tests/OTP.mjs";
import "./tests/ParseIPRange.mjs";
import "./tests/ParseObjectIDTimestamp.mjs";
import "./tests/ParseQRCode.mjs";
import "./tests/ParseSSHHostKey.mjs";
import "./tests/ParseTCP.mjs";
import "./tests/ParseTLSRecord.mjs";
import "./tests/ParseTLV.mjs";
import "./tests/ParseUDP.mjs";
import "./tests/PEMtoHex.mjs";
import "./tests/PGP.mjs";
import "./tests/PHP.mjs";
import "./tests/PHPSerialize.mjs";
import "./tests/PowerSet.mjs";
import "./tests/Protobuf.mjs";
import "./tests/PubKeyFromCert.mjs";
import "./tests/PubKeyFromPrivKey.mjs";
import "./tests/Rabbit.mjs";
import "./tests/RAKE.mjs";
import "./tests/Regex.mjs";
import "./tests/Register.mjs";
import "./tests/RisonEncodeDecode.mjs";
import "./tests/Rotate.mjs";
import "./tests/RSA.mjs";
import "./tests/Salsa20.mjs";
import "./tests/XSalsa20.mjs";
import "./tests/SeqUtils.mjs";
import "./tests/SetDifference.mjs";
import "./tests/SetIntersection.mjs";
import "./tests/SetUnion.mjs";
import "./tests/Shuffle.mjs";
import "./tests/SIGABA.mjs";
import "./tests/SM2.mjs";
import "./tests/SM4.mjs";
// import "./tests/SplitColourChannels.mjs"; // Cannot test operations that use the File type yet
import "./tests/StrUtils.mjs";
import "./tests/StripIPv4Header.mjs";
import "./tests/StripTCPHeader.mjs";
import "./tests/StripUDPHeader.mjs";
import "./tests/Subsection.mjs";
import "./tests/SwapCase.mjs";
import "./tests/SymmetricDifference.mjs";
import "./tests/TakeNthBytes.mjs";
import "./tests/Template.mjs";
import "./tests/TextEncodingBruteForce.mjs";
import "./tests/ToFromInsensitiveRegex.mjs";
import "./tests/TranslateDateTimeFormat.mjs";
import "./tests/Typex.mjs";
import "./tests/UnescapeString.mjs";
import "./tests/Unicode.mjs";
import "./tests/URLEncodeDecode.mjs";
import "./tests/RSA.mjs";
import "./tests/CBOREncode.mjs";
import "./tests/CBORDecode.mjs";
import "./tests/JA3Fingerprint.mjs";
import "./tests/JA3SFingerprint.mjs";
import "./tests/HASSH.mjs";
import "./tests/JSONtoYAML.mjs";

// Cannot test operations that use the File type yet
// import "./tests/SplitColourChannels.mjs";
import "./tests/YARA.mjs";
import "./tests/ParseCSR.mjs";
import "./tests/XXTEA.mjs";

const testStatus = {
    allTestsPassing: true,
    counts: {
        total: 0,
    },
};

setLongTestFailure();

const logOpsTestReport = logTestReport.bind(null, testStatus);

(async function () {
    const results = await TestRegister.runTests();
    logOpsTestReport(results);
})();
