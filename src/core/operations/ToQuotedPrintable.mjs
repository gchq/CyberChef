/**
 * Some parts taken from mimelib (http://github.com/andris9/mimelib)
 * @author Andris Reinman
 * @license MIT
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * To Quoted Printable operation
 */
class ToQuotedPrintable extends Operation {

    /**
     * ToQuotedPrintable constructor
     */
    constructor() {
        super();

        this.name = "To Quoted Printable";
        this.module = "Default";
        this.description = "Quoted-Printable, or QP encoding, is an encoding using printable ASCII characters (alphanumeric and the equals sign '=') to transmit 8-bit data over a 7-bit data path or, generally, over a medium which is not 8-bit clean. It is defined as a MIME content transfer encoding for use in e-mail.<br><br>QP works by using the equals sign '=' as an escape character. It also limits line length to 76, as some software has limits on line length.";
        this.infoURL = "https://wikipedia.org/wiki/Quoted-printable";
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
        let mimeEncodedStr = this.mimeEncode(input);

        // fix line breaks
        mimeEncodedStr = mimeEncodedStr.replace(/\r?\n|\r/g, function() {
            return "\r\n";
        }).replace(/[\t ]+$/gm, function(spaces) {
            return spaces.replace(/ /g, "=20").replace(/\t/g, "=09");
        });

        return this._addSoftLinebreaks(mimeEncodedStr, "qp");
    }


    /** @license
    ========================================================================
      mimelib: http://github.com/andris9/mimelib
      Copyright (c) 2011-2012 Andris Reinman

      Permission is hereby granted, free of charge, to any person obtaining a copy
      of this software and associated documentation files (the "Software"), to deal
      in the Software without restriction, including without limitation the rights
      to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
      copies of the Software, and to permit persons to whom the Software is
      furnished to do so, subject to the following conditions:

      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
      OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
      SOFTWARE.
    */

    /**
     * Encodes mime data.
     *
     * @param {byteArray} buffer
     * @returns {string}
     */
    mimeEncode(buffer) {
        const ranges = [
            [0x09],
            [0x0A],
            [0x0D],
            [0x20],
            [0x21],
            [0x23, 0x3C],
            [0x3E],
            [0x40, 0x5E],
            [0x60, 0x7E]
        ];
        let result = "";

        for (let i = 0, len = buffer.length; i < len; i++) {
            if (this._checkRanges(buffer[i], ranges)) {
                result += String.fromCharCode(buffer[i]);
                continue;
            }
            result += "=" + (buffer[i] < 0x10 ? "0" : "") + buffer[i].toString(16).toUpperCase();
        }

        return result;
    }

    /**
     * Checks if a given number falls within a given set of ranges.
     *
     * @private
     * @param {number} nr
     * @param {byteArray[]} ranges
     * @returns {bolean}
     */
    _checkRanges(nr, ranges) {
        for (let i = ranges.length - 1; i >= 0; i--) {
            if (!ranges[i].length)
                continue;
            if (ranges[i].length === 1 && nr === ranges[i][0])
                return true;
            if (ranges[i].length === 2 && nr >= ranges[i][0] && nr <= ranges[i][1])
                return true;
        }
        return false;
    }

    /**
     * Adds soft line breaks to a string.
     * Lines can't be longer that 76 + <CR><LF> = 78 bytes
     * http://tools.ietf.org/html/rfc2045#section-6.7
     *
     * @private
     * @param {string} str
     * @param {string} encoding
     * @returns {string}
     */
    _addSoftLinebreaks(str, encoding) {
        const lineLengthMax = 76;

        encoding = (encoding || "base64").toString().toLowerCase().trim();

        if (encoding === "qp") {
            return this._addQPSoftLinebreaks(str, lineLengthMax);
        } else {
            return this._addBase64SoftLinebreaks(str, lineLengthMax);
        }
    }

    /**
     * Adds soft line breaks to a base64 string.
     *
     * @private
     * @param {string} base64EncodedStr
     * @param {number} lineLengthMax
     * @returns {string}
     */
    _addBase64SoftLinebreaks(base64EncodedStr, lineLengthMax) {
        base64EncodedStr = (base64EncodedStr || "").toString().trim();
        return base64EncodedStr.replace(new RegExp(".{" + lineLengthMax + "}", "g"), "$&\r\n").trim();
    }

    /**
     * Adds soft line breaks to a quoted printable string.
     *
     * @private
     * @param {string} mimeEncodedStr
     * @param {number} lineLengthMax
     * @returns {string}
     */
    _addQPSoftLinebreaks(mimeEncodedStr, lineLengthMax) {
        const len = mimeEncodedStr.length,
            lineMargin = Math.floor(lineLengthMax / 3);
        let pos = 0,
            match, code, line,
            result = "";

        // insert soft linebreaks where needed
        while (pos < len) {
            line = mimeEncodedStr.substr(pos, lineLengthMax);
            if ((match = line.match(/\r\n/))) {
                line = line.substr(0, match.index + match[0].length);
                result += line;
                pos += line.length;
                continue;
            }

            if (line.substr(-1) === "\n") {
                // nothing to change here
                result += line;
                pos += line.length;
                continue;
            } else if ((match = line.substr(-lineMargin).match(/\n.*?$/))) {
                // truncate to nearest line break
                line = line.substr(0, line.length - (match[0].length - 1));
                result += line;
                pos += line.length;
                continue;
            } else if (line.length > lineLengthMax - lineMargin && (match = line.substr(-lineMargin).match(/[ \t.,!?][^ \t.,!?]*$/))) {
                // truncate to nearest space
                line = line.substr(0, line.length - (match[0].length - 1));
            } else if (line.substr(-1) === "\r") {
                line = line.substr(0, line.length - 1);
            } else {
                if (line.match(/=[\da-f]{0,2}$/i)) {

                    // push incomplete encoding sequences to the next line
                    if ((match = line.match(/=[\da-f]{0,1}$/i))) {
                        line = line.substr(0, line.length - match[0].length);
                    }

                    // ensure that utf-8 sequences are not split
                    while (line.length > 3 && line.length < len - pos && !line.match(/^(?:=[\da-f]{2}){1,4}$/i) && (match = line.match(/=[\da-f]{2}$/ig))) {
                        code = parseInt(match[0].substr(1, 2), 16);
                        if (code < 128) {
                            break;
                        }

                        line = line.substr(0, line.length - 3);

                        if (code >= 0xC0) {
                            break;
                        }
                    }

                }
            }

            if (pos + line.length < len && line.substr(-1) !== "\n") {
                if (line.length === 76 && line.match(/=[\da-f]{2}$/i)) {
                    line = line.substr(0, line.length - 3);
                } else if (line.length === 76) {
                    line = line.substr(0, line.length - 1);
                }
                pos += line.length;
                line += "=\r\n";
            } else {
                pos += line.length;
            }

            result += line;
        }

        return result;
    }

}

export default ToQuotedPrintable;
