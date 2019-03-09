/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import utf8 from "utf8";
import {fromBase64, toBase64} from "./lib/Base64";
import {fromHex} from "./lib/Hex";
import {fromDecimal} from "./lib/Decimal";
import {fromBinary} from "./lib/Binary";


/**
 * Utility functions for use in operations, the core framework and the stage.
 */
class Utils {

    /**
     * Translates an ordinal into a character.
     *
     * @param {number} o
     * @returns {char}
     *
     * @example
     * // returns 'a'
     * Utils.chr(97);
     */
    static chr(o) {
        // Detect astral symbols
        // Thanks to @mathiasbynens for this solution
        // https://mathiasbynens.be/notes/javascript-unicode
        if (o > 0xffff) {
            o -= 0x10000;
            const high = String.fromCharCode(o >>> 10 & 0x3ff | 0xd800);
            o = 0xdc00 | o & 0x3ff;
            return high + String.fromCharCode(o);
        }

        return String.fromCharCode(o);
    }


    /**
     * Translates a character into an ordinal.
     *
     * @param {char} c
     * @returns {number}
     *
     * @example
     * // returns 97
     * Utils.ord('a');
     */
    static ord(c) {
        // Detect astral symbols
        // Thanks to @mathiasbynens for this solution
        // https://mathiasbynens.be/notes/javascript-unicode
        if (c.length === 2) {
            const high = c.charCodeAt(0);
            const low = c.charCodeAt(1);
            if (high >= 0xd800 && high < 0xdc00 &&
                low >= 0xdc00 && low < 0xe000) {
                return (high - 0xd800) * 0x400 + low - 0xdc00 + 0x10000;
            }
        }

        return c.charCodeAt(0);
    }


    /**
     * Adds trailing bytes to a byteArray.
     *
     * @author tlwr [toby@toby.codes]
     *
     * @param {byteArray} arr - byteArray to add trailing bytes to.
     * @param {number} numBytes - Maximum width of the array.
     * @param {Integer} [padByte=0] - The byte to pad with.
     * @returns {byteArray}
     *
     * @example
     * // returns ["a", 0, 0, 0]
     * Utils.padBytesRight("a", 4);
     *
     * // returns ["a", 1, 1, 1]
     * Utils.padBytesRight("a", 4, 1);
     *
     * // returns ["t", "e", "s", "t", 0, 0, 0, 0]
     * Utils.padBytesRight("test", 8);
     *
     * // returns ["t", "e", "s", "t", 1, 1, 1, 1]
     * Utils.padBytesRight("test", 8, 1);
     */
    static padBytesRight(arr, numBytes, padByte=0) {
        const paddedBytes = new Array(numBytes);
        paddedBytes.fill(padByte);

        Array.prototype.map.call(arr, function(b, i) {
            paddedBytes[i] = b;
        });

        return paddedBytes;
    }


    /**
     * Truncates a long string to max length and adds suffix.
     *
     * @param {string} str - String to truncate
     * @param {number} max - Maximum length of the final string
     * @param {string} [suffix='...'] - The string to add to the end of the final string
     * @returns {string}
     *
     * @example
     * // returns "A long..."
     * Utils.truncate("A long string", 9);
     *
     * // returns "A long s-"
     * Utils.truncate("A long string", 9, "-");
     */
    static truncate(str, max, suffix="...") {
        if (str.length > max) {
            str = str.slice(0, max - suffix.length) + suffix;
        }
        return str;
    }


    /**
     * Converts a character or number to its hex representation.
     *
     * @param {char|number} c
     * @param {number} [length=2] - The width of the resulting hex number.
     * @returns {string}
     *
     * @example
     * // returns "6e"
     * Utils.hex("n");
     *
     * // returns "6e"
     * Utils.hex(110);
     */
    static hex(c, length=2) {
        c = typeof c == "string" ? Utils.ord(c) : c;
        return c.toString(16).padStart(length, "0");
    }


    /**
     * Converts a character or number to its binary representation.
     *
     * @param {char|number} c
     * @param {number} [length=8] - The width of the resulting binary number.
     * @returns {string}
     *
     * @example
     * // returns "01101110"
     * Utils.bin("n");
     *
     * // returns "01101110"
     * Utils.bin(110);
     */
    static bin(c, length=8) {
        c = typeof c == "string" ? Utils.ord(c) : c;
        return c.toString(2).padStart(length, "0");
    }


    /**
     * Returns a string with all non-printable chars as dots, optionally preserving whitespace.
     *
     * @param {string} str - The input string to display.
     * @param {boolean} [preserveWs=false] - Whether or not to print whitespace.
     * @returns {string}
     */
    static printable(str, preserveWs=false) {
        if (ENVIRONMENT_IS_WEB() && window.app && !window.app.options.treatAsUtf8) {
            str = Utils.byteArrayToChars(Utils.strToByteArray(str));
        }

        const re = /[\0-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]/g;
        const wsRe = /[\x09-\x10\x0D\u2028\u2029]/g;

        str = str.replace(re, ".");
        if (!preserveWs) str = str.replace(wsRe, ".");
        return str;
    }


    /**
     * Parse a string entered by a user and replace escaped chars with the bytes they represent.
     *
     * @param {string} str
     * @returns {string}
     *
     * @example
     * // returns "\x00"
     * Utils.parseEscapedChars("\\x00");
     *
     * // returns "\n"
     * Utils.parseEscapedChars("\\n");
     */
    static parseEscapedChars(str) {
        return str.replace(/(\\)?\\([bfnrtv0'"]|x[\da-fA-F]{2}|u[\da-fA-F]{4}|u\{[\da-fA-F]{1,6}\})/g, function(m, a, b) {
            if (a === "\\") return "\\"+b;
            switch (b[0]) {
                case "0":
                    return "\0";
                case "b":
                    return "\b";
                case "t":
                    return "\t";
                case "n":
                    return "\n";
                case "v":
                    return "\v";
                case "f":
                    return "\f";
                case "r":
                    return "\r";
                case '"':
                    return '"';
                case "'":
                    return "'";
                case "x":
                    return String.fromCharCode(parseInt(b.substr(1), 16));
                case "u":
                    if (b[1] === "{")
                        return String.fromCodePoint(parseInt(b.slice(2, -1), 16));
                    else
                        return String.fromCharCode(parseInt(b.substr(1), 16));
            }
        });
    }


    /**
     * Escape a string containing regex control characters so that it can be safely
     * used in a regex without causing unintended behaviours.
     *
     * @param {string} str
     * @returns {string}
     *
     * @example
     * // returns "\[example\]"
     * Utils.escapeRegex("[example]");
     */
    static escapeRegex(str) {
        return str.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1");
    }


    /**
     * Expand an alphabet range string into a list of the characters in that range.
     *
     * @param {string} alphStr
     * @returns {char[]}
     *
     * @example
     * // returns ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
     * Utils.expandAlphRange("0-9");
     *
     * // returns ["a", "b", "c", "d", "0", "1", "2", "3", "+", "/"]
     * Utils.expandAlphRange("a-d0-3+/");
     *
     * // returns ["a", "b", "c", "d", "0", "-", "3"]
     * Utils.expandAlphRange("a-d0\\-3")
     */
    static expandAlphRange(alphStr) {
        const alphArr = [];

        for (let i = 0; i < alphStr.length; i++) {
            if (i < alphStr.length - 2 &&
                alphStr[i+1] === "-" &&
                alphStr[i] !== "\\") {
                const start = Utils.ord(alphStr[i]),
                    end = Utils.ord(alphStr[i+2]);

                for (let j = start; j <= end; j++) {
                    alphArr.push(Utils.chr(j));
                }
                i += 2;
            } else if (i < alphStr.length - 2 &&
                alphStr[i] === "\\" &&
                alphStr[i+1] === "-") {
                alphArr.push("-");
                i++;
            } else {
                alphArr.push(alphStr[i]);
            }
        }
        return alphArr;
    }


    /**
     * Coverts data of varying types to a byteArray.
     * Accepts hex, Base64, UTF8 and Latin1 strings.
     *
     * @param {string} str
     * @param {string} type - One of "Binary", "Hex", "Decimal", "Base64", "UTF8" or "Latin1"
     * @returns {byteArray}
     *
     * @example
     * // returns [208, 159, 209, 128, 208, 184, 208, 178, 208, 181, 209, 130]
     * Utils.convertToByteArray("Привет", "utf8");
     *
     * // returns [208, 159, 209, 128, 208, 184, 208, 178, 208, 181, 209, 130]
     * Utils.convertToByteArray("d097d0b4d180d0b0d0b2d181d182d0b2d183d0b9d182d0b5", "hex");
     *
     * // returns [208, 159, 209, 128, 208, 184, 208, 178, 208, 181, 209, 130]
     * Utils.convertToByteArray("0JfQtNGA0LDQstGB0YLQstGD0LnRgtC1", "base64");
     */
    static convertToByteArray(str, type) {
        switch (type.toLowerCase()) {
            case "binary":
                return fromBinary(str);
            case "hex":
                return fromHex(str);
            case "decimal":
                return fromDecimal(str);
            case "base64":
                return fromBase64(str, null, "byteArray");
            case "utf8":
                return Utils.strToUtf8ByteArray(str);
            case "latin1":
            default:
                return Utils.strToByteArray(str);
        }
    }


    /**
     * Coverts data of varying types to a byte string.
     * Accepts hex, Base64, UTF8 and Latin1 strings.
     *
     * @param {string} str
     * @param {string} type - One of "Binary", "Hex", "Decimal", "Base64", "UTF8" or "Latin1"
     * @returns {string}
     *
     * @example
     * // returns "ÐÑÐ¸Ð²ÐµÑ"
     * Utils.convertToByteString("Привет", "utf8");
     *
     * // returns "ÐÐ´ÑÐ°Ð²ÑÑÐ²ÑÐ¹ÑÐµ"
     * Utils.convertToByteString("d097d0b4d180d0b0d0b2d181d182d0b2d183d0b9d182d0b5", "hex");
     *
     * // returns "ÐÐ´ÑÐ°Ð²ÑÑÐ²ÑÐ¹ÑÐµ"
     * Utils.convertToByteString("0JfQtNGA0LDQstGB0YLQstGD0LnRgtC1", "base64");
     */
    static convertToByteString(str, type) {
        switch (type.toLowerCase()) {
            case "binary":
                return Utils.byteArrayToChars(fromBinary(str));
            case "hex":
                return Utils.byteArrayToChars(fromHex(str));
            case "decimal":
                return Utils.byteArrayToChars(fromDecimal(str));
            case "base64":
                return Utils.byteArrayToChars(fromBase64(str, null, "byteArray"));
            case "utf8":
                return utf8.encode(str);
            case "latin1":
            default:
                return str;
        }
    }


    /**
     * Converts a string to a byte array.
     * Treats the string as UTF-8 if any values are over 255.
     *
     * @param {string} str
     * @returns {byteArray}
     *
     * @example
     * // returns [72,101,108,108,111]
     * Utils.strToByteArray("Hello");
     *
     * // returns [228,189,160,229,165,189]
     * Utils.strToByteArray("你好");
     */
    static strToByteArray(str) {
        const byteArray = new Array(str.length);
        let i = str.length, b;
        while (i--) {
            b = str.charCodeAt(i);
            byteArray[i] = b;
            // If any of the bytes are over 255, read as UTF-8
            if (b > 255) return Utils.strToUtf8ByteArray(str);
        }
        return byteArray;
    }


    /**
     * Converts a string to a UTF-8 byte array.
     *
     * @param {string} str
     * @returns {byteArray}
     *
     * @example
     * // returns [72,101,108,108,111]
     * Utils.strToUtf8ByteArray("Hello");
     *
     * // returns [228,189,160,229,165,189]
     * Utils.strToUtf8ByteArray("你好");
     */
    static strToUtf8ByteArray(str) {
        const utf8Str = utf8.encode(str);

        if (str.length !== utf8Str.length) {
            if (ENVIRONMENT_IS_WORKER()) {
                self.setOption("attemptHighlight", false);
            } else if (ENVIRONMENT_IS_WEB()) {
                window.app.options.attemptHighlight = false;
            }
        }

        return Utils.strToByteArray(utf8Str);
    }


    /**
     * Converts a string to a unicode charcode array
     *
     * @param {string} str
     * @returns {byteArray}
     *
     * @example
     * // returns [72,101,108,108,111]
     * Utils.strToCharcode("Hello");
     *
     * // returns [20320,22909]
     * Utils.strToCharcode("你好");
     */
    static strToCharcode(str) {
        const charcode = [];

        for (let i = 0; i < str.length; i++) {
            let ord = str.charCodeAt(i);

            // Detect and merge astral symbols
            if (i < str.length - 1 && ord >= 0xd800 && ord < 0xdc00) {
                const low = str[i + 1].charCodeAt(0);
                if (low >= 0xdc00 && low < 0xe000) {
                    ord = Utils.ord(str[i] + str[++i]);
                }
            }

            charcode.push(ord);
        }

        return charcode;
    }


    /**
     * Attempts to convert a byte array to a UTF-8 string.
     *
     * @param {byteArray} byteArray
     * @returns {string}
     *
     * @example
     * // returns "Hello"
     * Utils.byteArrayToUtf8([72,101,108,108,111]);
     *
     * // returns "你好"
     * Utils.byteArrayToUtf8([228,189,160,229,165,189]);
     */
    static byteArrayToUtf8(byteArray) {
        const str = Utils.byteArrayToChars(byteArray);
        try {
            const utf8Str = utf8.decode(str);

            if (str.length !== utf8Str.length) {
                if (ENVIRONMENT_IS_WORKER()) {
                    self.setOption("attemptHighlight", false);
                } else if (ENVIRONMENT_IS_WEB()) {
                    window.app.options.attemptHighlight = false;
                }
            }
            return utf8Str;
        } catch (err) {
            // If it fails, treat it as ANSI
            return str;
        }
    }


    /**
     * Converts a charcode array to a string.
     *
     * @param {byteArray|Uint8Array} byteArray
     * @returns {string}
     *
     * @example
     * // returns "Hello"
     * Utils.byteArrayToChars([72,101,108,108,111]);
     *
     * // returns "你好"
     * Utils.byteArrayToChars([20320,22909]);
     */
    static byteArrayToChars(byteArray) {
        if (!byteArray) return "";
        let str = "";
        for (let i = 0; i < byteArray.length;) {
            str += String.fromCharCode(byteArray[i++]);
        }
        return str;
    }


    /**
     * Converts an ArrayBuffer to a string.
     *
     * @param {ArrayBuffer} arrayBuffer
     * @param {boolean} [utf8=true] - Whether to attempt to decode the buffer as UTF-8
     * @returns {string}
     *
     * @example
     * // returns "hello"
     * Utils.arrayBufferToStr(Uint8Array.from([104,101,108,108,111]).buffer);
     */
    static arrayBufferToStr(arrayBuffer, utf8=true) {
        const byteArray = Array.prototype.slice.call(new Uint8Array(arrayBuffer));
        return utf8 ? Utils.byteArrayToUtf8(byteArray) : Utils.byteArrayToChars(byteArray);
    }


    /**
     * Parses CSV data and returns it as a two dimensional array or strings.
     *
     * @param {string} data
     * @param {string[]} [cellDelims=[","]]
     * @param {string[]} [lineDelims=["\n", "\r"]]
     * @returns {string[][]}
     *
     * @example
     * // returns [["head1", "head2"], ["data1", "data2"]]
     * Utils.parseCSV("head1,head2\ndata1,data2");
     */
    static parseCSV(data, cellDelims=[","], lineDelims=["\n", "\r"]) {
        let b,
            next,
            renderNext = false,
            inString = false,
            cell = "",
            line = [];
        const lines = [];

        // Remove BOM, often present in Excel CSV files
        if (data.length && data[0] === "\uFEFF") data = data.substr(1);

        for (let i = 0; i < data.length; i++) {
            b = data[i];
            next = data[i+1] || "";
            if (renderNext) {
                cell += b;
                renderNext = false;
            } else if (b === "\"" && !inString) {
                inString = true;
            } else if (b === "\"" && inString) {
                if (next === "\"") renderNext = true;
                else inString = false;
            } else if (!inString && cellDelims.indexOf(b) >= 0) {
                line.push(cell);
                cell = "";
            } else if (!inString && lineDelims.indexOf(b) >= 0) {
                line.push(cell);
                cell = "";
                lines.push(line);
                line = [];
                // Skip next byte if it is also a line delim (e.g. \r\n)
                if (lineDelims.indexOf(next) >= 0 && next !== b) {
                    i++;
                }
            } else {
                cell += b;
            }
        }

        if (line.length) {
            line.push(cell);
            lines.push(line);
        }

        return lines;
    }


    /**
     * Removes all HTML (or XML) tags from the input string.
     *
     * @param {string} htmlStr
     * @param {boolean} [removeScriptAndStyle=false]
     *     - Flag to specify whether to remove entire script or style blocks
     * @returns {string}
     *
     * @example
     * // returns "Test"
     * Utils.stripHtmlTags("<div>Test</div>");
     */
    static stripHtmlTags(htmlStr, removeScriptAndStyle=false) {
        if (removeScriptAndStyle) {
            htmlStr = htmlStr.replace(/<(script|style)[^>]*>.*<\/(script|style)>/gmi, "");
        }
        return htmlStr.replace(/<[^>]+>/g, "");
    }


    /**
     * Escapes HTML tags in a string to stop them being rendered.
     * https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
     *
     * @param {string} str
     * @returns string
     *
     * @example
     * // return "A &lt;script&gt; tag"
     * Utils.escapeHtml("A <script> tag");
     */
    static escapeHtml(str) {
        const HTML_CHARS = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;", // &apos; not recommended because it's not in the HTML spec
            "/": "&#x2F;", // forward slash is included as it helps end an HTML entity
            "`": "&#x60;"
        };

        return str.replace(/[&<>"'/`]/g, function (match) {
            return HTML_CHARS[match];
        });
    }


    /**
     * Unescapes HTML tags in a string to make them render again.
     *
     * @param {string} str
     * @returns string
     *
     * @example
     * // return "A <script> tag"
     * Utils.unescapeHtml("A &lt;script&gt; tag");
     */
    static unescapeHtml(str) {
        const HTML_CHARS = {
            "&amp;":  "&",
            "&lt;":   "<",
            "&gt;":   ">",
            "&quot;": '"',
            "&#x27;": "'",
            "&#x2F;": "/",
            "&#x60;": "`"
        };

        return str.replace(/&#?x?[a-z0-9]{2,4};/ig, function (match) {
            return HTML_CHARS[match] || match;
        });
    }


    /**
     * Encodes a URI fragment (#) or query (?) using a minimal amount of percent-encoding.
     *
     * RFC 3986 defines legal characters for the fragment and query parts of a URL to be as follows:
     *
     * fragment      = *( pchar / "/" / "?" )
     * query         = *( pchar / "/" / "?" )
     * pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
     * unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
     * pct-encoded   = "%" HEXDIG HEXDIG
     * sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
     *                  / "*" / "+" / "," / ";" / "="
     *
     * Meaning that the list of characters that need not be percent-encoded are alphanumeric plus:
     * -._~!$&'()*+,;=:@/?
     *
     * & and = are still escaped as they are used to serialise the key-value pairs in CyberChef
     * fragments. + is also escaped so as to prevent it being decoded to a space.
     *
     * @param {string} str
     * @returns {string}
     */
    static encodeURIFragment(str) {
        const LEGAL_CHARS = {
            "%2D": "-",
            "%2E": ".",
            "%5F": "_",
            "%7E": "~",
            "%21": "!",
            "%24": "$",
            //"%26": "&",
            "%27": "'",
            "%28": "(",
            "%29": ")",
            "%2A": "*",
            //"%2B": "+",
            "%2C": ",",
            "%3B": ";",
            //"%3D": "=",
            "%3A": ":",
            "%40": "@",
            "%2F": "/",
            "%3F": "?"
        };
        str = encodeURIComponent(str);

        return str.replace(/%[0-9A-F]{2}/g, function (match) {
            return LEGAL_CHARS[match] || match;
        });
    }


    /**
     * Generates a "pretty" recipe format from a recipeConfig object.
     *
     * "Pretty" CyberChef recipe formats are designed to be included in the fragment (#) or query (?)
     * parts of the URL. They can also be loaded into CyberChef through the 'Load' interface. In order
     * to make this format as readable as possible, various special characters are used unescaped. This
     * reduces the amount of percent-encoding included in the URL which is typically difficult to read
     * and substantially increases the overall length. These characteristics can be quite off-putting
     * for users.
     *
     * @param {Object[]} recipeConfig
     * @param {boolean} [newline=false] - whether to add a newline after each operation
     * @returns {string}
     */
    static generatePrettyRecipe(recipeConfig, newline = false) {
        let prettyConfig = "",
            name = "",
            args = "",
            disabled = "",
            bp = "";

        recipeConfig.forEach(op => {
            name = op.op.replace(/ /g, "_");
            args = JSON.stringify(op.args)
                .slice(1, -1) // Remove [ and ] as they are implied
                // We now need to switch double-quoted (") strings to single quotes (') as single quotes
                // do not need to be percent-encoded.
                .replace(/'/g, "\\'") // Escape single quotes
                .replace(/"((?:[^"\\]|\\.)*)"/g, "'$1'") // Replace opening and closing " with '
                .replace(/\\"/g, '"'); // Unescape double quotes

            disabled = op.disabled ? "/disabled": "";
            bp = op.breakpoint ? "/breakpoint" : "";
            prettyConfig += `${name}(${args}${disabled}${bp})`;
            if (newline) prettyConfig += "\n";
        });
        return prettyConfig;
    }


    /**
     * Converts a recipe string to the JSON representation of the recipe.
     * Accepts either stringified JSON or the bespoke "pretty" recipe format.
     *
     * @param {string} recipe
     * @returns {Object[]}
     */
    static parseRecipeConfig(recipe) {
        recipe = recipe.trim();
        if (recipe.length === 0) return [];
        if (recipe[0] === "[") return JSON.parse(recipe);

        // Parse bespoke recipe format
        recipe = recipe.replace(/\n/g, "");
        let m, args;
        const recipeRegex = /([^(]+)\(((?:'[^'\\]*(?:\\.[^'\\]*)*'|[^)/'])*)(\/[^)]+)?\)/g,
            recipeConfig = [];

        while ((m = recipeRegex.exec(recipe))) {
            // Translate strings in args back to double-quotes
            args = m[2]
                .replace(/"/g, '\\"') // Escape double quotes
                .replace(/(^|,|{|:)'/g, '$1"') // Replace opening ' with "
                .replace(/([^\\]|[^\\]\\\\)'(,|:|}|$)/g, '$1"$2') // Replace closing ' with "
                .replace(/\\'/g, "'"); // Unescape single quotes
            args = "[" + args + "]";

            const op = {
                op: m[1].replace(/_/g, " "),
                args: JSON.parse(args)
            };
            if (m[3] && m[3].indexOf("disabled") > 0) op.disabled = true;
            if (m[3] && m[3].indexOf("breakpoint") > 0) op.breakpoint = true;
            recipeConfig.push(op);
        }
        return recipeConfig;
    }


    /**
     * Formats a list of files or directories.
     *
     * @author tlwr [toby@toby.codes]
     * @author n1474335 [n1474335@gmail.com]
     *
     * @param {File[]} files
     * @returns {html}
     */
    static async displayFilesAsHTML(files) {
        const formatDirectory = function(file) {
            const html = `<div class='card' style='white-space: normal;'>
                    <div class='card-header'>
                        <h6 class="mb-0">
                            ${Utils.escapeHtml(file.name)}
                        </h6>
                    </div>
                </div>`;
            return html;
        };

        const formatContent = function (buff, type) {
            if (type.startsWith("image")) {
                let dataURI = "data:";
                dataURI += type + ";";
                dataURI += "base64," + toBase64(buff);
                return "<img style='max-width: 100%;' src='" + dataURI + "'>";
            } else {
                return `<pre>${Utils.escapeHtml(Utils.arrayBufferToStr(buff.buffer))}</pre>`;
            }
        };

        const formatFile = async function(file, i) {
            const buff = await Utils.readFile(file);
            const blob = new Blob(
                [buff],
                {type: file.type || "octet/stream"}
            );
            const blobURL = URL.createObjectURL(blob);

            const html = `<div class='card' style='white-space: normal;'>
                    <div class='card-header' id='heading${i}'>
                        <h6 class='mb-0'>
                            <a class='collapsed'
                                data-toggle='collapse'
                                href='#collapse${i}'
                                aria-expanded='false'
                                aria-controls='collapse${i}'
                                title="Show/hide contents of '${Utils.escapeHtml(file.name)}'">
                                ${Utils.escapeHtml(file.name)}</a>
                            <span class='float-right' style="margin-top: -3px">
                                ${file.size.toLocaleString()} bytes
                                <a title="Download ${Utils.escapeHtml(file.name)}"
                                    href="${blobURL}"
                                    download="${Utils.escapeHtml(file.name)}"
                                    data-toggle="tooltip">
                                    <i class="material-icons" style="vertical-align: bottom">save</i>
                                </a>
                                <a title="Move to input"
                                    href="#"
                                    blob-url="${blobURL}"
                                    file-name="${Utils.escapeHtml(file.name)}"
                                    class="extract-file"
                                    data-toggle="tooltip">
                                    <i class="material-icons" style="vertical-align: bottom">open_in_browser</i>
                                </a>
                            </span>
                        </h6>
                    </div>
                    <div id='collapse${i}' class='collapse' aria-labelledby='heading${i}' data-parent="#files">
                        <div class='card-body'>
                            ${formatContent(buff, file.type)}
                        </div>
                    </div>
                </div>`;
            return html;
        };

        let html = `<div style='padding: 5px; white-space: normal;'>
                ${files.length} file(s) found
            </div><div id="files" style="padding: 20px">`;

        for (let i = 0; i < files.length; i++) {
            if (files[i].name.endsWith("/")) {
                html += formatDirectory(files[i]);
            } else {
                html += await formatFile(files[i], i);
            }
        }

        return html += "</div>";
    }


    /**
     * Parses URI parameters into a JSON object.
     *
     * @param {string} paramStr - The serialised query or hash section of a URI
     * @returns {object}
     *
     * @example
     * // returns {a: 'abc', b: '123'}
     * Utils.parseURIParams("?a=abc&b=123")
     * Utils.parseURIParams("#a=abc&b=123")
     */
    static parseURIParams(paramStr) {
        if (paramStr === "") return {};

        // Cut off ? or # and split on &
        if (paramStr[0] === "?" ||
            paramStr[0] === "#") {
            paramStr = paramStr.substr(1);
        }

        const params = paramStr.split("&");
        const result = {};

        for (let i = 0; i < params.length; i++) {
            const param = params[i].split("=");
            if (param.length !== 2) {
                result[params[i]] = true;
            } else {
                result[param[0]] = decodeURIComponent(param[1].replace(/\+/g, " "));
            }
        }

        return result;
    }


    /**
     * Reads a File and returns the data as a Uint8Array.
     *
     * @param {File} file
     * @returns {Uint8Array}
     *
     * @example
     * // returns Uint8Array(5) [104, 101, 108, 108, 111]
     * await Utils.readFile(new File(["hello"], "test"))
     */
    static readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const data = new Uint8Array(file.size);
            let offset = 0;
            const CHUNK_SIZE = 10485760; // 10MiB

            const seek = function() {
                if (offset >= file.size) {
                    resolve(data);
                    return;
                }
                const slice = file.slice(offset, offset + CHUNK_SIZE);
                reader.readAsArrayBuffer(slice);
            };

            reader.onload = function(e) {
                data.set(new Uint8Array(reader.result), offset);
                offset += CHUNK_SIZE;
                seek();
            };

            reader.onerror = function(e) {
                reject(reader.error.message);
            };

            seek();
        });
    }


    /**
     * Actual modulo function, since % is actually the remainder function in JS.
     *
     * @author Matt C [matt@artemisbot.uk]
     * @param {number} x
     * @param {number} y
     * @returns {number}
     */
    static mod(x, y) {
        return ((x % y) + y) % y;
    }


    /**
     * Finds the greatest common divisor of two numbers.
     *
     * @author Matt C [matt@artemisbot.uk]
     * @param {number} x
     * @param {number} y
     * @returns {number}
     */
    static gcd(x, y) {
        if (!y) {
            return x;
        }
        return Utils.gcd(y, x % y);
    }


    /**
     * Finds the modular inverse of two values.
     *
     * @author Matt C [matt@artemisbot.uk]
     * @param {number} x
     * @param {number} y
     * @returns {number}
     */
    static modInv(x, y) {
        x %= y;
        for (let i = 1; i < y; i++) {
            if ((x * i) % 26 === 1) {
                return i;
            }
        }
    }


    /**
     * A mapping of names of delimiter characters to their symbols.
     *
     * @param {string} token
     * @returns {string}
     */
    static charRep(token) {
        return {
            "Space":         " ",
            "Comma":         ",",
            "Semi-colon":    ";",
            "Colon":         ":",
            "Line feed":     "\n",
            "CRLF":          "\r\n",
            "Forward slash": "/",
            "Backslash":     "\\",
            "0x":            "0x",
            "\\x":           "\\x",
            "Nothing (separate chars)": "",
            "None":          "",
        }[token];
    }


    /**
     * A mapping of names of delimiter characters to regular expressions which can select them.
     *
     * @param {string} token
     * @returns {RegExp}
     */
    static regexRep(token) {
        return {
            "Space":         /\s+/g,
            "Comma":         /,/g,
            "Semi-colon":    /;/g,
            "Colon":         /:/g,
            "Line feed":     /\n/g,
            "CRLF":          /\r\n/g,
            "Forward slash": /\//g,
            "Backslash":     /\\/g,
            "0x":            /0x/g,
            "\\x":           /\\x/g,
            "None":          /\s+/g // Included here to remove whitespace when there shouldn't be any
        }[token];
    }

}

export default Utils;


/**
 * Removes all duplicates from an array.
 *
 * @returns {Array}
 *
 * @example
 * // returns [3,6,4,8,2]
 * [3,6,4,8,4,2,3].unique();
 *
 * // returns ["One", "Two", "Three"]
 * ["One", "Two", "Three", "One"].unique();
 */
Array.prototype.unique = function() {
    const u = {}, a = [];
    for (let i = 0, l = this.length; i < l; i++) {
        if (u.hasOwnProperty(this[i])) {
            continue;
        }
        a.push(this[i]);
        u[this[i]] = 1;
    }
    return a;
};


/**
 * Returns the largest value in the array.
 *
 * @returns {number}
 *
 * @example
 * // returns 7
 * [4,2,5,3,7].max();
 */
Array.prototype.max = function() {
    return Math.max.apply(null, this);
};


/**
 * Returns the smallest value in the array.
 *
 * @returns {number}
 *
 * @example
 * // returns 2
 * [4,2,5,3,7].min();
 */
Array.prototype.min = function() {
    return Math.min.apply(null, this);
};


/**
 * Sums all the values in an array.
 *
 * @returns {number}
 *
 * @example
 * // returns 21
 * [4,2,5,3,7].sum();
 */
Array.prototype.sum = function() {
    return this.reduce(function (a, b) {
        return a + b;
    }, 0);
};


/**
 * Determine whether two arrays are equal or not.
 *
 * @param {Object[]} other
 * @returns {boolean}
 *
 * @example
 * // returns true
 * [1,2,3].equals([1,2,3]);
 *
 * // returns false
 * [1,2,3].equals([3,2,1]);
 */
Array.prototype.equals = function(other) {
    if (!other) return false;
    let i = this.length;
    if (i !== other.length) return false;
    while (i--) {
        if (this[i] !== other[i]) return false;
    }
    return true;
};


/**
 * Counts the number of times a char appears in a string.
 *
 * @param {char} chr
 * @returns {number}
 *
 * @example
 * // returns 2
 * "Hello".count("l");
 */
String.prototype.count = function(chr) {
    return this.split(chr).length - 1;
};


/**
 * Wrapper for self.sendStatusMessage to handle different environments.
 *
 * @param {string} msg
 */
export function sendStatusMessage(msg) {
    if (ENVIRONMENT_IS_WORKER())
        self.sendStatusMessage(msg);
    else if (ENVIRONMENT_IS_WEB())
        app.alert(msg, 10000);
    else if (ENVIRONMENT_IS_NODE())
        log.debug(msg);
}


/*
 * Polyfills
 */

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
        targetLength = targetLength>>0; //floor if number or convert non-number to 0;
        padString = String((typeof padString !== "undefined" ? padString : " "));
        if (this.length > targetLength) {
            return String(this);
        } else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0, targetLength) + String(this);
        }
    };
}


// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd
if (!String.prototype.padEnd) {
    String.prototype.padEnd = function padEnd(targetLength, padString) {
        targetLength = targetLength>>0; //floor if number or convert non-number to 0;
        padString = String((typeof padString !== "undefined" ? padString : " "));
        if (this.length > targetLength) {
            return String(this);
        } else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return String(this) + padString.slice(0, targetLength);
        }
    };
}
