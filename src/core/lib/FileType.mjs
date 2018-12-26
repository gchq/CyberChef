/**
 * File type functions
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 *
 */
import {FILE_SIGNATURES} from "./FileSignatures";


/**
 * Checks whether a signature matches a buffer.
 *
 * @param {Object|Object[]} sig - A dictionary of offsets with values assigned to them.
 *   These values can be numbers for static checks, arrays of potential valid matches,
 *   or bespoke functions to check the validity of the buffer value at that offset.
 * @param {Uint8Array} buf
 * @returns {boolean}
 */
function signatureMatches(sig, buf) {
    if (sig instanceof Array) {
        return sig.reduce((acc, s) => acc || bytesMatch(s, buf), false);
    } else {
        return bytesMatch(sig, buf);
    }
}


/**
 * Checks whether a set of bytes match the given buffer.
 *
 * @param {Object} sig - A dictionary of offsets with values assigned to them.
 *   These values can be numbers for static checks, arrays of potential valid matches,
 *   or bespoke functions to check the validity of the buffer value at that offset.
 * @param {Uint8Array} buf
 * @returns {boolean}
 */
function bytesMatch(sig, buf) {
    for (const offset in sig) {
        switch (typeof sig[offset]) {
            case "number": // Static check
                if (buf[offset] !== sig[offset])
                    return false;
                break;
            case "object": // Array of options
                if (sig[offset].indexOf(buf[offset]) < 0)
                    return false;
                break;
            case "function": // More complex calculation
                if (!sig[offset](buf[offset]))
                    return false;
                break;
            default:
                throw new Error(`Unrecognised signature type at offset ${offset}`);
        }
    }
    return true;
}


/**
 * Given a buffer, detects magic byte sequences at specific positions and returns the
 * extension and mime type.
 *
 * @param {Uint8Array} buf
 * @returns {Object[]} types
 * @returns {string} type.name - Name of file type
 * @returns {string} type.ext - File extension
 * @returns {string} type.mime - Mime type
 * @returns {string} [type.desc] - Description
 */
export function detectFileType(buf) {
    if (!(buf && buf.length > 1)) {
        return [];
    }

    const matchingFiles = [];

    // TODO allow user to select which categories to check
    for (const cat in FILE_SIGNATURES) {
        const category = FILE_SIGNATURES[cat];

        category.forEach(filetype => {
            if (signatureMatches(filetype.signature, buf)) {
                matchingFiles.push(filetype);
            }
        });
    }
    return matchingFiles;
}


/**
 * Detects whether the given buffer is a file of the type specified.
 *
 * @param {string|RegExp} type
 * @param {Uint8Array} buf
 * @returns {string|false} The mime type or false if the type does not match
 */
export function isType(type, buf) {
    const types = detectFileType(buf);

    if (!(types && types.length)) return false;

    if (typeof type === "string") {
        return types[0].mime.startsWith(type) ? types[0].mime : false;
    } else if (type instanceof RegExp) {
        return type.test(types[0].mime) ? types[0].mime : false;
    } else {
        throw new Error("Invalid type input.");
    }
}


/**
 * Detects whether the given buffer contains an image file.
 *
 * @param {Uint8Array} buf
 * @returns {string|false} The mime type or false if the type does not match
 */
export function isImage(buf) {
    return isType("image", buf);
}


/**
 * Attempts to extract a file from a data stream given its offset and extractor function.
 *
 * @param {Uint8Array} bytes
 * @param {Object} fileDetail
 * @param {string} fileDetail.mime
 * @param {string} fileDetail.extension
 * @param {Function} fileDetail.extractor
 * @param {number} offset
 * @returns {File}
 */
export function extractFile(bytes, fileDetail, offset) {
    if (fileDetail.extractor) {
        const fileData = fileDetail.extractor(bytes, offset);
        const ext = fileDetail.extension.split(",")[0];
        return new File([fileData], `extracted_at_0x${offset.toString(16)}.${ext}`);
    }

    throw new Error(`No extraction algorithm available for "${fileDetail.mime}" files`);
}
