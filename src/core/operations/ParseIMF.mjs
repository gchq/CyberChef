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

// TODO: fix function header
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
    run(input, args) {
        // TODO: need to add Non-Mime emails
        // TODO: need to add header info to output
        // TODO: no uuencode function. see if we can fix this
        // TODO: Need to parse multipart headers better as they are key value pairs separated by a ";\s+".
        if (!input) {
            return [];
        }
        let headerBody = ParseIMF.splitHeaderFromBody(input);
        let headerArray = ParseIMF.parseHeader(headerBody[0]);
        if (args[0] && headerBody.length > 0) {
            headerBody[0] = ParseIMF.replaceDecodeWord(headerBody[0]);
        }
        let retfiles = ParseIMF.walkMime(headerBody[1], headerArray, input.indexOf("\r") >= 0);
        let retval = [];
        retfiles.forEach(function(fileObj){
            let file = null;
            if (fileObj.name !== null) {
                file = new File([fileObj.data], fileObj.name, {type: fileObj.type});
            } else {
                let name = ParseIMF.replaceDecodeWord(headerArray["subject"][0]).concat(".");
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
    static walkMime(input, header, rn) {
        let new_line_length = rn ? 2 : 1;
        const content_type_reg = /([^;]+);\s+boundary\=(['"])(.+?)\2/g;
        const inner_content_type_reg = /^([^;]+);\s+type\=(['"])(.+?)\2;\s+boundary\=(['"])(.+?)\4/g;
        let output_sections = [];
        if (header.hasOwnProperty("mime-version") || (header.hasOwnProperty("content-type") && header["content-type"][0].startsWith("multipart/"))) {
            let content_boundary = null;
            let idx = 3;
            if (header["content-type"][0].indexOf("type=") > 0) {
                content_boundary = inner_content_type_reg.exec(header["content-type"][0]);
                idx = 5;
            } else {
                content_boundary = content_type_reg.exec(header["content-type"][0]);
            }
            let mime_parts = ParseIMF.splitMultipart(input, content_boundary[idx], new_line_length);
            mime_parts.forEach(function(mime_part){
                let headerBody = ParseIMF.splitHeaderFromBody(mime_part);
                let headerArray = ParseIMF.parseHeader(headerBody[0]);
                let parts = ParseIMF.walkMime(headerBody[1], headerArray, rn);
                parts.forEach(function(part){
                    output_sections.push(part);
                });
            });
        } else if (header.hasOwnProperty("content-type") && header.hasOwnProperty("content-transfer-encoding")) {
            let contType = null;
            let dataValue = null;
            let fileName = null;
            let charEnc = null;
            // TODO: if there is no content disposition filename try content type name.
            if (header.hasOwnProperty("content-disposition")) {
                const cont_disp = /^([^;]+);.*?filename\=(['"]?)(.+?)\2$/g;
                let dispo = cont_disp.exec(header["content-disposition"][0]);
                // TODO: Remove path if it contains it.
                fileName = dispo[3];
                const cont_type_file = /^([^;]+);\s+name\=(["']?)(.+?)\2$/g;
                let content = cont_type_file.exec(header["content-type"][0]);
                let contType = content[1];
            } else {
                const cont_type_data_reg = /^([^;]+);\s+charset\=(['"]?)(.+?)\2$/g;
                let content = cont_type_data_reg.exec(header["content-type"][0]);
                contType = content[1];
                charEnc = content[3]
            }
            dataValue = ParseIMF.decodeMimeData(input, charEnc, header["content-transfer-encoding"][0]);
            return [{type: contType, data: dataValue, name: fileName}];
        } else {
            throw new OperationError("Invalid Mime section");
        }
        return output_sections;
     }

    /**
     * Breaks the header from the body and returns [header, body]
     *
     * @param {string} input
     * @returns {string[]}
     */
    static splitHeaderFromBody(input) {
        const emlRegex = /^([\x20-\xff\n\r\t]+?)(?:\r?\n){2}([\x20-\xff\t\n\r]*)/;
        let splitEmail = emlRegex.exec(input);
        if (splitEmail) {
            //TODO: Array splice vs shift?
            splitEmail.shift();
            return splitEmail;
        }
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
     * Breaks a header into a object to be used by other functions.
     * It removes any line feeds or carriage returns from the values and
     * replaces it with a space.
     *
     * @param {string} input
     * @returns {object}
     */
    static parseHeader(input) {
        const sectionRegex = /([A-Za-z-]+):\s+([\x20-\xff\r\n\t]+?)(?=$|\r?\n\S)/g;
        let header = {}, section;
        while ((section = sectionRegex.exec(input))) {
            let fieldName = section[1].toLowerCase();
            let fieldValue = section[2].replace(/\n|\r/g, " ");
            if (header[fieldName]) {
                header[fieldName].push(fieldValue);
            } else {
                header[fieldName] = [fieldValue];
            }
        }
        return header;
    }

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
