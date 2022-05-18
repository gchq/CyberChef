/**
 * Tests for operations to ensure they output something sensible where expected
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

module.exports = {
    before: browser => {
        browser
            .resizeWindow(1280, 800)
            .url(browser.launchUrl)
            .useCss()
            .waitForElementNotPresent("#preloader", 10000)
            .click("#auto-bake-label");
    },

    "Sanity check operations": async browser => {
        const Images = await import("../samples/Images.mjs");
        testOp(browser, "A1Z26 Cipher Decode", "20 5 19 20 15 21 20 16 21 20", "testoutput");
        testOp(browser, "A1Z26 Cipher Encode", "test input", "20 5 19 20 9 14 16 21 20");
        testOp(browser, "ADD", "test input", "Ê»ÉÊv¿ÄÆËÊ", [{ "option": "Hex", "string": "56" }]);
        testOp(browser, "AES Decrypt", "b443f7f7c16ac5396a34273f6f639caa", "test output", [{ "option": "Hex", "string": "00112233445566778899aabbccddeeff" }, { "option": "Hex", "string": "00000000000000000000000000000000" }, "CBC", "Hex", "Raw", { "option": "Hex", "string": "" }]);
        testOp(browser, "AES Encrypt", "test input", "e42eb8fbfb7a98fff061cd2c1a794d92", [{"option": "Hex", "string": "00112233445566778899aabbccddeeff"}, {"option": "Hex", "string": "00000000000000000000000000000000"}, "CBC", "Raw", "Hex"]);
        testOp(browser, "AND", "test input", "4$04  $044", [{ "option": "Hex", "string": "34" }]);
        testOp(browser, "Add line numbers", "test input", "1 test input");
        testOp(browser, ["From Hex", "Add Text To Image", "To Base64"], Images.PNG_HEX, Images.PNG_CHEF_B64, [[], ["Chef", "Center", "Middle", 0, 0, 16], []]);
        testOp(browser, "Adler-32 Checksum", "test input", "16160411");
        testOp(browser, "Affine Cipher Decode", "test input", "rcqr glnsr", [1, 2]);
        testOp(browser, "Affine Cipher Encode", "test input", "njln rbfpn", [2, 1]);
        testOp(browser, "Analyse hash", "0123456789abcdef", /CRC-64/);
        testOp(browser, "Atbash Cipher", "test input", "gvhg rmkfg");
        // testOp(browser, "Avro to JSON", "test input", "test_output");
        // testOp(browser, "BLAKE2b", "test input", "test_output");
        // testOp(browser, "BLAKE2s", "test input", "test_output");
        // testOp(browser, "BSON deserialise", "test input", "test_output");
        // testOp(browser, "BSON serialise", "test input", "test_output");
        // testOp(browser, "Bacon Cipher Decode", "test input", "test_output");
        // testOp(browser, "Bacon Cipher Encode", "test input", "test_output");
        // testOp(browser, "Bcrypt", "test input", "test_output");
        // testOp(browser, "Bcrypt compare", "test input", "test_output");
        // testOp(browser, "Bcrypt parse", "test input", "test_output");
        // testOp(browser, "Bifid Cipher Decode", "test input", "test_output");
        // testOp(browser, "Bifid Cipher Encode", "test input", "test_output");
        // testOp(browser, "Bit shift left", "test input", "test_output");
        // testOp(browser, "Bit shift right", "test input", "test_output");
        testOp(browser, "Blowfish Decrypt", "10884e15427dd84ec35204e9c8e921ae", "test_output", [{"option": "Hex", "string": "1234567801234567"}, {"option": "Hex", "string": "0011223344556677"}, "CBC", "Hex", "Raw"]);
        testOp(browser, "Blowfish Encrypt", "test input", "f0fadbd1d90d774f714248cf26b96410", [{"option": "Hex", "string": "1234567801234567"}, {"option": "Hex", "string": "0011223344556677"}, "CBC", "Raw", "Hex"]);
        testOp(browser, ["From Hex", "Blur Image", "To Base64"], Images.PNG_HEX, Images.PNG_BLUR_B64);
        // testOp(browser, "Bombe", "test input", "test_output");
        testOp(browser, ["Bzip2 Compress", "To Hex"], "test input", "42 5a 68 39 31 41 59 26 53 59 cf 96 82 1d 00 00 03 91 80 40 00 02 21 4e 00 20 00 21 90 c2 10 c0 88 33 92 8e df 17 72 45 38 50 90 cf 96 82 1d");
        testOp(browser, ["From Hex", "Bzip2 Decompress"], "425a68393141592653597b0884b7000003038000008200ce00200021a647a4218013709517c5dc914e14241ec2212dc0", "test_output", [[], [true]]);
        // testOp(browser, "CRC-16 Checksum", "test input", "test_output");
        // testOp(browser, "CRC-32 Checksum", "test input", "test_output");
        // testOp(browser, "CRC-8 Checksum", "test input", "test_output");
        // testOp(browser, "CSS Beautify", "test input", "test_output");
        // testOp(browser, "CSS Minify", "test input", "test_output");
        // testOp(browser, "CSS selector", "test input", "test_output");
        // testOp(browser, "CSV to JSON", "test input", "test_output");
        // testOp(browser, "CTPH", "test input", "test_output");
        // testOp(browser, "Cartesian Product", "test input", "test_output");
        // testOp(browser, "Change IP format", "test input", "test_output");
        // testOp(browser, "Chi Square", "test input", "test_output");
        // testOp(browser, "CipherSaber2 Decrypt", "test input", "test_output");
        // testOp(browser, "CipherSaber2 Encrypt", "test input", "test_output");
        // testOp(browser, "Citrix CTX1 Decode", "test input", "test_output");
        // testOp(browser, "Citrix CTX1 Encode", "test input", "test_output");
        // testOp(browser, "Colossus", "test input", "test_output");
        // testOp(browser, "Comment", "test input", "test_output");
        // testOp(browser, "Compare CTPH hashes", "test input", "test_output");
        // testOp(browser, "Compare SSDEEP hashes", "test input", "test_output");
        // /testOp(browser, "Conditional Jump", "test input", "test_output");
        // testOp(browser, "Contain Image", "test input", "test_output");
        // testOp(browser, "Convert area", "test input", "test_output");
        // /testOp(browser, "Convert co-ordinate format", "test input", "test_output");
        // testOp(browser, "Convert data units", "test input", "test_output");
        // testOp(browser, "Convert distance", "test input", "test_output");
        // testOp(browser, "Convert Image Format", "test input", "test_output");
        // testOp(browser, "Convert mass", "test input", "test_output");
        // testOp(browser, "Convert speed", "test input", "test_output");
        // testOp(browser, "Convert to NATO alphabet", "test input", "test_output");
        // testOp(browser, "Count occurrences", "test input", "test_output");
        // testOp(browser, "Cover Image", "test input", "test_output");
        // testOp(browser, "Crop Image", "test input", "test_output");
        // testOp(browser, "DES Decrypt", "test input", "test_output");
        // testOp(browser, "DES Encrypt", "test input", "test_output");
        // testOp(browser, "DNS over HTTPS", "test input", "test_output");
        // testOp(browser, "Dechunk HTTP response", "test input", "test_output");
        // testOp(browser, "Decode NetBIOS Name", "test input", "test_output");
        // testOp(browser, "Decode text", "test input", "test_output");
        // testOp(browser, "Defang IP Addresses", "test input", "test_output");
        // testOp(browser, "Defang URL", "test input", "test_output");
        // testOp(browser, "Derive EVP key", "test input", "test_output");
        // testOp(browser, "Derive PBKDF2 key", "test input", "test_output");
        // testOp(browser, "Detect File Type", "test input", "test_output");
        // testOp(browser, "Diff", "test input", "test_output");
        // testOp(browser, "Disassemble x86", "test input", "test_output");
        // testOp(browser, "Dither Image", "test input", "test_output");
        // testOp(browser, "Divide", "test input", "test_output");
        // testOp(browser, "Drop bytes", "test input", "test_output");
        // testOp(browser, "Encode NetBIOS Name", "test input", "test_output");
        // testOp(browser, "Encode text", "test input", "test_output");
        // testOp(browser, "Enigma", "test input", "test_output");
        // testOp(browser, "Entropy", "test input", "test_output");
        // testOp(browser, "Escape string", "test input", "test_output");
        // testOp(browser, "Escape Unicode Characters", "test input", "test_output");
        // testOp(browser, "Expand alphabet range", "test input", "test_output");
        // testOp(browser, "Extract dates", "test input", "test_output");
        // testOp(browser, "Extract domains", "test input", "test_output");
        // testOp(browser, "Extract EXIF", "test input", "test_output");
        // testOp(browser, "Extract email addresses", "test input", "test_output");
        // testOp(browser, "Extract file paths", "test input", "test_output");
        // testOp(browser, "Extract Files", "test input", "test_output");
        // testOp(browser, "Extract IP addresses", "test input", "test_output");
        // testOp(browser, "Extract LSB", "test input", "test_output");
        // testOp(browser, "Extract MAC addresses", "test input", "test_output");
        // testOp(browser, "Extract RGBA", "test input", "test_output");
        // testOp(browser, "Extract URLs", "test input", "test_output");
        // testOp(browser, "Filter", "test input", "test_output");
        // testOp(browser, "Find / Replace", "test input", "test_output");
        // testOp(browser, "Fletcher-16 Checksum", "test input", "test_output");
        // testOp(browser, "Fletcher-32 Checksum", "test input", "test_output");
        // testOp(browser, "Fletcher-64 Checksum", "test input", "test_output");
        // testOp(browser, "Fletcher-8 Checksum", "test input", "test_output");
        // testOp(browser, "Flip Image", "test input", "test_output");
        // testOp(browser, "Fork", "test input", "test_output");
        // testOp(browser, "Format MAC addresses", "test input", "test_output");
        // testOp(browser, "Frequency distribution", "test input", "test_output");
        // testOp(browser, "From BCD", "test input", "test_output");
        // testOp(browser, "From Base", "test input", "test_output");
        // testOp(browser, "From Base32", "test input", "test_output");
        // testOp(browser, "From Base58", "test input", "test_output");
        // testOp(browser, "From Base62", "test input", "test_output");
        // testOp(browser, "From Base64", "test input", "test_output");
        // testOp(browser, "From Base85", "test input", "test_output");
        // testOp(browser, "From Binary", "test input", "test_output");
        // testOp(browser, "From Braille", "test input", "test_output");
        // testOp(browser, "From Case Insensitive Regex", "test input", "test_output");
        // testOp(browser, "From Charcode", "test input", "test_output");
        // testOp(browser, "From Decimal", "test input", "test_output");
        // testOp(browser, "From HTML Entity", "test input", "test_output");
        // testOp(browser, "From Hex", "test input", "test_output");
        // testOp(browser, "From Hex Content", "test input", "test_output");
        // testOp(browser, "From Hexdump", "test input", "test_output");
        // testOp(browser, "From MessagePack", "test input", "test_output");
        // testOp(browser, "From Morse Code", "test input", "test_output");
        // testOp(browser, "From Octal", "test input", "test_output");
        // testOp(browser, "From Punycode", "test input", "test_output");
        // testOp(browser, "From Quoted Printable", "test input", "test_output");
        // testOp(browser, "From UNIX Timestamp", "test input", "test_output");
        // testOp(browser, "GOST hash", "test input", "test_output");
        // testOp(browser, "Generate all hashes", "test input", "test_output");
        // testOp(browser, "Generate HOTP", "test input", "test_output");
        // testOp(browser, "Generate Image", "test input", "test_output");
        // testOp(browser, "Generate Lorem Ipsum", "test input", "test_output");
        // testOp(browser, "Generate PGP Key Pair", "test input", "test_output");
        // testOp(browser, "Generate QR Code", "test input", "test_output");
        // testOp(browser, "Generate TOTP", "test input", "test_output");
        // testOp(browser, "Generate UUID", "test input", "test_output");
        // testOp(browser, "Generic Code Beautify", "test input", "test_output");
        // testOp(browser, "Group IP addresses", "test input", "test_output");
        // testOp(browser, "Gunzip", "test input", "test_output");
        // testOp(browser, "Gzip", "test input", "test_output");
        // testOp(browser, "HAS-160", "test input", "test_output");
        // testOp(browser, "HMAC", "test input", "test_output");
        // testOp(browser, "HTML To Text", "test input", "test_output");
        // testOp(browser, "HTTP request", "test input", "test_output");
        // testOp(browser, "Hamming Distance", "test input", "test_output");
        // testOp(browser, "Haversine distance", "test input", "test_output");
        // testOp(browser, "Head", "test input", "test_output");
        // testOp(browser, "Heatmap chart", "test input", "test_output");
        // testOp(browser, "Hex Density chart", "test input", "test_output");
        // testOp(browser, "Hex to Object Identifier", "test input", "test_output");
        // testOp(browser, "Hex to PEM", "test input", "test_output");
        // testOp(browser, "Image Brightness / Contrast", "test input", "test_output");
        // testOp(browser, "Image Filter", "test input", "test_output");
        // testOp(browser, "Image Hue/Saturation/Lightness", "test input", "test_output");
        // testOp(browser, "Image Opacity", "test input", "test_output");
        // testOp(browser, "Index of Coincidence", "test input", "test_output");
        // testOp(browser, "Invert Image", "test input", "test_output");
        // testOp(browser, "JPath expression", "test input", "test_output");
        // testOp(browser, "JSON Beautify", "test input", "test_output");
        // testOp(browser, "JSON Minify", "test input", "test_output");
        // testOp(browser, "JSON to CSV", "test input", "test_output");
        // testOp(browser, "JWT Decode", "test input", "test_output");
        // testOp(browser, "JWT Sign", "test input", "test_output");
        // testOp(browser, "JWT Verify", "test input", "test_output");
        // testOp(browser, "JavaScript Beautify", "test input", "test_output");
        // testOp(browser, "JavaScript Minify", "test input", "test_output");
        // testOp(browser, "JavaScript Parser", "test input", "test_output");
        // testOp(browser, "Jump", "test input", "test_output");
        // testOp(browser, "Keccak", "test input", "test_output");
        // testOp(browser, "Label", "test input", "test_output");
        // testOp(browser, "Lorenz", "test input", "test_output");
        // testOp(browser, "Luhn Checksum", "test input", "test_output");
        // testOp(browser, "MD2", "test input", "test_output");
        // testOp(browser, "MD4", "test input", "test_output");
        // testOp(browser, "MD5", "test input", "test_output");
        // testOp(browser, "MD6", "test input", "test_output");
        testOpHtml(browser, "Magic", "dGVzdF9vdXRwdXQ=", "tr:nth-of-type(1) th:nth-of-type(2)", "Result snippet");
        testOpHtml(browser, "Magic", "dGVzdF9vdXRwdXQ=", "tr:nth-of-type(2) td:nth-of-type(2)", "test_output");
        testOpHtml(browser, "Magic", "dGVzdF9vdXRwdXQ=", "tr:nth-of-type(2) td:nth-of-type(1)", /Base64/);
        // testOp(browser, "Mean", "test input", "test_output");
        // testOp(browser, "Median", "test input", "test_output");`
        // testOp(browser, "Merge", "test input", "test_output");`
        // testOp(browser, "Microsoft Script Decoder", "test input", "test_output");
        // testOp(browser, "Multiple Bombe", "test input", "test_output");
        // testOp(browser, "Multiply", "test input", "test_output");
        // testOp(browser, "NOT", "test input", "test_output");
        // testOp(browser, "Normalise Image", "test input", "test_output");
        // testOp(browser, "Normalise Unicode", "test input", "test_output");
        // testOp(browser, "Numberwang", "test input", "test_output");
        // testOp(browser, "OR", "test input", "test_output");
        // testOp(browser, "Object Identifier to Hex", "test input", "test_output");
        // testOp(browser, "Offset checker", "test input", "test_output");
        // testOp(browser, "Optical Character Recognition", "test input", "test_output");
        // testOp(browser, "PEM to Hex", "test input", "test_output");
        // testOp(browser, "PGP Decrypt", "test input", "test_output");
        // testOp(browser, "PGP Decrypt and Verify", "test input", "test_output");
        // testOp(browser, "PGP Encrypt", "test input", "test_output");
        // testOp(browser, "PGP Encrypt and Sign", "test input", "test_output");
        // testOp(browser, "PGP Verify", "test input", "test_output");
        // testOp(browser, "PHP Deserialize", "test input", "test_output");
        // testOp(browser, "Pad lines", "test input", "test_output");
        // testOp(browser, "Parse ASN.1 hex string", "test input", "test_output");
        // testOp(browser, "Parse colour code", "test input", "test_output");
        // testOp(browser, "Parse DateTime", "test input", "test_output");
        // testOp(browser, "Parse IP range", "test input", "test_output");
        // testOp(browser, "Parse IPv4 header", "test input", "test_output");
        // testOp(browser, "Parse IPv6 address", "test input", "test_output");
        // testOp(browser, "Parse ObjectID timestamp", "test input", "test_output");
        // testOp(browser, "Parse QR Code", "test input", "test_output");
        // testOp(browser, "Parse SSH Host Key", "test input", "test_output");
        // testOp(browser, "Parse TLV", "test input", "test_output");
        // testOp(browser, "Parse UDP", "test input", "test_output");
        // testOp(browser, "Parse UNIX file permissions", "test input", "test_output");
        // testOp(browser, "Parse URI", "test input", "test_output");
        // testOp(browser, "Parse User Agent", "test input", "test_output");
        // testOp(browser, "Parse X.509 certificate", "test input", "test_output");
        // testOp(browser, "Play Media", "test input", "test_output");
        // testOp(browser, "Power Set", "test input", "test_output");
        // testOp(browser, "Protobuf Decode", "test input", "test_output");
        // testOp(browser, "Pseudo-Random Number Generator", "test input", "test_output");
        // testOp(browser, "RC2 Decrypt", "test input", "test_output");
        // testOp(browser, "RC2 Encrypt", "test input", "test_output");
        // testOp(browser, "RC4", "test input", "test_output");
        // testOp(browser, "RC4 Drop", "test input", "test_output");
        // testOp(browser, "RIPEMD", "test input", "test_output");
        // testOp(browser, "ROT13", "test input", "test_output");
        // testOp(browser, "ROT47", "test input", "test_output");
        // testOp(browser, "Rail Fence Cipher Decode", "test input", "test_output");
        // testOp(browser, "Rail Fence Cipher Encode", "test input", "test_output");
        // testOp(browser, "Randomize Colour Palette", "test input", "test_output");
        // testOp(browser, "Raw Deflate", "test input", "test_output");
        // testOp(browser, "Raw Inflate", "test input", "test_output");
        // testOp(browser, "Register", "test input", "test_output");
        // testOp(browser, "Regular expression", "test input", "test_output");
        // testOp(browser, "Remove Diacritics", "test input", "test_output");
        // testOp(browser, "Remove EXIF", "test input", "test_output");
        // testOp(browser, "Remove line numbers", "test input", "test_output");
        // testOp(browser, "Remove null bytes", "test input", "test_output");
        // testOp(browser, "Remove whitespace", "test input", "test_output");
        // testOp(browser, "Render Image", "test input", "test_output");
        // testOp(browser, "Render Markdown", "test input", "test_output");
        // testOp(browser, "Resize Image", "test input", "test_output");
        // testOp(browser, "Return", "test input", "test_output");
        // testOp(browser, "Reverse", "test input", "test_output");
        // testOp(browser, "Rotate Image", "test input", "test_output");
        // testOp(browser, "Rotate left", "test input", "test_output");
        // testOp(browser, "Rotate right", "test input", "test_output");
        // testOp(browser, "SHA0", "test input", "test_output");
        // testOp(browser, "SHA1", "test input", "test_output");
        // testOp(browser, "SHA2", "test input", "test_output");
        // testOp(browser, "SHA3", "test input", "test_output");
        // testOp(browser, "SQL Beautify", "test input", "test_output");
        // testOp(browser, "SQL Minify", "test input", "test_output");
        // testOp(browser, "SSDEEP", "test input", "test_output");
        // testOp(browser, "SUB", "test input", "test_output");
        // testOp(browser, "Scan for Embedded Files", "test input", "test_output");
        // testOp(browser, "Scatter chart", "test input", "test_output");
        // testOp(browser, "Scrypt", "test input", "test_output");
        // testOp(browser, "Series chart", "test input", "test_output");
        // testOp(browser, "Set Difference", "test input", "test_output");
        // testOp(browser, "Set Intersection", "test input", "test_output");
        // testOp(browser, "Set Union", "test input", "test_output");
        // testOp(browser, "Shake", "test input", "test_output");
        // testOp(browser, "Sharpen Image", "test input", "test_output");
        // testOp(browser, "Show Base64 offsets", "test input", "test_output");
        // testOp(browser, "Show on map", "test input", "test_output");
        // testOp(browser, "Sleep", "test input", "test_output");
        // testOp(browser, "Snefru", "test input", "test_output");
        // testOp(browser, "Sort", "test input", "test_output");
        // testOp(browser, "Split", "test input", "test_output");
        // testOp(browser, "Split Colour Channels", "test input", "test_output");
        // testOp(browser, "Standard Deviation", "test input", "test_output");
        // testOp(browser, "Streebog", "test input", "test_output");
        // testOp(browser, "Strings", "test input", "test_output");
        // testOp(browser, "Strip HTML tags", "test input", "test_output");
        // testOp(browser, "Strip HTTP headers", "test input", "test_output");
        // testOp(browser, "Subsection", "test input", "test_output");
        // testOp(browser, "Substitute", "test input", "test_output");
        // testOp(browser, "Subtract", "test input", "test_output");
        // testOp(browser, "Sum", "test input", "test_output");
        // testOp(browser, "Swap endianness", "test input", "test_output");
        // testOp(browser, "Symmetric Difference", "test input", "test_output");
        // testOp(browser, "Syntax highlighter", "test input", "test_output");
        // testOp(browser, "TCP/IP Checksum", "test input", "test_output");
        // testOp(browser, "Tail", "test input", "test_output");
        // testOp(browser, "Take bytes", "test input", "test_output");
        // testOp(browser, "Tar", "test input", "test_output");
        // testOp(browser, "Text Encoding Brute Force", "test input", "test_output");
        // testOp(browser, "To BCD", "test input", "test_output");
        // testOp(browser, "To Base", "test input", "test_output");
        // testOp(browser, "To Base32", "test input", "test_output");
        // testOp(browser, "To Base58", "test input", "test_output");
        // testOp(browser, "To Base62", "test input", "test_output");
        // testOp(browser, "To Base64", "test input", "test_output");
        // testOp(browser, "To Base85", "test input", "test_output");
        // testOp(browser, "To Binary", "test input", "test_output");
        // testOp(browser, "To Braille", "test input", "test_output");
        // testOp(browser, "To Camel case", "test input", "test_output");
        // testOp(browser, "To Case Insensitive Regex", "test input", "test_output");
        // testOp(browser, "To Charcode", "test input", "test_output");
        // testOp(browser, "To Decimal", "test input", "test_output");
        // testOp(browser, "To HTML Entity", "test input", "test_output");
        // testOp(browser, "To Hex", "test input", "test_output");
        // testOp(browser, "To Hex Content", "test input", "test_output");
        // testOp(browser, "To Hexdump", "test input", "test_output");
        // testOp(browser, "To Kebab case", "test input", "test_output");
        // testOp(browser, "To Lower case", "test input", "test_output");
        // testOp(browser, "To MessagePack", "test input", "test_output");
        // testOp(browser, "To Morse Code", "test input", "test_output");
        // testOp(browser, "To Octal", "test input", "test_output");
        // testOp(browser, "To Punycode", "test input", "test_output");
        // testOp(browser, "To Quoted Printable", "test input", "test_output");
        // testOp(browser, "To Snake case", "test input", "test_output");
        // testOp(browser, "To Table", "test input", "test_output");
        // testOp(browser, "To UNIX Timestamp", "test input", "test_output");
        // testOp(browser, "To Upper case", "test input", "test_output");
        // testOp(browser, "Translate DateTime Format", "test input", "test_output");
        // testOp(browser, "Triple DES Decrypt", "test input", "test_output");
        // testOp(browser, "Triple DES Encrypt", "test input", "test_output");
        // testOp(browser, "Typex", "test input", "test_output");
        // testOp(browser, "UNIX Timestamp to Windows Filetime", "test input", "test_output");
        // testOp(browser, "URL Decode", "test input", "test_output");
        // testOp(browser, "URL Encode", "test input", "test_output");
        // testOp(browser, "Unescape string", "test input", "test_output");
        // testOp(browser, "Unescape Unicode Characters", "test input", "test_output");
        // testOp(browser, "Unique", "test input", "test_output");
        // testOp(browser, "Untar", "test input", "test_output");
        // testOp(browser, "Unzip", "test input", "test_output");
        // testOp(browser, "VarInt Decode", "test input", "test_output");
        // testOp(browser, "VarInt Encode", "test input", "test_output");
        // testOp(browser, "View Bit Plane", "test input", "test_output");
        // testOp(browser, "Vigenère Decode", "test input", "test_output");
        // testOp(browser, "Vigenère Encode", "test input", "test_output");
        // testOp(browser, "Whirlpool", "test input", "test_output");
        // testOp(browser, "Windows Filetime to UNIX Timestamp", "test input", "test_output");
        // testOp(browser, "XKCD Random Number", "test input", "test_output");
        // testOp(browser, "XML Beautify", "test input", "test_output");
        // testOp(browser, "XML Minify", "test input", "test_output");
        // testOp(browser, "XOR", "test input", "test_output");
        // testOp(browser, "XOR Brute Force", "test input", "test_output");
        // testOp(browser, "XPath expression", "test input", "test_output");
        // testOp(browser, "YARA Rules", "test input", "test_output");
        // testOp(browser, "Zip", "test input", "test_output");
        // testOp(browser, "Zlib Deflate", "test input", "test_output");
        // testOp(browser, "Zlib Inflate", "test input", "test_output");
    },


    after: browser => {
        browser.end();
    }
};

/** @function
 * Clears the current recipe and bakes a new operation.
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string|Array<string>} opName - name of operation to be tested, array for multiple ops
 * @param {string} input - input text for test
 * @param {Array<string>|Array<Array<string>>} args - aarguments, nested if multiple ops
 */
function bakeOp(browser, opName, input, args=[]) {
    let recipeConfig;

    if (typeof(opName) === "string") {
        recipeConfig = JSON.stringify([{
            "op": opName,
            "args": args
        }]);
    } else if (opName instanceof Array) {
        recipeConfig = JSON.stringify(
            opName.map((op, i) => {
                return {
                    op: op,
                    args: args.length ? args[i] : []
                };
            })
        );
    } else {
        throw new Error("Invalid operation type. Must be string or array of strings. Received: " + typeof(opName));
    }

    browser
        .useCss()
        .click("#clr-recipe")
        .click("#clr-io")
        .waitForElementNotPresent("#rec-list li.operation")
        .expect.element("#input-text").to.have.property("value").that.equals("");

    browser
        .perform(function() {
            console.log(`Current test: ${opName}`);
        })
        .urlHash("recipe=" + recipeConfig)
        .setValue("#input-text", input)
        .waitForElementPresent("#rec-list li.operation")
        .expect.element("#input-text").to.have.property("value").that.equals(input);

    browser
        .waitForElementVisible("#stale-indicator", 5000)
        .pause(100)
        .click("#bake")
        .pause(100)
        .waitForElementPresent("#stale-indicator.hidden", 5000)
        .waitForElementNotVisible("#output-loader", 5000);
}

/** @function
 * Clears the current recipe and tests a new operation.
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string|Array<string>} opName - name of operation to be tested, array for multiple ops
 * @param {string} input - input text
 * @param {string} output - expected output
 * @param {Array<string>|Array<Array<string>>} args - arguments, nested if multiple ops
 */
function testOp(browser, opName, input, output, args=[]) {

    bakeOp(browser, opName, input, args);

    if (typeof output === "string") {
        browser.expect.element("#output-text").to.have.property("value").that.equals(output);
    } else if (output instanceof RegExp) {
        browser.expect.element("#output-text").to.have.property("value").that.matches(output);
    }
}

/** @function
 * Clears the current recipe and tests a new operation.
 *
 * @param {Browser} browser - Nightwatch client
 * @param {string|Array<string>} opName - name of operation to be tested array for multiple ops
 * @param {string} input - input text
 * @param {string} cssSelector - CSS selector for HTML output
 * @param {string} output - expected output
 * @param {Array<string>|Array<Array<string>>} args - arguments, nested if multiple ops
 */
function testOpHtml(browser, opName, input, cssSelector, output, args=[]) {
    bakeOp(browser, opName, input, args);

    if (typeof output === "string") {
        browser.expect.element("#output-html " + cssSelector).text.that.equals(output);
    } else if (output instanceof RegExp) {
        browser.expect.element("#output-html " + cssSelector).text.that.matches(output);
    }
}
