/**
 * Type definition for a CatConf.
 *
 * @typedef {Object} CatConf
 * @property {string} name - The display name for the category
 * @property {string[]} ops - A list of the operations to be included in this category
 */


/**
 * Categories of operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constant
 * @type {CatConf[]}
 */
var Categories = [
    {
        name: "Favourites",
        ops: []
    },
    {
        name: "Data format",
        ops: [
            "To Hexdump",
            "From Hexdump",
            "To Hex",
            "From Hex",
            "To Charcode",
            "From Charcode",
            "To Decimal",
            "From Decimal",
            "To Binary",
            "From Binary",
            "To Base64",
            "From Base64",
            "Show Base64 offsets",
            "To Base32",
            "From Base32",
            "To Base",
            "From Base",
            "To HTML Entity",
            "From HTML Entity",
            "URL Encode",
            "URL Decode",
            "Unescape Unicode Characters",
            "To Quoted Printable",
            "From Quoted Printable",
            "To Punycode",
            "From Punycode",
            "To Hex Content",
            "From Hex Content",
            "PEM to Hex",
            "Hex to PEM",
            "Parse ASN.1 hex string",
            "Change IP format",
            "Text encoding",
            "Swap endianness",
        ]
    },
    {
        name: "Encryption / Encoding",
        ops: [
            "AES Encrypt",
            "AES Decrypt",
            "Blowfish Encrypt",
            "Blowfish Decrypt",
            "DES Encrypt",
            "DES Decrypt",
            "Triple DES Encrypt",
            "Triple DES Decrypt",
            "Rabbit Encrypt",
            "Rabbit Decrypt",
            "RC4",
            "RC4 Drop",
            "ROT13",
            "XOR",
            "XOR Brute Force",
            "Derive PBKDF2 key",
            "Derive EVP key",
            "Vigenere Encode",
            "Vigenere Decode"
        ]
    },
    {
        name: "Public Key",
        ops: [
            "Parse X.509 certificate",
            "Parse ASN.1 hex string",
            "PEM to Hex",
            "Hex to PEM",
            "Hex to Object Identifier",
            "Object Identifier to Hex",
        ]
    },
    {
        name: "Logical operations",
        ops: [
            "XOR",
            "XOR Brute Force",
            "OR",
            "NOT",
            "AND",
            "ADD",
            "SUB",
            "Rotate left",
            "Rotate right",
            "ROT13",
        ]
    },
    {
        name: "Networking",
        ops: [
            "Strip HTTP headers",
            "Parse User Agent",
            "Parse IP range",
            "Parse IPv6 address",
            "Parse URI",
            "URL Encode",
            "URL Decode",
            "Format MAC addresses",
            "Change IP format",
            "Group IP addresses",
        ]
    },
    {
        name: "Language",
        ops: [
            "Text encoding",
            "Unescape Unicode Characters",
        ]
    },
    {
        name: "Utils",
        ops: [
            "Diff",
            "Remove whitespace",
            "Remove null bytes",
            "To Upper case",
            "To Lower case",
            "Add line numbers",
            "Remove line numbers",
            "Reverse",
            "Sort",
            "Unique",
            "Split",
            "Count occurrences",
            "Expand alphabet range",
            "Parse escaped string",
            "Drop bytes",
            "Take bytes",
            "Pad lines",
            "Find / Replace",
            "Regular expression",
            "Offset checker",
            "Convert distance",
            "Convert area",
            "Convert mass",
            "Convert speed",
            "Convert data units",
            "Parse UNIX file permissions",
            "Swap endianness",
            "Parse colour code",
        ]
    },
    {
        name: "Date / Time",
        ops: [
            "Parse DateTime",
            "Translate DateTime Format",
            "From UNIX Timestamp",
            "To UNIX Timestamp",
            "Extract dates",
        ]
    },
    {
        name: "Extractors",
        ops: [
            "Strings",
            "Extract IP addresses",
            "Extract email addresses",
            "Extract MAC addresses",
            "Extract URLs",
            "Extract domains",
            "Extract file paths",
            "Extract dates",
            "Regular expression",
        ]
    },
    {
        name: "Compression",
        ops: [
            "Raw Deflate",
            "Raw Inflate",
            "Zlib Deflate",
            "Zlib Inflate",
            "Gzip",
            "Gunzip",
            "Zip",
            "Unzip",
            "Bzip2 Decompress",
        ]
    },
    {
        name: "Hashing",
        ops: [
            "Analyse hash",
            "Generate all hashes",
            "MD5",
            "SHA1",
            "SHA224",
            "SHA256",
            "SHA384",
            "SHA512",
            "SHA3",
            "RIPEMD-160",
            "HMAC",
            "Fletcher-16 Checksum",
            "Adler-32 Checksum",
            "CRC-32 Checksum",
            "TCP/IP Checksum",
        ]
    },
    {
        name: "Code tidy",
        ops: [
            "Syntax highlighter",
            "Generic Code Beautify",
            "JavaScript Parser",
            "JavaScript Beautify",
            "JavaScript Minify",
            "JSON Beautify",
            "JSON Minify",
            "XML Beautify",
            "XML Minify",
            "SQL Beautify",
            "SQL Minify",
            "CSS Beautify",
            "CSS Minify",
            "Strip HTML tags",
            "Diff",
        ]
    },
    {
        name: "Other",
        ops: [
            "Entropy",
            "Frequency distribution",
            "Detect File Type",
            "Scan for Embedded Files",
            "Generate UUID",
            "Numberwang",
        ]
    },
    {
        name: "Flow control",
        ops: [
            "Fork",
            "Merge",
            "Jump",
            "Conditional Jump",
            "Return",
        ]
    },
];
