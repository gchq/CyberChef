/**
 * @author bwhitn [brian.m.whitney@outlook.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import cptable from "../vendor/js-codepage/cptable.js";
import {fromBase64} from "../lib/Base64";
import {decodeQuotedPrintable} from "../lib/QuotedPrintable";
import {MIME_FORMAT} from "../lib/ChrEnc";
import Utils from "../Utils";

/**
 * Return the conetent encoding for a mime section from a header object.
 * CONTENT_TYPE returns the content type of a mime header from a header object.
 * Returns the filename from a mime header object.
 * Returns the boundary value for the mime section from a header object.
 * @constant
 * @default
 */
const FILE_TYPE_SUFFIX = {
    "text/plain": "txt",
    "text/html": "htm",
    "application/rtf": "rtf",
}

class ParseIMF extends Operation {

    /**
     * Internet MessageFormat constructor
     */
    constructor() {
        super();
        this.name = "Parse Internet Message Format";
        this.module = "Default";
        this.description = ["Parser an IMF formatted messages following RFC5322.",
            "<br><br>",
            "Parses an IMF formated message. These often have the file extention &quot;.eml&quote; and contain the email headers and body. The output will be a file list of the headers and mime parts.",
        ].join("\n");
        this.infoURL = "https://tools.ietf.org/html/rfc5322";
        this.inputType = "string";
        this.outputType = "List<File>";
        this.presentType = "html";
        this.args = [
            {
                "name": "Decode Quoted Words",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * Basic Email Parser that displays the header and mime sections as files.
     * Args 0 boolean decode quoted words
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {File[]}
     */
     // NOTE: Liberties taken include:
     // header normalization by lowercasing field names and certain header values
     // No checks are made to verify quoted words are valid encodings e.g. underscore vs escape
     // This attempts to decode mime reguardless if it is \r\n (correct newline) or \n (incorrect)
     // Both Base64 and QuotedPrintable is used for decode. UUEncode is not available right now and is a standardized encoding format.
    run(input, args) {
        // TODO: need to add Non-Mime email support
        // TODO Later: no uuencode function. See if we can fix this.
        // TODO: may want to do base64 decode of binary to bytearray.
        // TODO Later: need to look at binhex decoder maybe.
        if (!input) {
            return [];
        }
        let emlObj = ParseIMF.splitParse(input);
        if (!emlObj.body) { throw new OperationError("No body was found");}
        if (args[0]) {
            emlObj.rawHeader = ParseIMF.replaceDecodeWord(emlObj.rawHeader);
        }
        let retval = [new File([emlObj.rawHeader], "Header", {type: "text/plain"})];
        let retfiles = ParseIMF.walkMime(emlObj, input.indexOf("\r") >= 0);
        retfiles.forEach(function(fileObj){
            let file = null;
            if (fileObj.name !== null) {
                file = new File([fileObj.data], fileObj.name, {type: fileObj.type});
            } else {
                let name = emlObj.header["subject"][0].concat(".");
                if (fileObj.type in FILE_TYPE_SUFFIX) {
                    name = name.concat(FILE_TYPE_SUFFIX[fileObj.type]);
                } else {
                    name = name.concat("bin");
                }
                file = new File([fileObj.data], name, {type: fileObj.type});
            }
            retval.push(file);
        });
        return retval;
    }

    /**
     * Displays the files in HTML for web apps.
     *
     * @param {File[]} files
     * @returns {html}
     */
    async present(files) {
        return await Utils.displayFilesAsHTML(files);
    }

    /**
     * Walks a MIME document and returns an array of Mime data and header objects.
     *
     * @param {string} input
     * @param {object} header
     * @returns {object[]}
     */
    static walkMime(parentObj, rn) {
        let new_line_length = rn ? 2 : 1;
        let contType = null, fileName = null, charEnc = null, contDispoObj = null;
        if (parentObj.header.hasOwnProperty("content-type")) {
            let contTypeObj = ParseIMF.decodeComplexField(parentObj.header["content-type"][0]);
            if (parentObj.header.hasOwnProperty("content-disposition")) {
                contDispoObj = ParseIMF.decodeComplexField(parentObj.header["content-disposition"][0])
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
                let content_boundary = null;
                let output_sections = [];
                if (contTypeObj.hasOwnProperty("boundary")) {
                    content_boundary = contTypeObj.boundary;
                }
                let mime_parts = ParseIMF.splitMultipart(parentObj.body, content_boundary, new_line_length);
                mime_parts.forEach(function(mime_part){
                    let mimeObj = ParseIMF.splitParse(mime_part);
                    if (!mimeObj.body) {
                        return [];
                    }
                    let parts = ParseIMF.walkMime(mimeObj, rn);
                    parts.forEach(function(part){
                        output_sections.push(part);
                    });
                });
                return output_sections;
            }
            if (parentObj.header.hasOwnProperty("content-transfer-encoding")) {
                let contEncObj = ParseIMF.decodeComplexField(parentObj.header["content-transfer-encoding"][0]);
                let contTran = null;
                if (contEncObj != null && contEncObj.hasOwnProperty("value")) {
                    contTran = contEncObj.value[0];
                }
                if (contTran != null) {
                    parentObj.body = ParseIMF.decodeMimeData(parentObj.body, charEnc, contTran);
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
    static replaceDecodeWord(input) {
        return input.replace(/=\?([^?]+)\?(Q|B)\?([^?]+)\?=/g, function (a, charEnc, contEnc, input) {
            contEnc = (contEnc === "B") ? "base64" : "quoted-printable";
            if (contEnc === "quoted-printable") {
                input = input.replace(/_/g, " ");
            }
            return ParseIMF.decodeMimeData(input, charEnc, contEnc);
        });
    }


    /**
     * Breaks the header from the body and returns [header, body]
     *
     * @param {string} input
     * @returns {string[]}
     */
    static splitParse(input) {
        const emlRegex = /(?:\r?\n){2}/g;
        let matchobj = emlRegex.exec(input);
        if (matchobj) {
            let splitEmail = [input.substring(0,matchobj.index), input.substring(emlRegex.lastIndex)];
            const sectionRegex = /([A-Za-z-]+):\s+([\x00-\xff]+?)(?=$|\r?\n\S)/g;
            let headerObj = {}, section;
            while ((section = sectionRegex.exec(splitEmail[0]))) {
                let fieldName = section[1].toLowerCase();
                let fieldValue = ParseIMF.replaceDecodeWord(section[2].replace(/\n|\r/g, " "));
                if (fieldName in headerObj) {
                    headerObj[fieldName].push(fieldValue);
                } else {
                    headerObj[fieldName] = [fieldValue];
                }
            }
            return {rawHeader:splitEmail[0], body: splitEmail[1],  header: headerObj};
        }
        return {rawHeader: null, body:null, header:null};
    }

    /**
     * Breaks a header into a object to be used by other functions.
     * It removes any line feeds or carriage returns from the values and
     * replaces it with a space.
     *
     * @param {string} input
     * @returns {object}
     *
    static parseHeader(input) {
        const sectionRegex = /([A-Za-z-]+):\s+([\x00-\xff]+?)(?=$|\r?\n\S)/g;
        let header = {}, section;
        while ((section = sectionRegex.exec(input))) {
            let fieldName = section[1].toLowerCase();
            let fieldValue = ParseIMF.replaceDecodeWord(section[2].replace(/\n|\r/g, " "));
            if (header[fieldName]) {
                header[fieldName].push(fieldValue);
            } else {
                header[fieldName] = [fieldValue];
            }
        }
        return header;
    } */

    /**
     * Return decoded MIME data given the character encoding and content encoding.
     *
     * @param {string} input
     * @param {string} charEnc
     * @param {string} contEnc
     * @returns {string}
     */
    static decodeMimeData(input, charEnc, contEnc) {
        switch (contEnc) {
            case "base64":
                input = fromBase64(input);
                break;
            case "quoted-printable":
                input = Utils.byteArrayToUtf8(decodeQuotedPrintable(input));
                break;
            case "7bit":
            case "8bit":
            default:
                break;
        }
        if (charEnc && MIME_FORMAT.hasOwnProperty(charEnc.toLowerCase())) {
            input = cptable.utils.decode(MIME_FORMAT[charEnc.toLowerCase()], input);
        }
        return input;
    }

    /**
     *
     *
     *
     *
     *
     */
    static decodeComplexField(field) {
        let fieldSplit = field.split(/;\s+/g);
        let retVal = {};
        fieldSplit.forEach(function(item){
            if (item.indexOf("=") >= 0) {
                let eq = item.indexOf("=");
                let kv = null;
                if (item.length > eq) {
                    kv = [item.substring(0, eq), item.substring(eq + 1).trim()];
                } else {
                    throw OperationError("Not a valid header entry");
                }
                if ((kv[1].startsWith("\'") && kv[1].endsWith("\'"))
                    || (kv[1].startsWith("\"") && kv[1].endsWith("\""))) {
                    kv[1] = (/(['"])(.+)\1/.exec(kv[1]))[2];
                }
                retVal[kv[0].toLowerCase()] = kv[1];
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
     *
     *
     *
     *
     */
    static splitMultipart(input, boundary, new_line_length) {
        let output = [];
        let newline = new_line_length === 2 ? "\r\n" : "\n";
        const boundary_str = "--".concat(boundary, newline);
        const last = input.indexOf("--".concat(boundary, "--", newline)) - new_line_length;
        let start = 0;
        while(true) {
            let start = input.indexOf(boundary_str, start);
            if (start >= 0) {
                start = start + boundary_str.length;
            } else {
                break;
            }
            let end = input.indexOf(boundary_str, start) - new_line_length;
            if (end > start) {
                output.push(input.substring(start, end));
            } else {
                output.push(input.substring(start, last));
                break;
            }
            start = end;
        }
        return output;
    }
}

export default ParseIMF
