/**
 * @author mshwed [m@ttshwed.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import { fromHex } from "../lib/Hex.mjs";
import { fromBase64 } from "../lib/Base64.mjs";
import cptable from "codepage";

/**
 * MIME Decoding operation
 */
class MIMEDecoding extends Operation {

    /**
     * MIMEDecoding constructor
     */
    constructor() {
        super();

        this.name = "MIME Decoding";
        this.module = "Default";
        this.description = "Enables the decoding of MIME message header extensions for non-ASCII text";
        this.infoURL = "https://tools.ietf.org/html/rfc2047";
        this.inputType = "byteArray";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const mimeEncodedText = Utils.byteArrayToUtf8(input);
        const encodedHeaders = mimeEncodedText.replace(/\r\n/g, "\n");

        const decodedHeader = this.decodeHeaders(encodedHeaders);

        return decodedHeader;
    }

    /**
     * Decode MIME header strings
     *
     * @param headerString
     */
    decodeHeaders(headerString) {
        // No encoded words detected
        let i = headerString.indexOf("=?");
        if (i === -1) return headerString;

        let decodedHeaders = headerString.slice(0, i);
        let header = headerString.slice(i);

        let isBetweenWords = false;
        let start, cur, charset, encoding, j, end, text;
        while (header.length > -1) {
            start = header.indexOf("=?");
            if (start === -1) break;
            cur = start + "=?".length;

            i = header.slice(cur).indexOf("?");
            if (i === -1) break;

            charset = header.slice(cur, cur + i);
            cur += i + "?".length;

            if (header.length < cur + "Q??=".length) break;

            encoding = header[cur];
            cur += 1;

            if (header[cur] !== "?") break;

            cur += 1;

            j = header.slice(cur).indexOf("?=");
            if (j === -1) break;

            text = header.slice(cur, cur + j);
            end = cur + j + "?=".length;

            if (encoding.toLowerCase() === "b") {
                text = fromBase64(text);
            } else if (encoding.toLowerCase() === "q") {
                text = this.parseQEncodedWord(text);
            } else {
                isBetweenWords = false;
                decodedHeaders += header.slice(0, start + 2);
                header = header.slice(start + 2);
            }

            if (start > 0 && (!isBetweenWords || header.slice(0, start).search(/\S/g) > -1)) {
                decodedHeaders += header.slice(0, start);
            }

            decodedHeaders += this.convertFromCharset(charset, text);

            header = header.slice(end);
            isBetweenWords = true;
        }

        if (header.length > 0) {
            decodedHeaders += header;
        }

        return decodedHeaders;
    }

    /**
     * Converts decoded text for supported charsets.
     * Supports UTF-8, US-ASCII, ISO-8859-*
     *
     * @param encodedWord
     */
    convertFromCharset(charset, encodedText) {
        charset = charset.toLowerCase();
        const parsedCharset = charset.split("-");

        if (parsedCharset.length === 2 && parsedCharset[0] === "utf" && charset === "utf-8") {
            return cptable.utils.decode(65001, encodedText);
        } else if (parsedCharset.length === 2 && charset === "us-ascii") {
            return cptable.utils.decode(20127, encodedText);
        } else if (parsedCharset.length === 3 && parsedCharset[0] === "iso" && parsedCharset[1] === "8859") {
            const isoCharset = parseInt(parsedCharset[2], 10);
            if (isoCharset >= 1 && isoCharset <= 16) {
                return cptable.utils.decode(28590 + isoCharset, encodedText);
            }
        }

        throw new OperationError("Unhandled Charset");
    }

    /**
     * Parses a Q encoded word
     *
     * @param encodedWord
     */
    parseQEncodedWord(encodedWord) {
        let decodedWord = "";
        for (let i = 0; i < encodedWord.length; i++) {
            if (encodedWord[i] === "_") {
                decodedWord += " ";
            // Parse hex encoding
            } else if (encodedWord[i] === "=") {
                if ((i + 2) >= encodedWord.length) throw new OperationError("Incorrectly Encoded Word");
                const decodedHex = Utils.byteArrayToChars(fromHex(encodedWord.substring(i + 1, i + 3)));
                decodedWord += decodedHex;
                i += 2;
            } else if (
                (encodedWord[i].charCodeAt(0) >= " ".charCodeAt(0) && encodedWord[i].charCodeAt(0) <= "~".charCodeAt(0)) ||
                encodedWord[i] === "\n" ||
                encodedWord[i] === "\r" ||
                encodedWord[i] === "\t") {
                decodedWord += encodedWord[i];
            } else {
                throw new OperationError("Incorrectly Encoded Word");
            }
        }

        return decodedWord;
    }
}

export default MIMEDecoding;
