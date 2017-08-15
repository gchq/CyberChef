import FlowControl from "../FlowControl.js";
import Base from "../operations/Base.js";
import Base58 from "../operations/Base58.js";
import Base64 from "../operations/Base64.js";
import BCD from "../operations/BCD.js";
import BitwiseOp from "../operations/BitwiseOp.js";
import ByteRepr from "../operations/ByteRepr.js";
import CharEnc from "../operations/CharEnc.js";
import Checksum from "../operations/Checksum.js";
import Cipher from "../operations/Cipher.js";
import Code from "../operations/Code.js";
import Compress from "../operations/Compress.js";
import Convert from "../operations/Convert.js";
import DateTime from "../operations/DateTime.js";
import Endian from "../operations/Endian.js";
import Entropy from "../operations/Entropy.js";
import Extract from "../operations/Extract.js";
import FileType from "../operations/FileType.js";
import Image from "../operations/Image.js";
import Hash from "../operations/Hash.js";
import Hexdump from "../operations/Hexdump.js";
import HTML from "../operations/HTML.js";
import HTTP from "../operations/HTTP.js";
import IP from "../operations/IP.js";
import JS from "../operations/JS.js";
import MAC from "../operations/MAC.js";
import MorseCode from "../operations/MorseCode.js";
import NetBIOS from "../operations/NetBIOS.js";
import Numberwang from "../operations/Numberwang.js";
import OS from "../operations/OS.js";
import PublicKey from "../operations/PublicKey.js";
import Punycode from "../operations/Punycode.js";
import QuotedPrintable from "../operations/QuotedPrintable.js";
import Rotate from "../operations/Rotate.js";
import SeqUtils from "../operations/SeqUtils.js";
import StrUtils from "../operations/StrUtils.js";
import Tidy from "../operations/Tidy.js";
import Unicode from "../operations/Unicode.js";
import URL_ from "../operations/URL.js";
import UUID from "../operations/UUID.js";


/**
 * Type definition for an OpConf.
 *
 * @typedef {Object} OpConf
 * @property {html} description - A description of the operation with optional HTML tags
 * @property {Function} run - The function which can be called the run the operation
 * @property {string} inputType
 * @property {string} outputType
 * @property {Function|boolean} [highlight] - A function to calculate the highlight offset, or true
 *   if the offset does not change
 * @property {Function|boolean} [highlightReverse] - A function to calculate the highlight offset
 *   in reverse, or true if the offset does not change
 * @property {boolean} [flowControl] - True if the operation is for Flow Control
 * @property {ArgConf[]} [args] - A list of configuration objects for the arguments
 */


/**
 * Type definition for an ArgConf.
 *
 * @typedef {Object} ArgConf
 * @property {string} name - The display name of the argument
 * @property {string} type - The data type of the argument
 * @property {*} value
 * @property {number[]} [disableArgs] - A list of the indices of the operation's arguments which
 *   should be toggled on or off when this argument is changed
 * @property {boolean} [disabled] - Whether or not this argument starts off disabled
 */


/**
 * Operation configuration objects.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constant
 * @type {Object.<string, OpConf>}
 */
const OperationConfig = {
    "Fork": {
        description: "Split the input data up based on the specified delimiter and run all subsequent operations on each branch separately.<br><br>For example, to decode multiple Base64 strings, enter them all on separate lines then add the 'Fork' and 'From Base64' operations to the recipe. Each string will be decoded separately.",
        run: FlowControl.runFork,
        inputType: "string",
        outputType: "string",
        flowControl: true,
        args: [
            {
                name: "Split delimiter",
                type: "binaryShortString",
                value: FlowControl.FORK_DELIM
            },
            {
                name: "Merge delimiter",
                type: "binaryShortString",
                value: FlowControl.MERGE_DELIM
            },
            {
                name: "Ignore errors",
                type: "boolean",
                value: FlowControl.FORK_IGNORE_ERRORS
            }
        ]
    },
    "Merge": {
        description: "Consolidate all branches back into a single trunk. The opposite of Fork.",
        run: FlowControl.runMerge,
        inputType: "string",
        outputType: "string",
        flowControl: true,
        args: []
    },
    "Jump": {
        description: "Jump forwards or backwards over the specified number of operations.",
        run: FlowControl.runJump,
        inputType: "string",
        outputType: "string",
        flowControl: true,
        args: [
            {
                name: "Number of operations to jump over",
                type: "number",
                value: FlowControl.JUMP_NUM
            },
            {
                name: "Maximum jumps (if jumping backwards)",
                type: "number",
                value: FlowControl.MAX_JUMPS
            }
        ]
    },
    "Conditional Jump": {
        description: "Conditionally jump forwards or backwards over the specified number of operations based on whether the data matches the specified regular expression.",
        run: FlowControl.runCondJump,
        inputType: "string",
        outputType: "string",
        flowControl: true,
        args: [
            {
                name: "Match (regex)",
                type: "string",
                value: ""
            },
            {
                name: "Number of operations to jump over if match found",
                type: "number",
                value: FlowControl.JUMP_NUM
            },
            {
                name: "Maximum jumps (if jumping backwards)",
                type: "number",
                value: FlowControl.MAX_JUMPS
            }
        ]
    },
    "Return": {
        description: "End execution of operations at this point in the recipe.",
        run: FlowControl.runReturn,
        inputType: "string",
        outputType: "string",
        flowControl: true,
        args: []
    },
    "Comment": {
        description: "Provides a place to write comments within the flow of the recipe. This operation has no computational effect.",
        run: FlowControl.runComment,
        inputType: "string",
        outputType: "string",
        flowControl: true,
        args: [
            {
                name: "",
                type: "text",
                value: ""
            }
        ]
    },
    "From Base64": {
        description: "Base64 is a notation for encoding arbitrary byte data using a restricted set of symbols that can be conveniently used by humans and processed by computers.<br><br>This operation decodes data from an ASCII Base64 string back into its raw format.<br><br>e.g. <code>aGVsbG8=</code> becomes <code>hello</code>",
        run: Base64.runFrom,
        highlight: Base64.highlightFrom,
        highlightReverse: Base64.highlightTo,
        inputType: "string",
        outputType: "byteArray",
        args: [
            {
                name: "Alphabet",
                type: "editableOption",
                value: Base64.ALPHABET_OPTIONS
            },
            {
                name: "Remove non&#8209;alphabet chars",
                type: "boolean",
                value: Base64.REMOVE_NON_ALPH_CHARS
            }
        ]
    },
    "To Base64": {
        description: "Base64 is a notation for encoding arbitrary byte data using a restricted set of symbols that can be conveniently used by humans and processed by computers.<br><br>This operation encodes data in an ASCII Base64 string.<br><br>e.g. <code>hello</code> becomes <code>aGVsbG8=</code>",
        run: Base64.runTo,
        highlight: Base64.highlightTo,
        highlightReverse: Base64.highlightFrom,
        inputType: "byteArray",
        outputType: "string",
        args: [
            {
                name: "Alphabet",
                type: "editableOption",
                value: Base64.ALPHABET_OPTIONS
            },
        ]
    },
    "From Base58": {
        description: "Base58 (similar to Base64) is a notation for encoding arbitrary byte data. It differs from Base64 by removing easily misread characters (i.e. l, I, 0 and O) to improve human readability.<br><br>This operation decodes data from an ASCII string (with an alphabet of your choosing, presets included) back into its raw form.<br><br>e.g. <code>StV1DL6CwTryKyV</code> becomes <code>hello world</code><br><br>Base58 is commonly used in cryptocurrencies (Bitcoin, Ripple, etc).",
        run: Base58.runFrom,
        inputType: "string",
        outputType: "byteArray",
        args: [
            {
                name: "Alphabet",
                type: "editableOption",
                value: Base58.ALPHABET_OPTIONS
            },
            {
                name: "Remove non&#8209;alphabet chars",
                type: "boolean",
                value: Base58.REMOVE_NON_ALPH_CHARS
            }
        ]
    },
    "To Base58": {
        description: "Base58 (similar to Base64) is a notation for encoding arbitrary byte data. It differs from Base64 by removing easily misread characters (i.e. l, I, 0 and O) to improve human readability.<br><br>This operation encodes data in an ASCII string (with an alphabet of your choosing, presets included).<br><br>e.g. <code>hello world</code> becomes <code>StV1DL6CwTryKyV</code><br><br>Base58 is commonly used in cryptocurrencies (Bitcoin, Ripple, etc).",
        run: Base58.runTo,
        inputType: "byteArray",
        outputType: "string",
        args: [
            {
                name: "Alphabet",
                type: "editableOption",
                value: Base58.ALPHABET_OPTIONS
            },
        ]
    },
    "From Base32": {
        description: "Base32 is a notation for encoding arbitrary byte data using a restricted set of symbols that can be conveniently used by humans and processed by computers. It uses a smaller set of characters than Base64, usually the uppercase alphabet and the numbers 2 to 7.",
        run: Base64.runFrom32,
        inputType: "string",
        outputType: "byteArray",
        args: [
            {
                name: "Alphabet",
                type: "binaryString",
                value: Base64.BASE32_ALPHABET
            },
            {
                name: "Remove non&#8209;alphabet chars",
                type: "boolean",
                value: Base64.REMOVE_NON_ALPH_CHARS
            }
        ]
    },
    "To Base32": {
        description: "Base32 is a notation for encoding arbitrary byte data using a restricted set of symbols that can be conveniently used by humans and processed by computers. It uses a smaller set of characters than Base64, usually the uppercase alphabet and the numbers 2 to 7.",
        run: Base64.runTo32,
        inputType: "byteArray",
        outputType: "string",
        args: [
            {
                name: "Alphabet",
                type: "binaryString",
                value: Base64.BASE32_ALPHABET
            }
        ]
    },
    "Show Base64 offsets": {
        description: "When a string is within a block of data and the whole block is Base64'd, the string itself could be represented in Base64 in three distinct ways depending on its offset within the block.<br><br>This operation shows all possible offsets for a given string so that each possible encoding can be considered.",
        run: Base64.runOffsets,
        inputType: "byteArray",
        outputType: "html",
        args: [
            {
                name: "Alphabet",
                type: "binaryString",
                value: Base64.ALPHABET
            },
            {
                name: "Show variable chars and padding",
                type: "boolean",
                value: Base64.OFFSETS_SHOW_VARIABLE
            }
        ]
    },
    "XOR": {
        description: "XOR the input with the given key.<br>e.g. <code>fe023da5</code><br><br><strong>Options</strong><br><u>Null preserving:</u> If the current byte is 0x00 or the same as the key, skip it.<br><br><u>Scheme:</u><ul><li>Standard - key is unchanged after each round</li><li>Input differential - key is set to the value of the previous unprocessed byte</li><li>Output differential - key is set to the value of the previous processed byte</li></ul>",
        run: BitwiseOp.runXor,
        highlight: true,
        highlightReverse: true,
        inputType: "byteArray",
        outputType: "byteArray",
        args: [
            {
                name: "Key",
                type: "toggleString",
                value: "",
                toggleValues: BitwiseOp.KEY_FORMAT
            },
            {
                name: "Scheme",
                type: "option",
                value: BitwiseOp.XOR_SCHEME
            },
            {
                name: "Null preserving",
                type: "boolean",
                value: BitwiseOp.XOR_PRESERVE_NULLS
            }
        ]
    },
    "XOR Brute Force": {
        description: "Enumerate all possible XOR solutions. Current maximum key length is 2 due to browser performance.<br><br>Optionally enter a regex string that you expect to find in the plaintext to filter results (crib).",
        run: BitwiseOp.runXorBrute,
        inputType: "byteArray",
        outputType: "string",
        args: [
            {
                name: "Key length",
                type: "option",
                value: BitwiseOp.XOR_BRUTE_KEY_LENGTH
            },
            {
                name: "Sample length",
                type: "number",
                value: BitwiseOp.XOR_BRUTE_SAMPLE_LENGTH
            },
            {
                name: "Sample offset",
                type: "number",
                value: BitwiseOp.XOR_BRUTE_SAMPLE_OFFSET
            },
            {
                name: "Scheme",
                type: "option",
                value: BitwiseOp.XOR_SCHEME
            },
            {
                name: "Null preserving",
                type: "boolean",
                value: BitwiseOp.XOR_PRESERVE_NULLS
            },
            {
                name: "Print key",
                type: "boolean",
                value: BitwiseOp.XOR_BRUTE_PRINT_KEY
            },
            {
                name: "Output as hex",
                type: "boolean",
                value: BitwiseOp.XOR_BRUTE_OUTPUT_HEX
            },
            {
                name: "Crib (known plaintext string)",
                type: "binaryString",
                value: ""
            }
        ]
    },
    "NOT": {
        description: "Returns the inverse of each byte.",
        run: BitwiseOp.runNot,
        highlight: true,
        highlightReverse: true,
        inputType: "byteArray",
        outputType: "byteArray",
        args: []
    },
    "AND": {
        description: "AND the input with the given key.<br>e.g. <code>fe023da5</code>",
        run: BitwiseOp.runAnd,
        highlight: true,
        highlightReverse: true,
        inputType: "byteArray",
        outputType: "byteArray",
        args: [
            {
                name: "Key",
                type: "toggleString",
                value: "",
                toggleValues: BitwiseOp.KEY_FORMAT
            }
        ]
    },
    "OR": {
        description: "OR the input with the given key.<br>e.g. <code>fe023da5</code>",
        run: BitwiseOp.runOr,
        highlight: true,
        highlightReverse: true,
        inputType: "byteArray",
        outputType: "byteArray",
        args: [
            {
                name: "Key",
                type: "toggleString",
                value: "",
                toggleValues: BitwiseOp.KEY_FORMAT
            }
        ]
    },
    "ADD": {
        description: "ADD the input with the given key (e.g. <code>fe023da5</code>), MOD 255",
        run: BitwiseOp.runAdd,
        highlight: true,
        highlightReverse: true,
        inputType: "byteArray",
        outputType: "byteArray",
        args: [
            {
                name: "Key",
                type: "toggleString",
                value: "",
                toggleValues: BitwiseOp.KEY_FORMAT
            }
        ]
    },
    "SUB": {
        description: "SUB the input with the given key (e.g. <code>fe023da5</code>), MOD 255",
        run: BitwiseOp.runSub,
        highlight: true,
        highlightReverse: true,
        inputType: "byteArray",
        outputType: "byteArray",
        args: [
            {
                name: "Key",
                type: "toggleString",
                value: "",
                toggleValues: BitwiseOp.KEY_FORMAT
            }
        ]
    },
    "From Hex": {
        description: "Converts a hexadecimal byte string back into its raw value.<br><br>e.g. <code>ce 93 ce b5 ce b9 ce ac 20 cf 83 ce bf cf 85 0a</code> becomes the UTF-8 encoded string <code>Γειά σου</code>",
        run: ByteRepr.runFromHex,
        highlight: ByteRepr.highlightFrom,
        highlightReverse: ByteRepr.highlightTo,
        inputType: "string",
        outputType: "byteArray",
        args: [
            {
                name: "Delimiter",
                type: "option",
                value: ByteRepr.HEX_DELIM_OPTIONS
            }
        ]
    },
    "To Hex": {
        description: "Converts the input string to hexadecimal bytes separated by the specified delimiter.<br><br>e.g. The UTF-8 encoded string <code>Γειά σου</code> becomes <code>ce 93 ce b5 ce b9 ce ac 20 cf 83 ce bf cf 85 0a</code>",
        run: ByteRepr.runToHex,
        highlight: ByteRepr.highlightTo,
        highlightReverse: ByteRepr.highlightFrom,
        inputType: "byteArray",
        outputType: "string",
        args: [
            {
                name: "Delimiter",
                type: "option",
                value: ByteRepr.HEX_DELIM_OPTIONS
            }
        ]
    },
    "From Octal": {
        description: "Converts an octal byte string back into its raw value.<br><br>e.g. <code>316 223 316 265 316 271 316 254 40 317 203 316 277 317 205</code> becomes the UTF-8 encoded string <code>Γειά σου</code>",
        run: ByteRepr.runFromOct,
        highlight: false,
        highlightReverse: false,
        inputType: "string",
        outputType: "byteArray",
        args: [
            {
                name: "Delimiter",
                type: "option",
                value: ByteRepr.DELIM_OPTIONS
            }
        ]
    },
    "To Octal": {
        description: "Converts the input string to octal bytes separated by the specified delimiter.<br><br>e.g. The UTF-8 encoded string <code>Γειά σου</code> becomes <code>316 223 316 265 316 271 316 254 40 317 203 316 277 317 205</code>",
        run: ByteRepr.runToOct,
        highlight: false,
        highlightReverse: false,
        inputType: "byteArray",
        outputType: "string",
        args: [
            {
                name: "Delimiter",
                type: "option",
                value: ByteRepr.DELIM_OPTIONS
            }
        ]
    },
    "From Charcode": {
        description: "Converts unicode character codes back into text.<br><br>e.g. <code>0393 03b5 03b9 03ac 20 03c3 03bf 03c5</code> becomes <code>Γειά σου</code>",
        run: ByteRepr.runFromCharcode,
        highlight: ByteRepr.highlightFrom,
        highlightReverse: ByteRepr.highlightTo,
        inputType: "string",
        outputType: "byteArray",
        args: [
            {
                name: "Delimiter",
                type: "option",
                value: ByteRepr.DELIM_OPTIONS
            },
            {
                name: "Base",
                type: "number",
                value: ByteRepr.CHARCODE_BASE
            }
        ]
    },
    "To Charcode": {
        description: "Converts text to its unicode character code equivalent.<br><br>e.g. <code>Γειά σου</code> becomes <code>0393 03b5 03b9 03ac 20 03c3 03bf 03c5</code>",
        run: ByteRepr.runToCharcode,
        highlight: ByteRepr.highlightTo,
        highlightReverse: ByteRepr.highlightFrom,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Delimiter",
                type: "option",
                value: ByteRepr.DELIM_OPTIONS
            },
            {
                name: "Base",
                type: "number",
                value: ByteRepr.CHARCODE_BASE
            }
        ]
    },
    "From Binary": {
        description: "Converts a binary string back into its raw form.<br><br>e.g. <code>01001000 01101001</code> becomes <code>Hi</code>",
        run: ByteRepr.runFromBinary,
        highlight: ByteRepr.highlightFromBinary,
        highlightReverse: ByteRepr.highlightToBinary,
        inputType: "string",
        outputType: "byteArray",
        args: [
            {
                name: "Delimiter",
                type: "option",
                value: ByteRepr.BIN_DELIM_OPTIONS
            }
        ]
    },
    "To Binary": {
        description: "Displays the input data as a binary string.<br><br>e.g. <code>Hi</code> becomes <code>01001000 01101001</code>",
        run: ByteRepr.runToBinary,
        highlight: ByteRepr.highlightToBinary,
        highlightReverse: ByteRepr.highlightFromBinary,
        inputType: "byteArray",
        outputType: "string",
        args: [
            {
                name: "Delimiter",
                type: "option",
                value: ByteRepr.BIN_DELIM_OPTIONS
            }
        ]
    },
    "From Decimal": {
        description: "Converts the data from an ordinal integer array back into its raw form.<br><br>e.g. <code>72 101 108 108 111</code> becomes <code>Hello</code>",
        run: ByteRepr.runFromDecimal,
        inputType: "string",
        outputType: "byteArray",
        args: [
            {
                name: "Delimiter",
                type: "option",
                value: ByteRepr.DELIM_OPTIONS
            }
        ]
    },
    "To Decimal": {
        description: "Converts the input data to an ordinal integer array.<br><br>e.g. <code>Hello</code> becomes <code>72 101 108 108 111</code>",
        run: ByteRepr.runToDecimal,
        inputType: "byteArray",
        outputType: "string",
        args: [
            {
                name: "Delimiter",
                type: "option",
                value: ByteRepr.DELIM_OPTIONS
            }
        ]
    },
    "From Hexdump": {
        description: "Attempts to convert a hexdump back into raw data. This operation supports many different hexdump variations, but probably not all. Make sure you verify that the data it gives you is correct before continuing analysis.",
        run: Hexdump.runFrom,
        highlight: Hexdump.highlightFrom,
        highlightReverse: Hexdump.highlightTo,
        inputType: "string",
        outputType: "byteArray",
        args: []
    },
    "To Hexdump": {
        description: "Creates a hexdump of the input data, displaying both the hexadecimal values of each byte and an ASCII representation alongside.",
        run: Hexdump.runTo,
        highlight: Hexdump.highlightTo,
        highlightReverse: Hexdump.highlightFrom,
        inputType: "byteArray",
        outputType: "string",
        args: [
            {
                name: "Width",
                type: "number",
                value: Hexdump.WIDTH
            },
            {
                name: "Upper case hex",
                type: "boolean",
                value: Hexdump.UPPER_CASE
            },
            {
                name: "Include final length",
                type: "boolean",
                value: Hexdump.INCLUDE_FINAL_LENGTH
            }
        ]
    },
    "From Base": {
        description: "Converts a number to decimal from a given numerical base.",
        run: Base.runFrom,
        inputType: "string",
        outputType: "number",
        args: [
            {
                name: "Radix",
                type: "number",
                value: Base.DEFAULT_RADIX
            }
        ]
    },
    "To Base": {
        description: "Converts a decimal number to a given numerical base.",
        run: Base.runTo,
        inputType: "number",
        outputType: "string",
        args: [
            {
                name: "Radix",
                type: "number",
                value: Base.DEFAULT_RADIX
            }
        ]
    },
    "From HTML Entity": {
        description: "Converts HTML entities back to characters<br><br>e.g. <code>&amp;<span>amp;</span></code> becomes <code>&amp;</code>", // <span> tags required to stop the browser just printing &
        run: HTML.runFromEntity,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "To HTML Entity": {
        description: "Converts characters to HTML entities<br><br>e.g. <code>&amp;</code> becomes <code>&amp;<span>amp;</span></code>", // <span> tags required to stop the browser just printing &
        run: HTML.runToEntity,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Convert all characters",
                type: "boolean",
                value: HTML.CONVERT_ALL
            },
            {
                name: "Convert to",
                type: "option",
                value: HTML.CONVERT_OPTIONS
            }
        ]
    },
    "Strip HTML tags": {
        description: "Removes all HTML tags from the input.",
        run: HTML.runStripTags,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Remove indentation",
                type: "boolean",
                value: HTML.REMOVE_INDENTATION
            },
            {
                name: "Remove excess line breaks",
                type: "boolean",
                value: HTML.REMOVE_LINE_BREAKS
            }
        ]
    },
    "URL Decode": {
        description: "Converts URI/URL percent-encoded characters back to their raw values.<br><br>e.g. <code>%3d</code> becomes <code>=</code>",
        run: URL_.runFrom,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "URL Encode": {
        description: "Encodes problematic characters into percent-encoding, a format supported by URIs/URLs.<br><br>e.g. <code>=</code> becomes <code>%3d</code>",
        run: URL_.runTo,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Encode all special chars",
                type: "boolean",
                value: URL_.ENCODE_ALL
            }
        ]
    },
    "Parse URI": {
        description: "Pretty prints complicated Uniform Resource Identifier (URI) strings for ease of reading. Particularly useful for Uniform Resource Locators (URLs) with a lot of arguments.",
        run: URL_.runParse,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "Unescape Unicode Characters": {
        description: "Converts unicode-escaped character notation back into raw characters.<br><br>Supports the prefixes:<ul><li><code>\\u</code></li><li><code>%u</code></li><li><code>U+</code></li></ul>e.g. <code>\\u03c3\\u03bf\\u03c5</code> becomes <code>σου</code>",
        run: Unicode.runUnescape,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Prefix",
                type: "option",
                value: Unicode.PREFIXES
            }
        ]
    },
    "From Quoted Printable": {
        description: "Converts QP-encoded text back to standard text.",
        run: QuotedPrintable.runFrom,
        inputType: "string",
        outputType: "byteArray",
        args: []
    },
    "To Quoted Printable": {
        description: "Quoted-Printable, or QP encoding, is an encoding using printable ASCII characters (alphanumeric and the equals sign '=') to transmit 8-bit data over a 7-bit data path or, generally, over a medium which is not 8-bit clean. It is defined as a MIME content transfer encoding for use in e-mail.<br><br>QP works by using the equals sign '=' as an escape character. It also limits line length to 76, as some software has limits on line length.",
        run: QuotedPrintable.runTo,
        inputType: "byteArray",
        outputType: "string",
        args: []
    },
    "From Punycode": {
        description: "Punycode is a way to represent Unicode with the limited character subset of ASCII supported by the Domain Name System.<br><br>e.g. <code>mnchen-3ya</code> decodes to <code>münchen</code>",
        run: Punycode.runToUnicode,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Internationalised domain name",
                type: "boolean",
                value: Punycode.IDN
            }
        ]
    },
    "To Punycode": {
        description: "Punycode is a way to represent Unicode with the limited character subset of ASCII supported by the Domain Name System.<br><br>e.g. <code>münchen</code> encodes to <code>mnchen-3ya</code>",
        run: Punycode.runToAscii,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Internationalised domain name",
                type: "boolean",
                value: Punycode.IDN
            }
        ]
    },
    "From Hex Content": {
        description: "Translates hexadecimal bytes in text back to raw bytes.<br><br>e.g. <code>foo|3d|bar</code> becomes <code>foo=bar</code>.",
        run: ByteRepr.runFromHexContent,
        inputType: "string",
        outputType: "byteArray",
        args: []
    },
    "To Hex Content": {
        description: "Converts special characters in a string to hexadecimal.<br><br>e.g. <code>foo=bar</code> becomes <code>foo|3d|bar</code>.",
        run: ByteRepr.runToHexContent,
        inputType: "byteArray",
        outputType: "string",
        args: [
            {
                name: "Convert",
                type: "option",
                value: ByteRepr.HEX_CONTENT_CONVERT_WHICH
            },
            {
                name: "Print spaces between bytes",
                type: "boolean",
                value: ByteRepr.HEX_CONTENT_SPACES_BETWEEN_BYTES
            },
        ]
    },
    "Change IP format": {
        description: "Convert an IP address from one format to another, e.g. <code>172.20.23.54</code> to <code>ac141736</code>",
        run: IP.runChangeIpFormat,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Input format",
                type: "option",
                value: IP.IP_FORMAT_LIST
            },
            {
                name: "Output format",
                type: "option",
                value: IP.IP_FORMAT_LIST
            }
        ]
    },
    "Parse IP range": {
        description: "Given a CIDR range (e.g. <code>10.0.0.0/24</code>) or a hyphenated range (e.g. <code>10.0.0.0 - 10.0.1.0</code>), this operation provides network information and enumerates all IP addresses in the range.<br><br>IPv6 is supported but will not be enumerated.",
        run: IP.runParseIpRange,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Include network info",
                type: "boolean",
                value: IP.INCLUDE_NETWORK_INFO
            },
            {
                name: "Enumerate IP addresses",
                type: "boolean",
                value: IP.ENUMERATE_ADDRESSES
            },
            {
                name: "Allow large queries",
                type: "boolean",
                value: IP.ALLOW_LARGE_LIST
            }
        ]
    },
    "Group IP addresses": {
        description: "Groups a list of IP addresses into subnets. Supports both IPv4 and IPv6 addresses.",
        run: IP.runGroupIps,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Delimiter",
                type: "option",
                value: IP.DELIM_OPTIONS
            },
            {
                name: "Subnet (CIDR)",
                type: "number",
                value: IP.GROUP_CIDR
            },
            {
                name: "Only show the subnets",
                type: "boolean",
                value: IP.GROUP_ONLY_SUBNET
            }
        ]
    },
    "Parse IPv6 address": {
        description: "Displays the longhand and shorthand versions of a valid IPv6 address.<br><br>Recognises all reserved ranges and parses encapsulated or tunnelled addresses including Teredo and 6to4.",
        run: IP.runParseIPv6,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "Parse IPv4 header": {
        description: "Given an IPv4 header, this operations parses and displays each field in an easily readable format.",
        run: IP.runParseIPv4Header,
        inputType: "string",
        outputType: "html",
        args: [
            {
                name: "Input format",
                type: "option",
                value: IP.IP_HEADER_FORMAT
            }
        ]
    },
    "Encode text": {
        description: [
            "Encodes text into the chosen character encoding.",
            "<br><br>",
            "Supported charsets are:",
            "<ul>",
            Object.keys(CharEnc.IO_FORMAT).map(e => `<li>${e}</li>`).join("\n"),
            "</ul>",
        ].join("\n"),
        run: CharEnc.runEncode,
        inputType: "string",
        outputType: "byteArray",
        args: [
            {
                name: "Encoding",
                type: "option",
                value: Object.keys(CharEnc.IO_FORMAT),
            },
        ]
    },
    "Decode text": {
        description: [
            "Decodes text from the chosen character encoding.",
            "<br><br>",
            "Supported charsets are:",
            "<ul>",
            Object.keys(CharEnc.IO_FORMAT).map(e => `<li>${e}</li>`).join("\n"),
            "</ul>",
        ].join("\n"),
        run: CharEnc.runDecode,
        inputType: "byteArray",
        outputType: "string",
        args: [
            {
                name: "Encoding",
                type: "option",
                value: Object.keys(CharEnc.IO_FORMAT),
            },
        ]
    },
    "AES Decrypt": {
        description: "To successfully decrypt AES, you need either:<ul><li>The passphrase</li><li>Or the key and IV</li></ul>The IV should be the first 16 bytes of encrypted material.",
        run: Cipher.runAesDec,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Passphrase/Key",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT2
            },
            {
                name: "IV",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT1
            },
            {
                name: "Salt",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT1
            },
            {
                name: "Mode",
                type: "option",
                value: Cipher.MODES
            },
            {
                name: "Padding",
                type: "option",
                value: Cipher.PADDING
            },
            {
                name: "Input format",
                type: "option",
                value: Cipher.IO_FORMAT1
            },
            {
                name: "Output format",
                type: "option",
                value: Cipher.IO_FORMAT2
            },
        ]
    },
    "AES Encrypt": {
        description: "Input: Either enter a passphrase (which will be used to derive a key using the OpenSSL KDF) or both the key and IV.<br><br>Advanced Encryption Standard (AES) is a U.S. Federal Information Processing Standard (FIPS). It was selected after a 5-year process where 15 competing designs were evaluated.<br><br>AES-128, AES-192, and AES-256 are supported.  The variant will be chosen based on the size of the key passed in.  If a passphrase is used, a 256-bit key will be generated.",
        run: Cipher.runAesEnc,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Passphrase/Key",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT2
            },
            {
                name: "IV",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT1
            },
            {
                name: "Salt",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT1
            },
            {
                name: "Mode",
                type: "option",
                value: Cipher.MODES
            },
            {
                name: "Padding",
                type: "option",
                value: Cipher.PADDING
            },
            {
                name: "Output result",
                type: "option",
                value: Cipher.RESULT_TYPE
            },
            {
                name: "Output format",
                type: "option",
                value: Cipher.IO_FORMAT1
            },
        ]
    },
    "DES Decrypt": {
        description: "To successfully decrypt DES, you need either:<ul><li>The passphrase</li><li>Or the key and IV</li></ul>The IV should be the first 8 bytes of encrypted material.",
        run: Cipher.runDesDec,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Passphrase/Key",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT2
            },
            {
                name: "IV",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT1

            },
            {
                name: "Salt",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT1
            },
            {
                name: "Mode",
                type: "option",
                value: Cipher.MODES
            },
            {
                name: "Padding",
                type: "option",
                value: Cipher.PADDING
            },
            {
                name: "Input format",
                type: "option",
                value: Cipher.IO_FORMAT1
            },
            {
                name: "Output format",
                type: "option",
                value: Cipher.IO_FORMAT2
            },
        ]
    },
    "DES Encrypt": {
        description: "Input: Either enter a passphrase (which will be used to derive a key using the OpenSSL KDF) or both the key and IV.<br><br>DES is a previously dominant algorithm for encryption, and was published as an official U.S. Federal Information Processing Standard (FIPS). It is now considered to be insecure due to its small key size.",
        run: Cipher.runDesEnc,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Passphrase/Key",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT2
            },
            {
                name: "IV",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT1

            },
            {
                name: "Salt",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT1
            },
            {
                name: "Mode",
                type: "option",
                value: Cipher.MODES
            },
            {
                name: "Padding",
                type: "option",
                value: Cipher.PADDING
            },
            {
                name: "Output result",
                type: "option",
                value: Cipher.RESULT_TYPE
            },
            {
                name: "Output format",
                type: "option",
                value: Cipher.IO_FORMAT1
            },
        ]
    },
    "Triple DES Decrypt": {
        description: "To successfully decrypt Triple DES, you need either:<ul><li>The passphrase</li><li>Or the key and IV</li></ul>The IV should be the first 8 bytes of encrypted material.",
        run: Cipher.runTripleDesDec,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Passphrase/Key",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT2
            },
            {
                name: "IV",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT1

            },
            {
                name: "Salt",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT1
            },
            {
                name: "Mode",
                type: "option",
                value: Cipher.MODES
            },
            {
                name: "Padding",
                type: "option",
                value: Cipher.PADDING
            },
            {
                name: "Input format",
                type: "option",
                value: Cipher.IO_FORMAT1
            },
            {
                name: "Output format",
                type: "option",
                value: Cipher.IO_FORMAT2
            },
        ]
    },
    "Triple DES Encrypt": {
        description: "Input: Either enter a passphrase (which will be used to derive a key using the OpenSSL KDF) or both the key and IV.<br><br>Triple DES applies DES three times to each block to increase key size.",
        run: Cipher.runTripleDesEnc,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Passphrase/Key",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT2
            },
            {
                name: "IV",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT1

            },
            {
                name: "Salt",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT1
            },
            {
                name: "Mode",
                type: "option",
                value: Cipher.MODES
            },
            {
                name: "Padding",
                type: "option",
                value: Cipher.PADDING
            },
            {
                name: "Output result",
                type: "option",
                value: Cipher.RESULT_TYPE
            },
            {
                name: "Output format",
                type: "option",
                value: Cipher.IO_FORMAT1
            },
        ]
    },
    "Blowfish Decrypt": {
        description: "Blowfish is a symmetric-key block cipher designed in 1993 by Bruce Schneier and included in a large number of cipher suites and encryption products. AES now receives more attention.",
        run: Cipher.runBlowfishDec,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Key",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT2
            },
            {
                name: "Mode",
                type: "option",
                value: Cipher.BLOWFISH_MODES
            },
            {
                name: "Input format",
                type: "option",
                value: Cipher.IO_FORMAT3
            },
        ]
    },
    "Blowfish Encrypt": {
        description: "Blowfish is a symmetric-key block cipher designed in 1993 by Bruce Schneier and included in a large number of cipher suites and encryption products. AES now receives more attention.",
        run: Cipher.runBlowfishEnc,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Key",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT2
            },
            {
                name: "Mode",
                type: "option",
                value: Cipher.BLOWFISH_MODES
            },
            {
                name: "Output format",
                type: "option",
                value: Cipher.IO_FORMAT3
            },
        ]
    },
    "Rabbit Decrypt": {
        description: "To successfully decrypt Rabbit, you need either:<ul><li>The passphrase</li><li>Or the key and IV (This is currently broken. You need the key and salt at the moment.)</li></ul>The IV should be the first 8 bytes of encrypted material.",
        run: Cipher.runRabbitDec,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Passphrase/Key",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT2
            },
            {
                name: "IV",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT1

            },
            {
                name: "Salt",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT1
            },
            {
                name: "Mode",
                type: "option",
                value: Cipher.MODES
            },
            {
                name: "Padding",
                type: "option",
                value: Cipher.PADDING
            },
            {
                name: "Input format",
                type: "option",
                value: Cipher.IO_FORMAT1
            },
            {
                name: "Output format",
                type: "option",
                value: Cipher.IO_FORMAT2
            },
        ]
    },
    "Rabbit Encrypt": {
        description: "Input: Either enter a passphrase (which will be used to derive a key using the OpenSSL KDF) or both the key and IV.<br><br>Rabbit is a high-performance stream cipher and a finalist in the eSTREAM Portfolio.  It is one of the four designs selected after a 3 1/2 year process where 22 designs were evaluated.",
        run: Cipher.runRabbitEnc,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Passphrase/Key",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT2
            },
            {
                name: "IV",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT1

            },
            {
                name: "Salt",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT1
            },
            {
                name: "Mode",
                type: "option",
                value: Cipher.MODES
            },
            {
                name: "Padding",
                type: "option",
                value: Cipher.PADDING
            },
            {
                name: "Output result",
                type: "option",
                value: Cipher.RESULT_TYPE
            },
            {
                name: "Output format",
                type: "option",
                value: Cipher.IO_FORMAT1
            },
        ]
    },
    "RC4": {
        description: "RC4 is a widely-used stream cipher. It is used in popular protocols such as SSL and WEP. Although remarkable for its simplicity and speed, the algorithm's history doesn't inspire confidence in its security.",
        run: Cipher.runRc4,
        highlight: true,
        highlightReverse: true,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Passphrase",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT2
            },
            {
                name: "Input format",
                type: "option",
                value: Cipher.IO_FORMAT4
            },
            {
                name: "Output format",
                type: "option",
                value: Cipher.IO_FORMAT4
            },
        ]
    },
    "RC4 Drop": {
        description: "It was discovered that the first few bytes of the RC4 keystream are strongly non-random and leak information about the key. We can defend against this attack by discarding the initial portion of the keystream. This modified algorithm is traditionally called RC4-drop.",
        run: Cipher.runRc4drop,
        highlight: true,
        highlightReverse: true,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Passphrase",
                type: "toggleString",
                value: "",
                toggleValues: Cipher.IO_FORMAT2
            },
            {
                name: "Input format",
                type: "option",
                value: Cipher.IO_FORMAT4
            },
            {
                name: "Output format",
                type: "option",
                value: Cipher.IO_FORMAT4
            },
            {
                name: "Number of bytes to drop",
                type: "number",
                value: Cipher.RC4DROP_BYTES
            },
        ]
    },
    "Derive PBKDF2 key": {
        description: "PBKDF2 is a password-based key derivation function. In many applications of cryptography, user security is ultimately dependent on a password, and because a password usually can't be used directly as a cryptographic key, some processing is required.<br><br>A salt provides a large set of keys for any given password, and an iteration count increases the cost of producing keys from a password, thereby also increasing the difficulty of attack.<br><br>Enter your passphrase as the input and then set the relevant options to generate a key.",
        run: Cipher.runPbkdf2,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Key size",
                type: "number",
                value: Cipher.KDF_KEY_SIZE
            },
            {
                name: "Iterations",
                type: "number",
                value: Cipher.KDF_ITERATIONS
            },
            {
                name: "Hashing function",
                type: "option",
                value: Cipher.HASHERS
            },
            {
                name: "Salt (hex)",
                type: "string",
                value: ""
            },
            {
                name: "Input format",
                type: "option",
                value: Cipher.IO_FORMAT2
            },
            {
                name: "Output format",
                type: "option",
                value: Cipher.IO_FORMAT3
            },
        ]
    },
    "Derive EVP key": {
        description: "EVP is a password-based key derivation function used extensively in OpenSSL. In many applications of cryptography, user security is ultimately dependent on a password, and because a password usually can't be used directly as a cryptographic key, some processing is required.<br><br>A salt provides a large set of keys for any given password, and an iteration count increases the cost of producing keys from a password, thereby also increasing the difficulty of attack.<br><br>Enter your passphrase as the input and then set the relevant options to generate a key.",
        run: Cipher.runEvpkdf,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Key size",
                type: "number",
                value: Cipher.KDF_KEY_SIZE
            },
            {
                name: "Iterations",
                type: "number",
                value: Cipher.KDF_ITERATIONS
            },
            {
                name: "Hashing function",
                type: "option",
                value: Cipher.HASHERS
            },
            {
                name: "Salt (hex)",
                type: "string",
                value: ""
            },
            {
                name: "Input format",
                type: "option",
                value: Cipher.IO_FORMAT2
            },
            {
                name: "Output format",
                type: "option",
                value: Cipher.IO_FORMAT3
            },
        ]
    },
    "Vigenère Encode": {
        description: "The Vigenere cipher is a method of encrypting alphabetic text by using a series of different Caesar ciphers based on the letters of a keyword. It is a simple form of polyalphabetic substitution.",
        run: Cipher.runVigenereEnc,
        highlight: true,
        highlightReverse: true,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Key",
                type: "string",
                value: ""
            }
        ]
    },
    "Vigenère Decode": {
        description: "The Vigenere cipher is a method of encrypting alphabetic text by using a series of different Caesar ciphers based on the letters of a keyword. It is a simple form of polyalphabetic substitution.",
        run: Cipher.runVigenereDec,
        highlight: true,
        highlightReverse: true,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Key",
                type: "string",
                value: ""
            }
        ]
    },
    "Bifid Cipher Encode": {
        description: "The Bifid cipher is a cipher which uses a Polybius square in conjunction with transposition, which can be fairly difficult to decipher without knowing the alphabet keyword.",
        run: Cipher.runBifidEnc,
        highlight: true,
        highlightReverse: true,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Keyword",
                type: "string",
                value: ""
            }
        ]
    },
    "Bifid Cipher Decode": {
        description: "The Bifid cipher is a cipher which uses a Polybius square in conjunction with transposition, which can be fairly difficult to decipher without knowing the alphabet keyword.",
        run: Cipher.runBifidDec,
        highlight: true,
        highlightReverse: true,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Keyword",
                type: "string",
                value: ""
            }
        ]
    },
    "Affine Cipher Encode": {
        description: "The Affine cipher is a type of monoalphabetic substitution cipher, wherein each letter in an alphabet is mapped to its numeric equivalent, encrypted using simple mathematical function, <code>(ax + b) % 26</code>, and converted back to a letter.",
        run: Cipher.runAffineEnc,
        highlight: true,
        highlightReverse: true,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "a",
                type: "number",
                value: Cipher.AFFINE_A
            },
            {
                name: "b",
                type: "number",
                value: Cipher.AFFINE_B
            }
        ]
    },
    "Affine Cipher Decode": {
        description: "The Affine cipher is a type of monoalphabetic substitution cipher. To decrypt, each letter in an alphabet is mapped to its numeric equivalent, decrypted by a mathematical function, and converted back to a letter.",
        run: Cipher.runAffineDec,
        highlight: true,
        highlightReverse: true,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "a",
                type: "number",
                value: Cipher.AFFINE_A
            },
            {
                name: "b",
                type: "number",
                value: Cipher.AFFINE_B
            }
        ]
    },
    "Atbash Cipher": {
        description: "Atbash is a mono-alphabetic substitution cipher originally used to encode the Hebrew alphabet. It has been modified here for use with the Latin alphabet.",
        run: Cipher.runAtbash,
        highlight: true,
        highlightReverse: true,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "Rotate right": {
        description: "Rotates each byte to the right by the number of bits specified. Currently only supports 8-bit values.",
        run: Rotate.runRotr,
        highlight: true,
        highlightReverse: true,
        inputType: "byteArray",
        outputType: "byteArray",
        args: [
            {
                name: "Number of bits",
                type: "number",
                value: Rotate.ROTATE_AMOUNT
            },
            {
                name: "Rotate as a whole",
                type: "boolean",
                value: Rotate.ROTATE_WHOLE
            }
        ]
    },
    "Rotate left": {
        description: "Rotates each byte to the left by the number of bits specified. Currently only supports 8-bit values.",
        run: Rotate.runRotl,
        highlight: true,
        highlightReverse: true,
        inputType: "byteArray",
        outputType: "byteArray",
        args: [
            {
                name: "Number of bits",
                type: "number",
                value: Rotate.ROTATE_AMOUNT
            },
            {
                name: "Rotate as a whole",
                type: "boolean",
                value: Rotate.ROTATE_WHOLE
            }
        ]
    },
    "ROT13": {
        description: "A simple caesar substitution cipher which rotates alphabet characters by the specified amount (default 13).",
        run: Rotate.runRot13,
        highlight: true,
        highlightReverse: true,
        inputType: "byteArray",
        outputType: "byteArray",
        args: [
            {
                name: "Rotate lower case chars",
                type: "boolean",
                value: Rotate.ROT13_LOWERCASE
            },
            {
                name: "Rotate upper case chars",
                type: "boolean",
                value: Rotate.ROT13_UPPERCASE
            },
            {
                name: "Amount",
                type: "number",
                value: Rotate.ROT13_AMOUNT
            },
        ]
    },
    "ROT47": {
        description: "A slightly more complex variation of a caesar cipher, which includes ASCII characters from 33 '!' to 126 '~'. Default rotation: 47.",
        run: Rotate.runRot47,
        highlight: true,
        highlightReverse: true,
        inputType: "byteArray",
        outputType: "byteArray",
        args: [
            {
                name: "Amount",
                type: "number",
                value: Rotate.ROT47_AMOUNT
            },
        ]
    },
    "Strip HTTP headers": {
        description: "Removes HTTP headers from a request or response by looking for the first instance of a double newline.",
        run: HTTP.runStripHeaders,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "Parse User Agent": {
        description: "Attempts to identify and categorise information contained in a user-agent string.",
        run: HTTP.runParseUserAgent,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "Format MAC addresses": {
        description: "Displays given MAC addresses in multiple different formats.<br><br>Expects addresses in a list separated by newlines, spaces or commas.<br><br>WARNING: There are no validity checks.",
        run: MAC.runFormat,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Output case",
                type: "option",
                value: MAC.OUTPUT_CASE
            },
            {
                name: "No delimiter",
                type: "boolean",
                value: MAC.NO_DELIM
            },
            {
                name: "Dash delimiter",
                type: "boolean",
                value: MAC.DASH_DELIM
            },
            {
                name: "Colon delimiter",
                type: "boolean",
                value: MAC.COLON_DELIM
            },
            {
                name: "Cisco style",
                type: "boolean",
                value: MAC.CISCO_STYLE
            }
        ]
    },
    "Encode NetBIOS Name": {
        description: "NetBIOS names as seen across the client interface to NetBIOS are exactly 16 bytes long. Within the NetBIOS-over-TCP protocols, a longer representation is used.<br><br>There are two levels of encoding. The first level maps a NetBIOS name into a domain system name.  The second level maps the domain system name into the 'compressed' representation required for interaction with the domain name system.<br><br>This operation carries out the first level of encoding. See RFC 1001 for full details.",
        run: NetBIOS.runEncodeName,
        inputType: "byteArray",
        outputType: "byteArray",
        args: [
            {
                name: "Offset",
                type: "number",
                value: NetBIOS.OFFSET
            }
        ]
    },
    "Decode NetBIOS Name": {
        description: "NetBIOS names as seen across the client interface to NetBIOS are exactly 16 bytes long. Within the NetBIOS-over-TCP protocols, a longer representation is used.<br><br>There are two levels of encoding. The first level maps a NetBIOS name into a domain system name.  The second level maps the domain system name into the 'compressed' representation required for interaction with the domain name system.<br><br>This operation decodes the first level of encoding. See RFC 1001 for full details.",
        run: NetBIOS.runDecodeName,
        inputType: "byteArray",
        outputType: "byteArray",
        args: [
            {
                name: "Offset",
                type: "number",
                value: NetBIOS.OFFSET
            }
        ]
    },
    "Offset checker": {
        description: "Compares multiple inputs (separated by the specified delimiter) and highlights matching characters which appear at the same position in all samples.",
        run: StrUtils.runOffsetChecker,
        inputType: "string",
        outputType: "html",
        args: [
            {
                name: "Sample delimiter",
                type: "binaryString",
                value: StrUtils.OFF_CHK_SAMPLE_DELIMITER
            }
        ]
    },
    "Remove whitespace": {
        description: "Optionally removes all spaces, carriage returns, line feeds, tabs and form feeds from the input data.<br><br>This operation also supports the removal of full stops which are sometimes used to represent non-printable bytes in ASCII output.",
        run: Tidy.runRemoveWhitespace,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Spaces",
                type: "boolean",
                value: Tidy.REMOVE_SPACES
            },
            {
                name: "Carriage returns (\\r)",
                type: "boolean",
                value: Tidy.REMOVE_CARIAGE_RETURNS
            },
            {
                name: "Line feeds (\\n)",
                type: "boolean",
                value: Tidy.REMOVE_LINE_FEEDS
            },
            {
                name: "Tabs",
                type: "boolean",
                value: Tidy.REMOVE_TABS
            },
            {
                name: "Form feeds (\\f)",
                type: "boolean",
                value: Tidy.REMOVE_FORM_FEEDS
            },
            {
                name: "Full stops",
                type: "boolean",
                value: Tidy.REMOVE_FULL_STOPS
            }
        ]
    },
    "Remove null bytes": {
        description: "Removes all null bytes (<code>0x00</code>) from the input.",
        run: Tidy.runRemoveNulls,
        inputType: "byteArray",
        outputType: "byteArray",
        args: []
    },
    "Drop bytes": {
        description: "Cuts the specified number of bytes out of the data.",
        run: Tidy.runDropBytes,
        inputType: "byteArray",
        outputType: "byteArray",
        args: [
            {
                name: "Start",
                type: "number",
                value: Tidy.DROP_START
            },
            {
                name: "Length",
                type: "number",
                value: Tidy.DROP_LENGTH
            },
            {
                name: "Apply to each line",
                type: "boolean",
                value: Tidy.APPLY_TO_EACH_LINE
            }
        ]
    },
    "Take bytes": {
        description: "Takes a slice of the specified number of bytes from the data.",
        run: Tidy.runTakeBytes,
        inputType: "byteArray",
        outputType: "byteArray",
        args: [
            {
                name: "Start",
                type: "number",
                value: Tidy.TAKE_START
            },
            {
                name: "Length",
                type: "number",
                value: Tidy.TAKE_LENGTH
            },
            {
                name: "Apply to each line",
                type: "boolean",
                value: Tidy.APPLY_TO_EACH_LINE
            }
        ]
    },
    "Pad lines": {
        description: "Add the specified number of the specified character to the beginning or end of each line",
        run: Tidy.runPad,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Position",
                type: "option",
                value: Tidy.PAD_POSITION
            },
            {
                name: "Length",
                type: "number",
                value: Tidy.PAD_LENGTH
            },
            {
                name: "Character",
                type: "binaryShortString",
                value: Tidy.PAD_CHAR
            }
        ]
    },
    "Reverse": {
        description: "Reverses the input string.",
        run: SeqUtils.runReverse,
        inputType: "byteArray",
        outputType: "byteArray",
        args: [
            {
                name: "By",
                type: "option",
                value: SeqUtils.REVERSE_BY
            }
        ]
    },
    "Sort": {
        description: "Alphabetically sorts strings separated by the specified delimiter.<br><br>The IP address option supports IPv4 only.",
        run: SeqUtils.runSort,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Delimiter",
                type: "option",
                value: SeqUtils.DELIMITER_OPTIONS
            },
            {
                name: "Reverse",
                type: "boolean",
                value: SeqUtils.SORT_REVERSE
            },
            {
                name: "Order",
                type: "option",
                value: SeqUtils.SORT_ORDER
            }
        ]
    },
    "Unique": {
        description: "Removes duplicate strings from the input.",
        run: SeqUtils.runUnique,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Delimiter",
                type: "option",
                value: SeqUtils.DELIMITER_OPTIONS
            }
        ]
    },
    "Count occurrences": {
        description: "Counts the number of times the provided string occurs in the input.",
        run: SeqUtils.runCount,
        inputType: "string",
        outputType: "number",
        args: [
            {
                name: "Search string",
                type: "toggleString",
                value: "",
                toggleValues: SeqUtils.SEARCH_TYPE
            }
        ]
    },
    "Add line numbers": {
        description: "Adds line numbers to the output.",
        run: SeqUtils.runAddLineNumbers,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "Remove line numbers": {
        description: "Removes line numbers from the output if they can be trivially detected.",
        run: SeqUtils.runRemoveLineNumbers,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "Find / Replace": {
        description: "Replaces all occurrences of the first string with the second.<br><br> Includes support for regular expressions (regex), simple strings and extended strings (which support \\n, \\r, \\t, \\b, \\f and escaped hex bytes using \\x notation, e.g. \\x00 for a null byte).",
        run: StrUtils.runFindReplace,
        manualBake: true,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Find",
                type: "toggleString",
                value: "",
                toggleValues: StrUtils.SEARCH_TYPE
            },
            {
                name: "Replace",
                type: "binaryString",
                value: ""
            },
            {
                name: "Global match",
                type: "boolean",
                value: StrUtils.FIND_REPLACE_GLOBAL,
            },
            {
                name: "Case insensitive",
                type: "boolean",
                value: StrUtils.FIND_REPLACE_CASE,
            },
            {
                name: "Multiline matching",
                type: "boolean",
                value: StrUtils.FIND_REPLACE_MULTILINE,
            },

        ]
    },
    "To Upper case": {
        description: "Converts the input string to upper case, optionally limiting scope to only the first character in each word, sentence or paragraph.",
        run: StrUtils.runUpper,
        highlight: true,
        highlightReverse: true,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Scope",
                type: "option",
                value: StrUtils.CASE_SCOPE
            }
        ]
    },
    "To Lower case": {
        description: "Converts every character in the input to lower case.",
        run: StrUtils.runLower,
        highlight: true,
        highlightReverse: true,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "Split": {
        description: "Splits a string into sections around a given delimiter.",
        run: StrUtils.runSplit,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Split delimiter",
                type: "binaryShortString",
                value: StrUtils.SPLIT_DELIM
            },
            {
                name: "Join delimiter",
                type: "option",
                value: StrUtils.DELIMITER_OPTIONS
            }
        ]
    },
    "Filter": {
        description: "Splits up the input using the specified delimiter and then filters each branch based on a regular expression.",
        run: StrUtils.runFilter,
        manualBake: true,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Delimiter",
                type: "option",
                value: StrUtils.DELIMITER_OPTIONS
            },
            {
                name: "Regex",
                type: "string",
                value: ""
            },
            {
                name: "Invert condition",
                type: "boolean",
                value: SeqUtils.SORT_REVERSE
            },
        ]
    },
    "Strings": {
        description: "Extracts all strings from the input.",
        run: Extract.runStrings,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Minimum length",
                type: "number",
                value: Extract.MIN_STRING_LEN
            },
            {
                name: "Display total",
                type: "boolean",
                value: Extract.DISPLAY_TOTAL
            }
        ]
    },
    "Extract IP addresses": {
        description: "Extracts all IPv4 and IPv6 addresses.<br><br>Warning: Given a string <code>710.65.0.456</code>, this will match <code>10.65.0.45</code> so always check the original input!",
        run: Extract.runIp,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "IPv4",
                type: "boolean",
                value: Extract.INCLUDE_IPV4
            },
            {
                name: "IPv6",
                type: "boolean",
                value: Extract.INCLUDE_IPV6
            },
            {
                name: "Remove local IPv4 addresses",
                type: "boolean",
                value: Extract.REMOVE_LOCAL
            },
            {
                name: "Display total",
                type: "boolean",
                value: Extract.DISPLAY_TOTAL
            }
        ]
    },
    "Extract email addresses": {
        description: "Extracts all email addresses from the input.",
        run: Extract.runEmail,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Display total",
                type: "boolean",
                value: Extract.DISPLAY_TOTAL
            }
        ]
    },
    "Extract MAC addresses": {
        description: "Extracts all Media Access Control (MAC) addresses from the input.",
        run: Extract.runMac,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Display total",
                type: "boolean",
                value: Extract.DISPLAY_TOTAL
            }
        ]
    },
    "Extract URLs": {
        description: "Extracts Uniform Resource Locators (URLs) from the input. The protocol (http, ftp etc.) is required otherwise there will be far too many false positives.",
        run: Extract.runUrls,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Display total",
                type: "boolean",
                value: Extract.DISPLAY_TOTAL
            }
        ]
    },
    "Extract domains": {
        description: "Extracts domain names with common Top-Level Domains (TLDs).<br>Note that this will not include paths. Use <strong>Extract URLs</strong> to find entire URLs.",
        run: Extract.runDomains,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Display total",
                type: "boolean",
                value: Extract.DISPLAY_TOTAL
            }
        ]
    },
    "Extract file paths": {
        description: "Extracts anything that looks like a Windows or UNIX file path.<br><br>Note that if UNIX is selected, there will likely be a lot of false positives.",
        run: Extract.runFilePaths,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Windows",
                type: "boolean",
                value: Extract.INCLUDE_WIN_PATH
            },
            {
                name: "UNIX",
                type: "boolean",
                value: Extract.INCLUDE_UNIX_PATH
            },
            {
                name: "Display total",
                type: "boolean",
                value: Extract.DISPLAY_TOTAL
            }
        ]
    },
    "Extract dates": {
        description: "Extracts dates in the following formats<ul><li><code>yyyy-mm-dd</code></li><li><code>dd/mm/yyyy</code></li><li><code>mm/dd/yyyy</code></li></ul>Dividers can be any of /, -, . or space",
        run: Extract.runDates,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Display total",
                type: "boolean",
                value: Extract.DISPLAY_TOTAL
            }
        ]
    },
    "Regular expression": {
        description: "Define your own regular expression (regex) to search the input data with, optionally choosing from a list of pre-defined patterns.",
        run: StrUtils.runRegex,
        manualBake: true,
        inputType: "string",
        outputType: "html",
        args: [
            {
                name: "Built in regexes",
                type: "populateOption",
                value: StrUtils.REGEX_PRE_POPULATE,
                target: 1,
            },
            {
                name: "Regex",
                type: "text",
                value: ""
            },
            {
                name: "Case insensitive",
                type: "boolean",
                value: StrUtils.REGEX_CASE_INSENSITIVE
            },
            {
                name: "Multiline matching",
                type: "boolean",
                value: StrUtils.REGEX_MULTILINE_MATCHING
            },
            {
                name: "Display total",
                type: "boolean",
                value: StrUtils.DISPLAY_TOTAL
            },
            {
                name: "Output format",
                type: "option",
                value: StrUtils.OUTPUT_FORMAT
            },
        ]
    },
    "XPath expression": {
        description: "Extract information from an XML document with an XPath query",
        run: Code.runXpath,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "XPath",
                type: "string",
                value: Code.XPATH_INITIAL
            },
            {
                name: "Result delimiter",
                type: "binaryShortString",
                value: Code.XPATH_DELIMITER
            }
        ]
    },
    "JPath expression": {
        description: "Extract information from a JSON object with a JPath query.",
        run: Code.runJpath,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Query",
                type: "string",
                value: Code.JPATH_INITIAL
            },
            {
                name: "Result delimiter",
                type: "binaryShortString",
                value: Code.JPATH_DELIMITER
            }
        ]
    },
    "CSS selector": {
        description: "Extract information from an HTML document with a CSS selector",
        run: Code.runCSSQuery,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "CSS selector",
                type: "string",
                value: Code.CSS_SELECTOR_INITIAL
            },
            {
                name: "Delimiter",
                type: "binaryShortString",
                value: Code.CSS_QUERY_DELIMITER
            },
        ]
    },
    "From UNIX Timestamp": {
        description: "Converts a UNIX timestamp to a datetime string.<br><br>e.g. <code>978346800</code> becomes <code>Mon 1 January 2001 11:00:00 UTC</code><br><br>A UNIX timestamp is a 32-bit value representing the number of seconds since January 1, 1970 UTC (the UNIX epoch).",
        run: DateTime.runFromUnixTimestamp,
        inputType: "number",
        outputType: "string",
        args: [
            {
                name: "Units",
                type: "option",
                value: DateTime.UNITS
            }
        ]
    },
    "To UNIX Timestamp": {
        description: "Parses a datetime string in UTC and returns the corresponding UNIX timestamp.<br><br>e.g. <code>Mon 1 January 2001 11:00:00</code> becomes <code>978346800</code><br><br>A UNIX timestamp is a 32-bit value representing the number of seconds since January 1, 1970 UTC (the UNIX epoch).",
        run: DateTime.runToUnixTimestamp,
        inputType: "string",
        outputType: "number",
        args: [
            {
                name: "Units",
                type: "option",
                value: DateTime.UNITS
            },
            {
                name: "Treat as UTC",
                type: "boolean",
                value: DateTime.TREAT_AS_UTC
            }
        ]
    },
    "Windows Filetime to UNIX Timestamp": {
        description: "Converts a Windows Filetime value to a UNIX timestamp.<br><br>A Windows Filetime is a 64-bit value representing the number of 100-nanosecond intervals since January 1, 1601 UTC.<br><br>A UNIX timestamp is a 32-bit value representing the number of seconds since January 1, 1970 UTC (the UNIX epoch).<br><br>This operation also supports UNIX timestamps in milliseconds, microseconds and nanoseconds.",
        run: DateTime.runFromFiletimeToUnix,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Output units",
                type: "option",
                value: DateTime.UNITS
            },
            {
                name: "Input format",
                type: "option",
                value: DateTime.FILETIME_FORMATS
            }
        ]
    },
    "UNIX Timestamp to Windows Filetime": {
        description: "Converts a UNIX timestamp to a Windows Filetime value.<br><br>A Windows Filetime is a 64-bit value representing the number of 100-nanosecond intervals since January 1, 1601 UTC.<br><br>A UNIX timestamp is a 32-bit value representing the number of seconds since January 1, 1970 UTC (the UNIX epoch).<br><br>This operation also supports UNIX timestamps in milliseconds, microseconds and nanoseconds.",
        run: DateTime.runToFiletimeFromUnix,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Input units",
                type: "option",
                value: DateTime.UNITS
            },
            {
                name: "Output format",
                type: "option",
                value: DateTime.FILETIME_FORMATS
            }
        ]
    },
    "Translate DateTime Format": {
        description: "Parses a datetime string in one format and re-writes it in another.<br><br>Run with no input to see the relevant format string examples.",
        run: DateTime.runTranslateFormat,
        inputType: "string",
        outputType: "html",
        args: [
            {
                name: "Built in formats",
                type: "populateOption",
                value: DateTime.DATETIME_FORMATS,
                target: 1
            },
            {
                name: "Input format string",
                type: "binaryString",
                value: DateTime.INPUT_FORMAT_STRING
            },
            {
                name: "Input timezone",
                type: "option",
                value: DateTime.TIMEZONES
            },
            {
                name: "Output format string",
                type: "binaryString",
                value: DateTime.OUTPUT_FORMAT_STRING
            },
            {
                name: "Output timezone",
                type: "option",
                value: DateTime.TIMEZONES
            }
        ]
    },
    "Parse DateTime": {
        description: "Parses a DateTime string in your specified format and displays it in whichever timezone you choose with the following information:<ul><li>Date</li><li>Time</li><li>Period (AM/PM)</li><li>Timezone</li><li>UTC offset</li><li>Daylight Saving Time</li><li>Leap year</li><li>Days in this month</li><li>Day of year</li><li>Week number</li><li>Quarter</li></ul>Run with no input to see format string examples if required.",
        run: DateTime.runParse,
        inputType: "string",
        outputType: "html",
        args: [
            {
                name: "Built in formats",
                type: "populateOption",
                value: DateTime.DATETIME_FORMATS,
                target: 1
            },
            {
                name: "Input format string",
                type: "binaryString",
                value: DateTime.INPUT_FORMAT_STRING
            },
            {
                name: "Input timezone",
                type: "option",
                value: DateTime.TIMEZONES
            },
        ]
    },
    "Convert distance": {
        description: "Converts a unit of distance to another format.",
        run: Convert.runDistance,
        inputType: "number",
        outputType: "number",
        args: [
            {
                name: "Input units",
                type: "option",
                value: Convert.DISTANCE_UNITS
            },
            {
                name: "Output units",
                type: "option",
                value: Convert.DISTANCE_UNITS
            }
        ]
    },
    "Convert area": {
        description: "Converts a unit of area to another format.",
        run: Convert.runArea,
        inputType: "number",
        outputType: "number",
        args: [
            {
                name: "Input units",
                type: "option",
                value: Convert.AREA_UNITS
            },
            {
                name: "Output units",
                type: "option",
                value: Convert.AREA_UNITS
            }
        ]
    },
    "Convert mass": {
        description: "Converts a unit of mass to another format.",
        run: Convert.runMass,
        inputType: "number",
        outputType: "number",
        args: [
            {
                name: "Input units",
                type: "option",
                value: Convert.MASS_UNITS
            },
            {
                name: "Output units",
                type: "option",
                value: Convert.MASS_UNITS
            }
        ]
    },
    "Convert speed": {
        description: "Converts a unit of speed to another format.",
        run: Convert.runSpeed,
        inputType: "number",
        outputType: "number",
        args: [
            {
                name: "Input units",
                type: "option",
                value: Convert.SPEED_UNITS
            },
            {
                name: "Output units",
                type: "option",
                value: Convert.SPEED_UNITS
            }
        ]
    },
    "Convert data units": {
        description: "Converts a unit of data to another format.",
        run: Convert.runDataSize,
        inputType: "number",
        outputType: "number",
        args: [
            {
                name: "Input units",
                type: "option",
                value: Convert.DATA_UNITS
            },
            {
                name: "Output units",
                type: "option",
                value: Convert.DATA_UNITS
            }
        ]
    },
    "Raw Deflate": {
        description: "Compresses data using the deflate algorithm with no headers.",
        run: Compress.runRawDeflate,
        inputType: "byteArray",
        outputType: "byteArray",
        args: [
            {
                name: "Compression type",
                type: "option",
                value: Compress.COMPRESSION_TYPE
            }
        ]
    },
    "Raw Inflate": {
        description: "Decompresses data which has been compressed using the deflate algorithm with no headers.",
        run: Compress.runRawInflate,
        inputType: "byteArray",
        outputType: "byteArray",
        args: [
            {
                name: "Start index",
                type: "number",
                value: Compress.INFLATE_INDEX
            },
            {
                name: "Initial output buffer size",
                type: "number",
                value: Compress.INFLATE_BUFFER_SIZE
            },
            {
                name: "Buffer expansion type",
                type: "option",
                value: Compress.INFLATE_BUFFER_TYPE
            },
            {
                name: "Resize buffer after decompression",
                type: "boolean",
                value: Compress.INFLATE_RESIZE
            },
            {
                name: "Verify result",
                type: "boolean",
                value: Compress.INFLATE_VERIFY
            }
        ]
    },
    "Zlib Deflate": {
        description: "Compresses data using the deflate algorithm adding zlib headers.",
        run: Compress.runZlibDeflate,
        inputType: "byteArray",
        outputType: "byteArray",
        args: [
            {
                name: "Compression type",
                type: "option",
                value: Compress.COMPRESSION_TYPE
            }
        ]
    },
    "Zlib Inflate": {
        description: "Decompresses data which has been compressed using the deflate algorithm with zlib headers.",
        run: Compress.runZlibInflate,
        inputType: "byteArray",
        outputType: "byteArray",
        args: [
            {
                name: "Start index",
                type: "number",
                value: Compress.INFLATE_INDEX
            },
            {
                name: "Initial output buffer size",
                type: "number",
                value: Compress.INFLATE_BUFFER_SIZE
            },
            {
                name: "Buffer expansion type",
                type: "option",
                value: Compress.INFLATE_BUFFER_TYPE
            },
            {
                name: "Resize buffer after decompression",
                type: "boolean",
                value: Compress.INFLATE_RESIZE
            },
            {
                name: "Verify result",
                type: "boolean",
                value: Compress.INFLATE_VERIFY
            }
        ]
    },
    "Gzip": {
        description: "Compresses data using the deflate algorithm with gzip headers.",
        run: Compress.runGzip,
        inputType: "byteArray",
        outputType: "byteArray",
        args: [
            {
                name: "Compression type",
                type: "option",
                value: Compress.COMPRESSION_TYPE
            },
            {
                name: "Filename (optional)",
                type: "string",
                value: ""
            },
            {
                name: "Comment (optional)",
                type: "string",
                value: ""
            },
            {
                name: "Include file checksum",
                type: "boolean",
                value: Compress.GZIP_CHECKSUM
            }
        ]
    },
    "Gunzip": {
        description: "Decompresses data which has been compressed using the deflate algorithm with gzip headers.",
        run: Compress.runGunzip,
        inputType: "byteArray",
        outputType: "byteArray",
        args: []
    },
    "Zip": {
        description: "Compresses data using the PKZIP algorithm with the given filename.<br><br>No support for multiple files at this time.",
        run: Compress.runPkzip,
        inputType: "byteArray",
        outputType: "byteArray",
        args: [
            {
                name: "Filename",
                type: "string",
                value: Compress.PKZIP_FILENAME
            },
            {
                name: "Comment",
                type: "string",
                value: ""
            },
            {
                name: "Password",
                type: "binaryString",
                value: ""
            },
            {
                name: "Compression method",
                type: "option",
                value: Compress.COMPRESSION_METHOD
            },
            {
                name: "Operating system",
                type: "option",
                value: Compress.OS
            },
            {
                name: "Compression type",
                type: "option",
                value: Compress.COMPRESSION_TYPE
            }
        ]
    },
    "Unzip": {
        description: "Decompresses data using the PKZIP algorithm and displays it per file, with support for passwords.",
        run: Compress.runPkunzip,
        inputType: "byteArray",
        outputType: "html",
        args: [
            {
                name: "Password",
                type: "binaryString",
                value: ""
            },
            {
                name: "Verify result",
                type: "boolean",
                value: Compress.PKUNZIP_VERIFY
            }
        ]
    },
    "Bzip2 Decompress": {
        description: "Decompresses data using the Bzip2 algorithm.",
        run: Compress.runBzip2Decompress,
        inputType: "byteArray",
        outputType: "string",
        args: []
    },
    "Generic Code Beautify": {
        description: "Attempts to pretty print C-style languages such as C, C++, C#, Java, PHP, JavaScript etc.<br><br>This will not do a perfect job, and the resulting code may not work any more. This operation is designed purely to make obfuscated or minified code more easy to read and understand.<br><br>Things which will not work properly:<ul><li>For loop formatting</li><li>Do-While loop formatting</li><li>Switch/Case indentation</li><li>Certain bit shift operators</li></ul>",
        run: Code.runGenericBeautify,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "JavaScript Parser": {
        description: "Returns an Abstract Syntax Tree for valid JavaScript code.",
        run: JS.runParse,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Location info",
                type: "boolean",
                value: JS.PARSE_LOC
            },
            {
                name: "Range info",
                type: "boolean",
                value: JS.PARSE_RANGE
            },
            {
                name: "Include tokens array",
                type: "boolean",
                value: JS.PARSE_TOKENS
            },
            {
                name: "Include comments array",
                type: "boolean",
                value: JS.PARSE_COMMENT
            },
            {
                name: "Report errors and try to continue",
                type: "boolean",
                value: JS.PARSE_TOLERANT
            },
        ]
    },
    "JavaScript Beautify": {
        description: "Parses and pretty prints valid JavaScript code. Also works with JavaScript Object Notation (JSON).",
        run: JS.runBeautify,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Indent string",
                type: "binaryShortString",
                value: JS.BEAUTIFY_INDENT
            },
            {
                name: "Quotes",
                type: "option",
                value: JS.BEAUTIFY_QUOTES
            },
            {
                name: "Semicolons before closing braces",
                type: "boolean",
                value: JS.BEAUTIFY_SEMICOLONS
            },
            {
                name: "Include comments",
                type: "boolean",
                value: JS.BEAUTIFY_COMMENT
            },
        ]
    },
    "JavaScript Minify": {
        description: "Compresses JavaScript code.",
        run: JS.runMinify,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "XML Beautify": {
        description: "Indents and prettifies eXtensible Markup Language (XML) code.",
        run: Code.runXmlBeautify,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Indent string",
                type: "binaryShortString",
                value: Code.BEAUTIFY_INDENT
            }
        ]
    },
    "JSON Beautify": {
        description: "Indents and prettifies JavaScript Object Notation (JSON) code.",
        run: Code.runJsonBeautify,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Indent string",
                type: "binaryShortString",
                value: Code.BEAUTIFY_INDENT
            }
        ]
    },
    "CSS Beautify": {
        description: "Indents and prettifies Cascading Style Sheets (CSS) code.",
        run: Code.runCssBeautify,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Indent string",
                type: "binaryShortString",
                value: Code.BEAUTIFY_INDENT
            }
        ]
    },
    "SQL Beautify": {
        description: "Indents and prettifies Structured Query Language (SQL) code.",
        run: Code.runSqlBeautify,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Indent string",
                type: "binaryShortString",
                value: Code.BEAUTIFY_INDENT
            }
        ]
    },
    "XML Minify": {
        description: "Compresses eXtensible Markup Language (XML) code.",
        run: Code.runXmlMinify,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Preserve comments",
                type: "boolean",
                value: Code.PRESERVE_COMMENTS
            }
        ]
    },
    "JSON Minify": {
        description: "Compresses JavaScript Object Notation (JSON) code.",
        run: Code.runJsonMinify,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "CSS Minify": {
        description: "Compresses Cascading Style Sheets (CSS) code.",
        run: Code.runCssMinify,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Preserve comments",
                type: "boolean",
                value: Code.PRESERVE_COMMENTS
            }
        ]
    },
    "SQL Minify": {
        description: "Compresses Structured Query Language (SQL) code.",
        run: Code.runSqlMinify,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "Analyse hash": {
        description: "Tries to determine information about a given hash and suggests which algorithm may have been used to generate it based on its length.",
        run: Hash.runAnalyse,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "MD2": {
        description: "The MD2 (Message-Digest 2) algorithm is a cryptographic hash function developed by Ronald Rivest in 1989. The algorithm is optimized for 8-bit computers.<br><br>Although MD2 is no longer considered secure, even as of 2014, it remains in use in public key infrastructures as part of certificates generated with MD2 and RSA.",
        run: Hash.runMD2,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "MD4": {
        description: "The MD4 (Message-Digest 4) algorithm is a cryptographic hash function developed by Ronald Rivest in 1990. The digest length is 128 bits. The algorithm has influenced later designs, such as the MD5, SHA-1 and RIPEMD algorithms.<br><br>The security of MD4 has been severely compromised.",
        run: Hash.runMD4,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "MD5": {
        description: "MD5 (Message-Digest 5) is a widely used hash function. It has been used in a variety of security applications and is also commonly used to check the integrity of files.<br><br>However, MD5 is not collision resistant and it isn't suitable for applications like SSL/TLS certificates or digital signatures that rely on this property.",
        run: Hash.runMD5,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "SHA0": {
        description: "SHA-0 is a retronym applied to the original version of the 160-bit hash function published in 1993 under the name 'SHA'. It was withdrawn shortly after publication due to an undisclosed 'significant flaw' and replaced by the slightly revised version SHA-1.",
        run: Hash.runSHA0,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "SHA1": {
        description: "The SHA (Secure Hash Algorithm) hash functions were designed by the NSA. SHA-1 is the most established of the existing SHA hash functions and it is used in a variety of security applications and protocols.<br><br>However, SHA-1's collision resistance has been weakening as new attacks are discovered or improved.",
        run: Hash.runSHA1,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "SHA224": {
        description: "SHA-224 is largely identical to SHA-256 but is truncated to 224 bytes.",
        run: Hash.runSHA224,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "SHA256": {
        description: "SHA-256 is one of the four variants in the SHA-2 set. It isn't as widely used as SHA-1, though it provides much better security.",
        run: Hash.runSHA256,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "SHA384": {
        description: "SHA-384 is largely identical to SHA-512 but is truncated to 384 bytes.",
        run: Hash.runSHA384,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "SHA512": {
        description: "SHA-512 is largely identical to SHA-256 but operates on 64-bit words rather than 32.",
        run: Hash.runSHA512,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "SHA3": {
        description: "This is an implementation of Keccak[c=2d]. SHA3 functions based on different implementations of Keccak will give different results.",
        run: Hash.runSHA3,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Output length",
                type: "option",
                value: Hash.SHA3_LENGTH
            }
        ]
    },
    "RIPEMD-160": {
        description: "RIPEMD (RACE Integrity Primitives Evaluation Message Digest) is a family of cryptographic hash functions developed in Leuven, Belgium, by Hans Dobbertin, Antoon Bosselaers and Bart Preneel at the COSIC research group at the Katholieke Universiteit Leuven, and first published in 1996.<br><br>RIPEMD was based upon the design principles used in MD4, and is similar in performance to the more popular SHA-1.<br><br>RIPEMD-160 is an improved, 160-bit version of the original RIPEMD, and the most common version in the family.",
        run: Hash.runRIPEMD160,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "HMAC": {
        description: "Keyed-Hash Message Authentication Codes (HMAC) are a mechanism for message authentication using cryptographic hash functions.",
        run: Hash.runHMAC,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Password",
                type: "binaryString",
                value: ""
            },
            {
                name: "Hashing function",
                type: "option",
                value: Hash.HMAC_FUNCTIONS
            },
        ]
    },
    "Fletcher-8 Checksum": {
        description: "The Fletcher checksum is an algorithm for computing a position-dependent checksum devised by John Gould Fletcher at Lawrence Livermore Labs in the late 1970s.<br><br>The objective of the Fletcher checksum was to provide error-detection properties approaching those of a cyclic redundancy check but with the lower computational effort associated with summation techniques.",
        run: Checksum.runFletcher8,
        inputType: "byteArray",
        outputType: "string",
        args: []
    },
    "Fletcher-16 Checksum": {
        description: "The Fletcher checksum is an algorithm for computing a position-dependent checksum devised by John Gould Fletcher at Lawrence Livermore Labs in the late 1970s.<br><br>The objective of the Fletcher checksum was to provide error-detection properties approaching those of a cyclic redundancy check but with the lower computational effort associated with summation techniques.",
        run: Checksum.runFletcher16,
        inputType: "byteArray",
        outputType: "string",
        args: []
    },
    "Fletcher-32 Checksum": {
        description: "The Fletcher checksum is an algorithm for computing a position-dependent checksum devised by John Gould Fletcher at Lawrence Livermore Labs in the late 1970s.<br><br>The objective of the Fletcher checksum was to provide error-detection properties approaching those of a cyclic redundancy check but with the lower computational effort associated with summation techniques.",
        run: Checksum.runFletcher32,
        inputType: "byteArray",
        outputType: "string",
        args: []
    },
    "Fletcher-64 Checksum": {
        description: "The Fletcher checksum is an algorithm for computing a position-dependent checksum devised by John Gould Fletcher at Lawrence Livermore Labs in the late 1970s.<br><br>The objective of the Fletcher checksum was to provide error-detection properties approaching those of a cyclic redundancy check but with the lower computational effort associated with summation techniques.",
        run: Checksum.runFletcher64,
        inputType: "byteArray",
        outputType: "string",
        args: []
    },
    "Adler-32 Checksum": {
        description: "Adler-32 is a checksum algorithm which was invented by Mark Adler in 1995, and is a modification of the Fletcher checksum. Compared to a cyclic redundancy check of the same length, it trades reliability for speed (preferring the latter).<br><br>Adler-32 is more reliable than Fletcher-16, and slightly less reliable than Fletcher-32.",
        run: Checksum.runAdler32,
        inputType: "byteArray",
        outputType: "string",
        args: []
    },
    "CRC-32 Checksum": {
        description: "A cyclic redundancy check (CRC) is an error-detecting code commonly used in digital networks and storage devices to detect accidental changes to raw data.<br><br>The CRC was invented by W. Wesley Peterson in 1961; the 32-bit CRC function of Ethernet and many other standards is the work of several researchers and was published in 1975.",
        run: Checksum.runCRC32,
        inputType: "byteArray",
        outputType: "string",
        args: []
    },
    "Generate all hashes": {
        description: "Generates all available hashes and checksums for the input.",
        run: Hash.runAll,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "Entropy": {
        description: "Calculates the Shannon entropy of the input data which gives an idea of its randomness. 8 is the maximum.",
        run: Entropy.runEntropy,
        inputType: "byteArray",
        outputType: "html",
        args: [
            {
                name: "Chunk size",
                type: "number",
                value: Entropy.CHUNK_SIZE
            }
        ]
    },
    "Frequency distribution": {
        description: "Displays the distribution of bytes in the data as a graph.",
        run: Entropy.runFreqDistrib,
        inputType: "byteArray",
        outputType: "html",
        args: [
            {
                name: "Show 0%'s",
                type: "boolean",
                value: Entropy.FREQ_ZEROS
            }
        ]
    },
    "Numberwang": {
        description: "Based on the popular gameshow by Mitchell and Webb.",
        run: Numberwang.run,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "Parse X.509 certificate": {
        description: "X.509 is an ITU-T standard for a public key infrastructure (PKI) and Privilege Management Infrastructure (PMI). It is commonly involved with SSL/TLS security.<br><br>This operation displays the contents of a certificate in a human readable format, similar to the openssl command line tool.",
        run: PublicKey.runParseX509,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Input format",
                type: "option",
                value: PublicKey.X509_INPUT_FORMAT
            }
        ]
    },
    "PEM to Hex": {
        description: "Converts PEM (Privacy Enhanced Mail) format to a hexadecimal DER (Distinguished Encoding Rules) string.",
        run: PublicKey.runPemToHex,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "Hex to PEM": {
        description: "Converts a hexadecimal DER (Distinguished Encoding Rules) string into PEM (Privacy Enhanced Mail) format.",
        run: PublicKey.runHexToPem,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Header string",
                type: "string",
                value: PublicKey.PEM_HEADER_STRING
            }
        ]
    },
    "Hex to Object Identifier": {
        description: "Converts a hexadecimal string into an object identifier (OID).",
        run: PublicKey.runHexToObjectIdentifier,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "Object Identifier to Hex": {
        description: "Converts an object identifier (OID) into a hexadecimal string.",
        run: PublicKey.runObjectIdentifierToHex,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "Parse ASN.1 hex string": {
        description: "Abstract Syntax Notation One (ASN.1) is a standard and notation that describes rules and structures for representing, encoding, transmitting, and decoding data in telecommunications and computer networking.<br><br>This operation parses arbitrary ASN.1 data and presents the resulting tree.",
        run: PublicKey.runParseAsn1HexString,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Starting index",
                type: "number",
                value: 0
            },
            {
                name: "Truncate octet strings longer than",
                type: "number",
                value: PublicKey.ASN1_TRUNCATE_LENGTH
            }
        ]
    },
    "Detect File Type": {
        description: "Attempts to guess the MIME (Multipurpose Internet Mail Extensions) type of the data based on 'magic bytes'.<br><br>Currently supports the following file types: 7z, amr, avi, bmp, bz2, class, cr2, crx, dex, dmg, doc, elf, eot, epub, exe, flac, flv, gif, gz, ico, iso, jpg, jxr, m4a, m4v, mid, mkv, mov, mp3, mp4, mpg, ogg, otf, pdf, png, ppt, ps, psd, rar, rtf, sqlite, swf, tar, tar.z, tif, ttf, utf8, vmdk, wav, webm, webp, wmv, woff, woff2, xls, xz, zip.",
        run: FileType.runDetect,
        inputType: "byteArray",
        outputType: "string",
        args: []
    },
    "Scan for Embedded Files": {
        description: "Scans the data for potential embedded files by looking for magic bytes at all offsets. This operation is prone to false positives.<br><br>WARNING: Files over about 100KB in size will take a VERY long time to process.",
        run: FileType.runScanForEmbeddedFiles,
        inputType: "byteArray",
        outputType: "string",
        args: [
            {
                name: "Ignore common byte sequences",
                type: "boolean",
                value: FileType.IGNORE_COMMON_BYTE_SEQUENCES
            }
        ]
    },
    "Expand alphabet range": {
        description: "Expand an alphabet range string into a list of the characters in that range.<br><br>e.g. <code>a-z</code> becomes <code>abcdefghijklmnopqrstuvwxyz</code>.",
        run: SeqUtils.runExpandAlphRange,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Delimiter",
                type: "binaryString",
                value: ""
            }
        ]
    },
    "Diff": {
        description: "Compares two inputs (separated by the specified delimiter) and highlights the differences between them.",
        run: StrUtils.runDiff,
        inputType: "string",
        outputType: "html",
        args: [
            {
                name: "Sample delimiter",
                type: "binaryString",
                value: StrUtils.DIFF_SAMPLE_DELIMITER
            },
            {
                name: "Diff by",
                type: "option",
                value: StrUtils.DIFF_BY
            },
            {
                name: "Show added",
                type: "boolean",
                value: true
            },
            {
                name: "Show removed",
                type: "boolean",
                value: true
            },
            {
                name: "Ignore whitespace (relevant for word and line)",
                type: "boolean",
                value: false
            }
        ]
    },
    "Parse UNIX file permissions": {
        description: "Given a UNIX/Linux file permission string in octal or textual format, this operation explains which permissions are granted to which user groups.<br><br>Input should be in either octal (e.g. <code>755</code>) or textual (e.g. <code>drwxr-xr-x</code>) format.",
        run: OS.runParseUnixPerms,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "Swap endianness": {
        description: "Switches the data from big-endian to little-endian or vice-versa. Data can be read in as hexadecimal or raw bytes. It will be returned in the same format as it is entered.",
        run: Endian.runSwapEndianness,
        highlight: true,
        highlightReverse: true,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Data format",
                type: "option",
                value: Endian.DATA_FORMAT
            },
            {
                name: "Word length (bytes)",
                type: "number",
                value: Endian.WORD_LENGTH
            },
            {
                name: "Pad incomplete words",
                type: "boolean",
                value: Endian.PAD_INCOMPLETE_WORDS
            }
        ]
    },
    "Syntax highlighter": {
        description: "Adds syntax highlighting to a range of source code languages. Note that this will not indent the code. Use one of the 'Beautify' operations for that.",
        run: Code.runSyntaxHighlight,
        highlight: true,
        highlightReverse: true,
        inputType: "string",
        outputType: "html",
        args: [
            {
                name: "Language/File extension",
                type: "option",
                value: Code.LANGUAGES
            },
            {
                name: "Display line numbers",
                type: "boolean",
                value: Code.LINE_NUMS
            }
        ]
    },
    "TCP/IP Checksum": {
        description: "Calculates the checksum for a TCP (Transport Control Protocol) or IP (Internet Protocol) header from an input of raw bytes.",
        run: Checksum.runTCPIP,
        inputType: "byteArray",
        outputType: "string",
        args: []
    },
    "Parse colour code": {
        description: "Converts a colour code in a standard format to other standard formats and displays the colour itself.<br><br><strong>Example inputs</strong><ul><li><code>#d9edf7</code></li><li><code>rgba(217,237,247,1)</code></li><li><code>hsla(200,65%,91%,1)</code></li><li><code>cmyk(0.12, 0.04, 0.00, 0.03)</code></li></ul>",
        run: HTML.runParseColourCode,
        inputType: "string",
        outputType: "html",
        args: []
    },
    "Generate UUID": {
        description: "Generates an RFC 4122 version 4 compliant Universally Unique Identifier (UUID), also known as a Globally Unique Identifier (GUID).<br><br>A version 4 UUID relies on random numbers, in this case generated using <code>window.crypto</code> if available and falling back to <code>Math.random</code> if not.",
        run: UUID.runGenerateV4,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "Substitute": {
        description: "A substitution cipher allowing you to specify bytes to replace with other byte values. This can be used to create Caesar ciphers but is more powerful as any byte value can be substituted, not just letters, and the substitution values need not be in order.<br><br>Enter the bytes you want to replace in the Plaintext field and the bytes to replace them with in the Ciphertext field.<br><br>Non-printable bytes can be specified using string escape notation. For example, a line feed character can be written as either <code>\\n</code> or <code>\\x0a</code>.<br><br>Byte ranges can be specified using a hyphen. For example, the sequence <code>0123456789</code> can be written as <code>0-9</code>.",
        run: Cipher.runSubstitute,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Plaintext",
                type: "binaryString",
                value: Cipher.SUBS_PLAINTEXT
            },
            {
                name: "Ciphertext",
                type: "binaryString",
                value: Cipher.SUBS_CIPHERTEXT
            }
        ]
    },
    "Escape string": {
        description: "Escapes special characters in a string so that they do not cause conflicts. For example, <code>Don't stop me now</code> becomes <code>Don\\'t stop me now</code>.",
        run: StrUtils.runEscape,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "Unescape string": {
        description: "Unescapes characters in a string that have been escaped. For example, <code>Don\\'t stop me now</code> becomes <code>Don't stop me now</code>.",
        run: StrUtils.runUnescape,
        inputType: "string",
        outputType: "string",
        args: []
    },
    "To Morse Code": {
        description: "Translates alphanumeric characters into International Morse Code.<br><br>Ignores non-Morse characters.<br><br>e.g. <code>SOS</code> becomes <code>... --- ...</code>",
        run: MorseCode.runTo,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Format options",
                type: "option",
                value: MorseCode.FORMAT_OPTIONS
            },
            {
                name: "Letter delimiter",
                type: "option",
                value: MorseCode.LETTER_DELIM_OPTIONS
            },
            {
                name: "Word delimiter",
                type: "option",
                value: MorseCode.WORD_DELIM_OPTIONS
            }
        ]
    },
    "From Morse Code": {
        description: "Translates Morse Code into (upper case) alphanumeric characters.",
        run: MorseCode.runFrom,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Letter delimiter",
                type: "option",
                value: MorseCode.LETTER_DELIM_OPTIONS
            },
            {
                name: "Word delimiter",
                type: "option",
                value: MorseCode.WORD_DELIM_OPTIONS
            }
        ]
    },
    "Tar": {
        description: "Packs the input into a tarball.<br><br>No support for multiple files at this time.",
        run: Compress.runTar,
        inputType: "byteArray",
        outputType: "byteArray",
        args: [
            {
                name: "Filename",
                type: "string",
                value: Compress.TAR_FILENAME
            }
        ]
    },
    "Untar": {
        description: "Unpacks a tarball and displays it per file.",
        run: Compress.runUntar,
        inputType: "byteArray",
        outputType: "html",
        args: [
        ]
    },
    "Head": {
        description: [
            "Like the UNIX head utility.",
            "<br>",
            "Gets the first n lines.",
            "<br>",
            "You can select all but the last n lines by entering a negative value for n.",
            "<br>",
            "The delimiter can be changed so that instead of lines, fields (i.e. commas) are selected instead.",
        ].join("\n"),
        run: StrUtils.runHead,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Delimiter",
                type: "option",
                value: StrUtils.DELIMITER_OPTIONS
            },
            {
                name: "Number",
                type: "number",
                value: 10,
            },
        ]
    },
    "Tail": {
        description: [
            "Like the UNIX tail utility.",
            "<br>",
            "Gets the last n lines.",
            "<br>",
            "Optionally you can select all lines after line n by entering a negative value for n.",
            "<br>",
            "The delimiter can be changed so that instead of lines, fields (i.e. commas) are selected instead.",
        ].join("\n"),
        run: StrUtils.runTail,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Delimiter",
                type: "option",
                value: StrUtils.DELIMITER_OPTIONS
            },
            {
                name: "Number",
                type: "number",
                value: 10,
            },
        ]
    },
    "To Snake case": {
        description: [
            "Converts the input string to snake case.",
            "<br><br>",
            "Snake case is all lower case with underscores as word boundaries.",
            "<br><br>",
            "e.g. this_is_snake_case",
            "<br><br>",
            "'Attempt to be context aware' will make the operation attempt to nicely transform variable and function names.",
        ].join("\n"),
        run: Code.runToSnakeCase,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Attempt to be context aware",
                type: "boolean",
                value: false,
            },
        ]
    },
    "To Camel case": {
        description: [
            "Converts the input string to camel case.",
            "<br><br>",
            "Camel case is all lower case except letters after word boundaries which are uppercase.",
            "<br><br>",
            "e.g. thisIsCamelCase",
            "<br><br>",
            "'Attempt to be context aware' will make the operation attempt to nicely transform variable and function names.",
        ].join("\n"),
        run: Code.runToCamelCase,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Attempt to be context aware",
                type: "boolean",
                value: false,
            },
        ]
    },
    "To Kebab case": {
        description: [
            "Converts the input string to kebab case.",
            "<br><br>",
            "Kebab case is all lower case with dashes as word boundaries.",
            "<br><br>",
            "e.g. this-is-kebab-case",
            "<br><br>",
            "'Attempt to be context aware' will make the operation attempt to nicely transform variable and function names.",
        ].join("\n"),
        run: Code.runToKebabCase,
        inputType: "string",
        outputType: "string",
        args: [
            {
                name: "Attempt to be context aware",
                type: "boolean",
                value: false,
            },
        ]
    },
    "Extract EXIF": {
        description: [
            "Extracts EXIF data from an image.",
            "<br><br>",
            "EXIF data is metadata embedded in images (JPEG, JPG, TIFF) and audio files.",
            "<br><br>",
            "EXIF data from photos usually contains information about the image file itself as well as the device used to create it.",
        ].join("\n"),
        run: Image.runExtractEXIF,
        inputType: "byteArray",
        outputType: "string",
        args: [],
    },
    "Render Image": {
        description: "Displays the input as an image. Supports the following formats:<br><br><ul><li>jpg/jpeg</li><li>png</li><li>gif</li><li>webp</li><li>bmp</li><li>ico</li></ul>",
        run: Image.runRenderImage,
        inputType: "string",
        outputType: "html",
        args: [
            {
                name: "Input format",
                type: "option",
                value: Image.INPUT_FORMAT
            }
        ]
    },
    "Remove EXIF": {
        description: [
            "Removes EXIF data from a JPEG image.",
            "<br><br>",
            "EXIF data embedded in photos usually contains information about the image file itself as well as the device used to create it.",
        ].join("\n"),
        run: Image.runRemoveEXIF,
        inputType: "byteArray",
        outputType: "byteArray",
        args: []
    },
    "HTTP request": {
        description: [
            "Makes an HTTP request and returns the response.",
            "<br><br>",
            "This operation supports different HTTP verbs like GET, POST, PUT, etc.",
            "<br><br>",
            "You can add headers line by line in the format <code>Key: Value</code>",
            "<br><br>",
            "The status code of the response, along with a limited selection of exposed headers, can be viewed by checking the 'Show response metadata' option. Only a limited set of response headers are exposed by the browser for security reasons.",
        ].join("\n"),
        run: HTTP.runHTTPRequest,
        inputType: "string",
        outputType: "string",
        manualBake: true,
        args: [
            {
                name: "Method",
                type: "option",
                value: HTTP.METHODS,
            },
            {
                name: "URL",
                type: "string",
                value: "",
            },
            {
                name: "Headers",
                type: "text",
                value: "",
            },
            {
                name: "Mode",
                type: "option",
                value: HTTP.MODE,
            },
            {
                name: "Show response metadata",
                type: "boolean",
                value: false,
            }
        ]
    },
    "From BCD": {
        description: "Binary-Coded Decimal (BCD) is a class of binary encodings of decimal numbers where each decimal digit is represented by a fixed number of bits, usually four or eight. Special bit patterns are sometimes used for a sign.",
        run: BCD.runFromBCD,
        inputType: "string",
        outputType: "number",
        args: [
            {
                name: "Scheme",
                type: "option",
                value: BCD.ENCODING_SCHEME
            },
            {
                name: "Packed",
                type: "boolean",
                value: true
            },
            {
                name: "Signed",
                type: "boolean",
                value: false
            },
            {
                name: "Input format",
                type: "option",
                value: BCD.FORMAT
            }
        ]

    },
    "To BCD": {
        description: "Binary-Coded Decimal (BCD) is a class of binary encodings of decimal numbers where each decimal digit is represented by a fixed number of bits, usually four or eight. Special bit patterns are sometimes used for a sign",
        run: BCD.runToBCD,
        inputType: "number",
        outputType: "string",
        args: [
            {
                name: "Scheme",
                type: "option",
                value: BCD.ENCODING_SCHEME
            },
            {
                name: "Packed",
                type: "boolean",
                value: true
            },
            {
                name: "Signed",
                type: "boolean",
                value: false
            },
            {
                name: "Output format",
                type: "option",
                value: BCD.FORMAT
            }
        ]

    },
};

export default OperationConfig;
