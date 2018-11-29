/**
 * @author bwhitn [brian.m.whitney@outlook.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError";
import cptable from "../vendor/js-codepage/cptable.js";
import {fromBase64} from "../lib/Base64";
import {decodeQuotedPrintable} from "../lib/QuotedPrintable";
import {MIME_FORMAT} from "../lib/ChrEnc";
import Utils from "../Utils";


/**
 * NOTE: Liberties taken include:
 * No checks are made to verify quoted words are valid encodings e.g. underscore vs escape
 * This attempts to decode mime reguardless if it is \r\n (correct newline) or \n (incorrect)
 * Both Base64 and QuotedPrintable is used for decode. UUEncode is not available right now
 * and is a standardized encoding format.
 */
class Mime {
    /**
     * Internet MessageFormat constructor
     */
    constructor(input) {
        this.input = input;
        this.rn = input.indexOf("\r") >= 0;
    }

    /**
     * Basic Email Parser that displays the header and mime sections as files.
     * Args 0 boolean decode quoted words
     *
     * @param {string} input
     * @param {boolean} decodeWords
     * @returns {File[]}
     */
    decodeMime(decodeWords) {
        // TODO: content-type can be omitted and would mean us-ascii charset and text/plain.
        if (!this.input) {
            return [];
        }
        let emlObj = Mime._splitParseHead(this.input);
        if (!emlObj.body) { throw new OperationError("No body was found");}
        if (decodeWords) {
            emlObj.rawHeader = Mime.replaceEncodedWord(emlObj.rawHeader);
        }
        let retval = [new File([emlObj.rawHeader], "Header", {type: "text/plain"})];
        this._walkMime(emlObj).forEach(function(fileObj){
            let name = fileObj.name;
            if (fileObj.name === null) {
                if ("subject" in emlObj.header) {
                    name = emlObj.header["subject"][0];
                } else {
                    name = "Undefined";
                }
                name = name.concat(Mime.getFileExt(fileObj.type));
            }
            retval.push(new File([fileObj.data], name, {type: fileObj.type}));
        });
        return retval;
    }

    static getFileExt(mimetype) {
        switch (mimetype) {
            case "text/plain":
                return ".txt";
            case "text/html":
                return ".htm";
            case "application/rtf":
                return ".rtf";
        }
        return ".bin";
    }

    /**
     * Walks a MIME document and returns an array of Mime data and header objects.
     *
     * @param {string} input
     * @param {object} header
     * @returns {object[]}
     */
    _walkMime(parentObj) {
        let new_line_length = this.rn ? 2 : 1;
        let contType = null, fileName = null, charEnc = null, contDispoObj = null;
        if (parentObj.header.hasOwnProperty("content-type")) {
            let contTypeObj = Mime._decodeComplexField(parentObj.header["content-type"][0]);
            if (parentObj.header.hasOwnProperty("content-disposition")) {
                contDispoObj = Mime._decodeComplexField(parentObj.header["content-disposition"][0])
                if (contDispoObj != null && contDispoObj.hasOwnProperty("filename")) {
                    fileName = contDispoObj.filename;
                }
            }
            if (contTypeObj != null) {
                if (contTypeObj.hasOwnProperty("value")) {
                    contType = contTypeObj.value[0];
                }
                if (contTypeObj.hasOwnProperty("charset")) {
                    charEnc = contTypeObj.charset;
                }
                if (fileName == null && contTypeObj.hasOwnProperty("name")) {
                    fileName = contTypeObj.name;
                }
            }
            if (contType.startsWith("multipart/")) {
                let output_sections = [];
                if (!contTypeObj.hasOwnProperty("boundary")) {
                    throw new OperationError("Invalid mulitpart section no boundary");
                }
                let mime_parts = this._splitMultipart(parentObj.body, contTypeObj.boundary, new_line_length);
                mime_parts.forEach(function(mime_part){
                    let mimeObj = Mime._splitParseHead(mime_part);
                    if (!mimeObj.body) {
                        return [];
                    }
                    this._walkMime(mimeObj).forEach(function(part){
                        output_sections.push(part);
                    }, this);
                }, this);
                return output_sections;
            }
            if (parentObj.header.hasOwnProperty("content-transfer-encoding")) {
                let contEncObj = Mime._decodeComplexField(parentObj.header["content-transfer-encoding"][0]);
                if (contEncObj != null && contEncObj.hasOwnProperty("value")) {
                    parentObj.body = Mime._decodeMimeData(parentObj.body, charEnc, contEncObj.value[0]);
                }
            }
            return [{type: contType, data: parentObj.body, name: fileName}];
        }
        throw new OperationError("Invalid Mime section");
     }

    /**
     * Takes a string and decodes quoted words inside them
     * These take the form of =?utf-8?Q?Hello?=
     *
     * @param {string} input
     * @returns {string}
     */
    static replaceEncodedWord(input) {
        return input.replace(/=\?([^?]+)\?(Q|B)\?([^?]+)\?=/g, function (a, charEnc, contEnc, input) {
            contEnc = (contEnc === "B") ? "base64" : "quoted-printable";
            if (contEnc === "quoted-printable") {
                input = input.replace(/_/g, " ");
            }
            return Mime._decodeMimeData(input, charEnc, contEnc);
        });
    }


    /**
     * Breaks the header from the body and parses the header. The returns an
     * object or null. The object contains the raw header, decoded body, and
     * parsed header object.
     *
     * @param {string} input
     * @returns {object}
     */
    static _splitParseHead(input) {
        const emlRegex = /(?:\r?\n){2}/g;
        let matchobj = emlRegex.exec(input);
        if (matchobj) {
            let splitEmail = [input.substring(0,matchobj.index), input.substring(emlRegex.lastIndex)];
            const sectionRegex = /([A-Za-z-]+):\s+([\x00-\xff]+?)(?=$|\r?\n\S)/g;
            let headerObj = {}, section;
            while ((section = sectionRegex.exec(splitEmail[0]))) {
                let fieldName = section[1].toLowerCase();
                let fieldValue = Mime.replaceEncodedWord(section[2].replace(/\n|\r/g, " "));
                if (fieldName in headerObj) {
                    headerObj[fieldName].push(fieldValue);
                } else {
                    headerObj[fieldName] = [fieldValue];
                }
            }
            return {rawHeader:splitEmail[0], body: splitEmail[1], header: headerObj};
        }
        return null;
    }

    /**
     * Return decoded MIME data given the character encoding and content encoding.
     *
     * @param {string} input
     * @param {string} charEnc
     * @param {string} contEnc
     * @returns {string}
     */
    static _decodeMimeData(input, charEnc, contEnc) {
        switch (contEnc) {
            case "base64":
                input = fromBase64(input);
                break;
            case "quoted-printable":
                input = Utils.byteArrayToUtf8(decodeQuotedPrintable(input));
                break;
            case "x-uuencode":
                //TODO: need to trim before and after;
                let match = /^\s*begin[^\n]+\n(.*)\r?\n`\r?\nend\s*$/gs.exec(input);
                let lineReg = /\r?\n?.(.*)$/gm;
                let line = null;
                let lines = [];
                while ((line = lineReg.exec(match[1]))) {
                    lines.push(fromBase64(line[1], " -_"));
                }
                if (match) {
                    input = lines.join("");
                } else {
                    throw new OperationError("Invalid uuencoding");
                }
                break;
        }
        if (charEnc && MIME_FORMAT.hasOwnProperty(charEnc.toLowerCase())) {
            input = cptable.utils.decode(MIME_FORMAT[charEnc.toLowerCase()], input);
        }
        return input;
    }

    /**
     * Parses a complex header field and returns an object that contains
     * normalized keys with corresponding values along with single values under
     * a value array.
     *
     * @param {string} field
     * @returns {object}
     */
    static _decodeComplexField(field) {
        let fieldSplit = field.split(/;\s+/g);
        let retVal = {};
        fieldSplit.forEach(function(item){
            let eq = item.indexOf("=");
            if (eq >= 0) {
                if (item.length > eq) {
                    let kv = [item.substring(0, eq), item.substring(eq + 1).trim()];
                    if ((kv[1].startsWith("\'") && kv[1].endsWith("\'"))
                        || (kv[1].startsWith("\"") && kv[1].endsWith("\""))) {
                        kv[1] = (/(['"])(.+)\1/.exec(kv[1]))[2];
                    }
                    retVal[kv[0].toLowerCase()] = kv[1];
                } else {
                    throw OperationError("Not a valid header entry");
                }
            } else {
                item = item.trim().toLowerCase();
                if (retVal.hasOwnProperty("value")) {
                    retVal.value.push(item);
                } else {
                    retVal.value = [item];
                }
            }
        });
        return retVal;
    }

    /**
     * Splits a Mime document by the current boundaries and attempts to account
     * for the current new line size which can be either the standard \r\n or \n.
     *
     * @param {string} input
     * @param {string} boundary
     * @param {string} new_line_length
     * @return {string[]}
     */
    _splitMultipart(input, boundary, new_line_length) {
        let output = [];
        const boundary_str = "--".concat(boundary, this.rn ? "\r\n" : "\n");
        let last = input.indexOf("--".concat(boundary, "--")) - new_line_length;
        let start = 0;
        while(true) {
            let start = input.indexOf(boundary_str, start);
            if (start < 0) {
                break;
            }
            start = start + boundary_str.length;
            let end = input.indexOf(boundary_str, start) - new_line_length;
            if (end <= start) {
                break;
            }
            output.push(input.substring(start, end));
            start = end;
        }
        return output;
    }
}

export default Mime;
