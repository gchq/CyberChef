/**
 * @author skyswordw
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import {toBase64} from "../lib/Base64.mjs";
import cptable from "codepage";

const CHARSET_CODEPAGES = {
        "UTF-8": 65001,
        "US-ASCII": 20127,
        "ISO-8859-1": 28591,
        "ISO-8859-2": 28592,
        "ISO-8859-3": 28593,
        "ISO-8859-4": 28594,
        "ISO-8859-5": 28595,
        "ISO-8859-6": 28596,
        "ISO-8859-7": 28597,
        "ISO-8859-8": 28598,
        "ISO-8859-9": 28599,
        "ISO-8859-10": 28600,
        "ISO-8859-11": 28601,
        "ISO-8859-13": 28603,
        "ISO-8859-14": 28604,
        "ISO-8859-15": 28605,
        "ISO-8859-16": 28606,
    },
    TRANSFER_ENCODINGS = ["Base64", "Q-encoding"],
    MAX_ENCODED_WORD_LENGTH = 75;

/**
 * MIME Encoding operation
 */
class MIMEEncoding extends Operation {

    /**
     * MIMEEncoding constructor
     */
    constructor() {
        super();

        this.name = "MIME Encoding";
        this.module = "Default";
        this.description = "Encodes text as MIME encoded-words for non-ASCII email header values.";
        this.infoURL = "https://tools.ietf.org/html/rfc2047";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Charset",
                type: "option",
                value: Object.keys(CHARSET_CODEPAGES)
            },
            {
                name: "Transfer encoding",
                type: "option",
                value: TRANSFER_ENCODINGS
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [charset, encoding] = args,
            codepage = CHARSET_CODEPAGES[charset];

        if (!codepage) throw new OperationError("Invalid charset");
        if (!TRANSFER_ENCODINGS.includes(encoding)) throw new OperationError("Invalid transfer encoding");
        if (!input.length) return "";

        return input.split(/\r\n|\n|\r/).map(line => {
            return this.encodeLine(line, charset, codepage, encoding);
        }).join("\r\n");
    }

    /**
     * @param {string} input
     * @param {string} charset
     * @param {number} codepage
     * @param {string} encoding
     * @returns {string}
     */
    encodeLine(input, charset, codepage, encoding) {
        const encodedWords = [];
        let chunk = "";

        for (const char of input) {
            const next = chunk + char;
            if (chunk && this.encodedWord(charset, codepage, encoding, next).length > MAX_ENCODED_WORD_LENGTH) {
                encodedWords.push(this.encodedWord(charset, codepage, encoding, chunk));
                chunk = char;
            } else {
                chunk = next;
            }
        }

        if (chunk) encodedWords.push(this.encodedWord(charset, codepage, encoding, chunk));
        return encodedWords.join("\r\n ");
    }

    /**
     * @param {string} charset
     * @param {number} codepage
     * @param {string} encoding
     * @param {string} input
     * @returns {string}
     */
    encodedWord(charset, codepage, encoding, input) {
        const encodedText = encoding === "Base64" ?
            toBase64(cptable.utils.encode(codepage, input)) :
            this.qEncode(cptable.utils.encode(codepage, input));

        return `=?${charset}?${encoding === "Base64" ? "B" : "Q"}?${encodedText}?=`;
    }

    /**
     * @param {Uint8Array|byteArray} input
     * @returns {string}
     */
    qEncode(input) {
        let output = "";
        for (const byte of input) {
            if (byte === 0x20) {
                output += "_";
            } else if (
                byte >= 0x21 &&
                byte <= 0x7e &&
                byte !== 0x3d &&
                byte !== 0x3f &&
                byte !== 0x5f
            ) {
                output += String.fromCharCode(byte);
            } else {
                output += `=${byte.toString(16).toUpperCase().padStart(2, "0")}`;
            }
        }
        return output;
    }

}

export default MIMEEncoding;
