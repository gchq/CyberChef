import OperationError from "../errors/OperationError";
import cptable from "../vendor/js-codepage/cptable.js";
import {decodeQuotedPrintable} from "../lib/QuotedPrintable";
import {MIME_FORMAT} from "../lib/ChrEnc";
import Utils from "../Utils";

/**
 * Class to do general Mime format parsing
 *
 * @author bwhitn [brian.m.whitney@outlook.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */
class Mime {
    /**
     * Mime Constructor
     */
    constructor(input) {
        this.mimeObj = Mime._parseMime(input);
    }

    /**
     * Extract data from mimeObjects and return object array containing them.
     * extractData([["testa", "header", "subheader"], ["testb", "header"]]) would
     * returns an array of objects {fields: {testa: "somestringornull", testb: "somestringornull"}, header: "somestringornull", body: "somestringornull"}
     *
     * @param {string[][]} headerObjects
     * @param {boolean} header
     * @param {boolean} body
     * @param {boolean} recursive
     * @returns {object[]}
     */
    extractData(headerObjects, header=true, body=true, recursive=true) {
        const output = [];
        Mime.walkMime(this.mimeObj, function(mimePart) {
            const outObj = {};
            outObj.fields = {};
            if (body) {
                const contType = Mime._extractField(mimePart, "content-type");
                if (contType && !contType.startsWith("multipart/")) {
                    outObj.body = mimePart.body;
                } else {
                    outObj.body = null;
                }
            }
            if (header) {
                outObj.header = mimePart.rawHeader;
            }
            if (!headerObjects) {
                output.push(outObj);
                return;
            }
            if (!Array.isArray(headerObjects)) {
                throw new OperationError("Invalid extraction in headers. Not an Array.");
            }
            headerObjects.forEach(function(obj) {
                if (!Array.isArray(obj)) {
                    throw new OperationError("Invalid extraction in headers Object. Not an Array.");
                }
                switch (obj.length) {
                    case 2:
                        outObj.fields[obj[0]] = Mime._extractField(mimePart, obj[1]);
                        break;
                    case 3:
                        outObj.fields[obj[0]] = Mime._extractField(mimePart, obj[1], obj[2]);
                        break;
                    default:
                        throw new OperationError("Invalid extraction in headers. Invalid Array size.");
                }
            });
            output.push(outObj);
        }, recursive);
        return output;
    }

    /**
     * Common helper function to decode Mime encoded words in headers.
     *
     * @param {boolean} recursive
     */
    decodeHeaderWords(recursive=true) {
        Mime.walkMime(this.mimeObj, function(mimePart) {
            if (mimePart.rawHeader) {
                mimePart.rawHeader = Mime.replaceEncodedWord(mimePart.rawHeader);
            }
        }, recursive);
    }

    /**
     * Common helper function to decode Mime bodies.
     *
     * @param {boolean} recursive
     */
    decodeMimeObjects(recursive=true) {
        Mime.walkMime(this.mimeObj, function(mimePart) {
            Mime.decodeMimeMessage(mimePart);
        }, recursive);
    }

    /**
     * Walks a MIME document and returns a Mime Object.
     *
     * @param {string} mimeData
     * @returns {object}
     */
    static _parseMime(mimeData) {
        const mimeObj = Mime._splitParseHead(mimeData);
        const contType = Mime._extractField(mimeObj, "content-type");
        const boundary = Mime._extractField(mimeObj, "content-type", "boundary");
        if (mimeObj.body && contType && contType.startsWith("multipart/")) {
            if (!boundary) {
                throw new OperationError("Invalid mulitpart section no boundary");
            }
            const sections = [];
            for (const val of Mime._splitMultipart(mimeObj.body, boundary)) {
                sections.push(Mime._parseMime(val));
            }
            if (sections.length) {
                mimeObj.body = sections;
            }
        }
        return mimeObj;
    }

    /**
     * Executes a function on a mime object. These methods should modify the mimeObj.
     *
     * @param {Object} mimeObj
     * @param {function} methods
     * @param {boolean} recursive
     */
    static walkMime(mimeObj, method, recursive=true) {
        const contType = Mime._extractField(mimeObj, "content-type");
        method(mimeObj);
        if (recursive && mimeObj.body && Array.isArray(mimeObj.body) && contType && contType.startsWith("multipart/")) {
            mimeObj.body.forEach(function(obj) {
                Mime.walkMime(obj, method);
            });
        }
    }

    /**
     * Attempts to decode a mimeObj's data by applying appropriate character and content decoders based on the header data.
     *
     * @param {Object} mimeObj
     */
    static decodeMimeMessage(mimeObj) {
        const contType = Mime._extractField(mimeObj, "content-type");
        const contEnc = Mime._extractField(mimeObj, "content-transfer-encoding");
        let charEnc = Mime._extractField(mimeObj, "content-type", "charset");
        if (contType != null) {
            if (!charEnc && contType.startsWith("text/")) {
                charEnc = "us-ascii";
            }
        }
        if (mimeObj.body && contEnc && typeof mimeObj.body === "string") {
            mimeObj.body = Mime._decodeMimeData(mimeObj.body, charEnc, contEnc);
        }
    }

    /**
     * Takes a string and decodes quoted words inside them
     * These take the form of:
     * input "=?utf-8?Q?Hello_World!?="
     * output "Hello World!"
     *
     * @param {string} input
     * @param {string} type
     * @returns {string}
     */
    static replaceEncodedWord(input) {
        return input.replace(/=\?([^?]+)\?(Q|B)\?([^?]+)\?=/g, function (a, charEnc, contEnc, input) {
            contEnc = (contEnc === "B") ? "base64" : "quoted-printable";
            if (contEnc === "quoted-printable") {
                input = input.replace(/_/g, " ");
            }
            return Utils.byteArrayToUtf8(Mime._decodeMimeData(input, charEnc, contEnc));
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
        const matchObj = emlRegex.exec(input);
        if (matchObj) {
            const splitEmail = [input.substring(0, matchObj.index), input.substring(emlRegex.lastIndex)];
            return {rawHeader: splitEmail[0], body: splitEmail[1], header: Mime._parseHeader(splitEmail[0])};
        }
        return {rawHeader: input, body: null, header: Mime._parseHeader(input)};
    }

    /**
     *
     *
     *
     */
    static _parseHeader(input) {
        const sectionRegex = /([A-Za-z-]+):\s+([\x00-\xff]+?)(?=$|\r?\n\S)/g;
        const headerObj = {};
        let section;
        while ((section = sectionRegex.exec(input))) {
            const fieldName = section[1].toLowerCase();
            const fieldValue = Mime.replaceEncodedWord(section[2].replace(/\n|\r/g, " "));
            if (fieldName in headerObj) {
                headerObj[fieldName].push(fieldValue);
            } else {
                headerObj[fieldName] = [fieldValue];
            }
        }
        return headerObj;
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
        try {
            switch (contEnc) {
                case "base64":
                    input = Utils.convertToByteArray(input, "base64");
                    break;
                case "quoted-printable":
                    input = decodeQuotedPrintable(input);
            }
            if (charEnc && MIME_FORMAT.hasOwnProperty(charEnc.toLowerCase())) {
                input = Utils.strToByteArray(cptable.utils.decode(MIME_FORMAT[charEnc.toLowerCase()], input));
            }
            return input;
        } catch (err) {
            throw new OperationError("Invalid Mime Format");
        }
    }

    /**
     * Parses a header field and returns an object that contains
     * normalized keys with corresponding values along with single values under
     * a value array.
     *
     * @param {string} field
     * @returns {string}
     */
    static _extractField(mimeObj, field, subfield=null) {
        if (subfield) {
            subfield = subfield.toLowerCase();
        }
        if (mimeObj.header.hasOwnProperty(field)) {
            const fieldSplit = mimeObj.header[field][0].split(/;\s+/g);
            for (let i = 0; i < fieldSplit.length; i++) {
                const eq = fieldSplit[i].indexOf("=");
                if (eq >= 0 && fieldSplit[i].length > eq && subfield) {
                    const kv = [fieldSplit[i].substring(0, eq), fieldSplit[i].substring(eq + 1).trim()];
                    if ((kv[1].startsWith("'") && kv[1].endsWith("'")) || (kv[1].startsWith("\"") && kv[1].endsWith("\""))) {
                        const val = (/(['"])(.+)\1/.exec(kv[1]));
                        if (val && val.length === 3) {
                            kv[1] = val[2];
                        }
                    }
                    if (subfield === kv[0].toLowerCase()) {
                        return kv[1];
                    }
                } else if (!subfield){
                    return fieldSplit[i].trim().toLowerCase();
                }
            }
        }
        return null;
    }

    /**
     * Splits a Mime document by the current boundaries and attempts to account
     * for the current new line size which can be either the standard \r\n or \n.
     *
     * @param {string} input
     * @param {string} boundary
     * @return {string[]}
     */
    static *_splitMultipart(input, boundary) {
        const newline = input.indexOf("\r") >= 0 ? "\r\n" : "\n";
        const boundaryStr = "--".concat(boundary);
        const boundaryStrEnd = newline.concat(boundaryStr);
        const last = input.indexOf(boundaryStrEnd.concat("--"));
        let begin = 0;
        for (let end = 0; end !== last; begin = end) {
            begin = input.indexOf(boundaryStr, begin);
            if (begin < 0) {
                break;
            }
            begin += boundaryStr.length;
            end = input.indexOf(boundaryStrEnd, begin);
            if (end <= begin) {
                break;
            }
            yield input.substring(begin, end);
        }
    }
}

export default Mime;
