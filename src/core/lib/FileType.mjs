/**
 * File type functions
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 *
 */
import { FILE_SIGNATURES } from "./FileSignatures.mjs";
import { sendStatusMessage } from "../Utils.mjs";

/**
 * Checks whether a signature matches a buffer.
 *
 * @param {Object|Object[]} sig - A dictionary of offsets with values assigned to them.
 *   These values can be numbers for static checks, arrays of potential valid matches,
 *   or bespoke functions to check the validity of the buffer value at that offset.
 * @param {Uint8Array} buf
 * @param {number} [offset=0] Where in the buffer to start searching from
 * @returns {boolean}
 */
function signatureMatches(sig, buf, offset = 0) {
    // Using a length check seems to be more performant than `sig instanceof Array`
    if (sig.length) {
        // sig is an Array - return true if any of them match
        // The following `reduce` method is nice, but performance matters here, so we
        // opt for a faster, if less elegant, for loop.
        // return sig.reduce((acc, s) => acc || bytesMatch(s, buf, offset), false);
        for (let i = 0; i < sig.length; i++) {
            if (bytesMatch(sig[i], buf, offset)) return true;
        }
        return false;
    } else {
        return bytesMatch(sig, buf, offset);
    }
}

/**
 * Checks whether a set of bytes match the given buffer.
 *
 * @param {Object} sig - A dictionary of offsets with values assigned to them.
 *   These values can be numbers for static checks, arrays of potential valid matches,
 *   or bespoke functions to check the validity of the buffer value at that offset.
 * @param {Uint8Array} buf
 * @param {number} [offset=0] Where in the buffer to start searching from
 * @returns {boolean}
 */
function bytesMatch(sig, buf, offset = 0) {
    for (const sigoffset in sig) {
        const pos = parseInt(sigoffset, 10) + offset;
        switch (typeof sig[sigoffset]) {
            case "number": // Static check
                if (buf[pos] !== sig[sigoffset]) return false;
                break;
            case "object": // Array of options
                if (sig[sigoffset].indexOf(buf[pos]) < 0) return false;
                break;
            case "function": // More complex calculation
                if (!sig[sigoffset](buf[pos])) return false;
                break;
            default:
                throw new Error(`Unrecognised signature type at offset ${sigoffset}`);
        }
    }
    return true;
}

/**
 * Given a buffer, detects magic byte sequences at specific positions and returns the
 * extension and mime type.
 *
 * @param {Uint8Array|ArrayBuffer} buf
 * @param {string[]} [categories=All] - Which categories of file to look for
 * @returns {Object[]} types
 * @returns {string} type.name - Name of file type
 * @returns {string} type.ext - File extension
 * @returns {string} type.mime - Mime type
 * @returns {string} [type.desc] - Description
 */
export function detectFileType(buf, categories = Object.keys(FILE_SIGNATURES)) {
    if (buf instanceof ArrayBuffer) {
        buf = new Uint8Array(buf);
    }

    if (!(buf && buf.length > 1)) {
        return [];
    }

    const matchingFiles = [];
    const signatures = {};

    for (const cat in FILE_SIGNATURES) {
        if (categories.includes(cat)) {
            signatures[cat] = FILE_SIGNATURES[cat];
        }
    }

    for (const cat in signatures) {
        const category = signatures[cat];

        category.forEach((filetype) => {
            if (signatureMatches(filetype.signature, buf)) {
                matchingFiles.push(filetype);
            }
        });
    }
    return matchingFiles;
}

/**
 * Given a buffer, searches for magic byte sequences at all possible positions and returns
 * the extensions and mime types.
 *
 * @param {Uint8Array} buf
 * @param {string[]} [categories=All] - Which categories of file to look for
 * @returns {Object[]} foundFiles
 * @returns {number} foundFiles.offset - The position in the buffer at which this file was found
 * @returns {Object} foundFiles.fileDetails
 * @returns {string} foundFiles.fileDetails.name - Name of file type
 * @returns {string} foundFiles.fileDetails.ext - File extension
 * @returns {string} foundFiles.fileDetails.mime - Mime type
 * @returns {string} [foundFiles.fileDetails.desc] - Description
 */
export function scanForFileTypes(buf, categories = Object.keys(FILE_SIGNATURES)) {
    if (!(buf && buf.length > 1)) {
        return [];
    }

    const foundFiles = [];
    const signatures = {};

    for (const cat in FILE_SIGNATURES) {
        if (categories.includes(cat)) {
            signatures[cat] = FILE_SIGNATURES[cat];
        }
    }

    for (const cat in signatures) {
        const category = signatures[cat];

        for (let i = 0; i < category.length; i++) {
            const filetype = category[i];
            const sigs = filetype.signature.length ? filetype.signature : [filetype.signature];

            sigs.forEach((sig) => {
                let pos = 0;
                while ((pos = locatePotentialSig(buf, sig, pos)) >= 0) {
                    if (bytesMatch(sig, buf, pos)) {
                        sendStatusMessage(`Found potential signature for ${filetype.name} at pos ${pos}`);
                        foundFiles.push({
                            offset: pos,
                            fileDetails: filetype
                        });
                    }
                    pos++;
                }
            });
        }
    }

    // Return found files in order of increasing offset
    return foundFiles.sort((a, b) => {
        return a.offset - b.offset;
    });
}

/**
 * Fastcheck function to quickly scan the buffer for the first byte in a signature.
 *
 * @param {Uint8Array} buf - The buffer to search
 * @param {Object} sig - A single signature object (Not an array of signatures)
 * @param {number} offset - Where to start search from
 * @returns {number} The position of the match or -1 if one cannot be found.
 */
function locatePotentialSig(buf, sig, offset) {
    // Find values for first key and value in sig
    const k = parseInt(Object.keys(sig)[0], 10);
    const v = Object.values(sig)[0];
    switch (typeof v) {
        case "number":
            return buf.indexOf(v, offset + k) - k;
        case "object":
            for (let i = offset + k; i < buf.length; i++) {
                if (v.indexOf(buf[i]) >= 0) return i - k;
            }
            return -1;
        case "function":
            for (let i = offset + k; i < buf.length; i++) {
                if (v(buf[i])) return i - k;
            }
            return -1;
        default:
            throw new Error("Unrecognised signature type");
    }
}

/**
 * Detects whether the given buffer is a file of the type specified.
 *
 * @param {string|RegExp} type
 * @param {Uint8Array|ArrayBuffer} buf
 * @returns {string|false} The mime type or false if the type does not match
 */
export function isType(type, buf) {
    const types = detectFileType(buf);

    if (!types.length) return false;

    if (typeof type === "string") {
        return types.reduce((acc, t) => {
            const mime = t.mime.startsWith(type) ? t.mime : false;
            return acc || mime;
        }, false);
    } else if (type instanceof RegExp) {
        return types.reduce((acc, t) => {
            const mime = type.test(t.mime) ? t.mime : false;
            return acc || mime;
        }, false);
    } else {
        throw new Error("Invalid type input.");
    }
}

/**
 * Detects whether the given buffer contains an image file.
 *
 * @param {Uint8Array|ArrayBuffer} buf
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
        sendStatusMessage(`Attempting to extract ${fileDetail.name} at pos ${offset}...`);
        const fileData = fileDetail.extractor(bytes, offset);
        const ext = fileDetail.extension.split(",")[0];
        return new File([fileData], `extracted_at_0x${offset.toString(16)}.${ext}`, {
            type: fileDetail.mime
        });
    }

    throw new Error(`No extraction algorithm available for "${fileDetail.mime}" files`);
}
