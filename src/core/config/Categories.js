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
const Categories = [
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
            "To Octal",
            "From Octal",
            "To Base64",
            "From Base64",
            "Show Base64 offsets",
            "To Base32",
            "From Base32",
            "To Base58",
            "From Base58",
            "To Base",
            "From Base",
            "To BCD",
            "From BCD",
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
            "Encode text",
            "Decode text",
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
            "ROT47",
            "XOR",
            "XOR Brute Force",
            "Vigenère Encode",
            "Vigenère Decode",
            "To Morse Code",
            "From Morse Code",
            "Bifid Cipher Encode",
            "Bifid Cipher Decode",
            "Affine Cipher Encode",
            "Affine Cipher Decode",
            "Atbash Cipher",
            "Substitute",
            "Derive PBKDF2 key",
            "Derive EVP key",
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
            "Bit shift left",
            "Bit shift right",
            "Rotate left",
            "Rotate right",
            "ROT13",
        ]
    },
    {
        name: "Networking",
        ops: [
            "HTTP request",
            "Strip HTTP headers",
            "Parse User Agent",
            "Parse IP range",
            "Parse IPv6 address",
            "Parse IPv4 header",
            "Parse URI",
            "URL Encode",
            "URL Decode",
            "Format MAC addresses",
            "Change IP format",
            "Group IP addresses",
            "Encode NetBIOS Name",
            "Decode NetBIOS Name",
        ]
    },
    {
        name: "Language",
        ops: [
            "Encode text",
            "Decode text",
            "Unescape Unicode Characters",
        ]
    },
    {
        name: "Utils",
        ops: [
            "Arithmetic",
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
            "Filter",
            "Head",
            "Tail",
            "Count occurrences",
            "Expand alphabet range",
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
            "Escape string",
            "Unescape string",
        ]
    },
    {
        name: "Date / Time",
        ops: [
            "Parse DateTime",
            "Translate DateTime Format",
            "From UNIX Timestamp",
            "To UNIX Timestamp",
            "Windows Filetime to UNIX Timestamp",
            "UNIX Timestamp to Windows Filetime",
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
            "XPath expression",
            "JPath expression",
            "CSS selector",
            "Extract EXIF",
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
            "Tar",
            "Untar",
        ]
    },
    {
        name: "Hashing",
        ops: [
            "Analyse hash",
            "Generate all hashes",
            "MD2",
            "MD4",
            "MD5",
            "MD6",
            "SHA0",
            "SHA1",
            "SHA2",
            "SHA3",
            "Keccak",
            "Shake",
            "RIPEMD",
            "HAS-160",
            "Whirlpool",
            "Snefru",
            "HMAC",
            "Fletcher-8 Checksum",
            "Fletcher-16 Checksum",
            "Fletcher-32 Checksum",
            "Fletcher-64 Checksum",
            "Adler-32 Checksum",
            "CRC-16 Checksum",
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
            "XPath expression",
            "JPath expression",
            "CSS selector",
            "PHP Deserialize",
            "Microsoft Script Decoder",
            "Strip HTML tags",
            "Diff",
            "To Snake case",
            "To Camel case",
            "To Kebab case",
        ]
    },
    {
        name: "Other",
        ops: [
            "Entropy",
            "Frequency distribution",
            "Detect File Type",
            "Scan for Embedded Files",
            "Disassemble x86",
            "Generate UUID",
            "Generate TOTP",
            "Generate HOTP",
            "Render Image",
            "Remove EXIF",
            "Extract EXIF",
            "Numberwang",
        ]
    },
    {
        name: "Flow control",
        ops: [
            "Fork",
            "Merge",
            "Register",
            "Jump",
            "Conditional Jump",
            "Return",
            "Comment"
        ]
    },
];

export default Categories;
