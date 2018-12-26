/**
 * File type functions
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 *
 */
import Stream from "./Stream";

/**
 * A categorised table of file types, including signatures to identifying them and functions
 * to extract them where possible.
 */
const FILE_SIGNATURES = {
    "Images": [
        {
            name: "JPEG Image",
            extension: "jpg",
            mime: "image/jpeg",
            description: "",
            signature: {
                0: 0xff,
                1: 0xd8,
                2: 0xff
            },
            extractor: extractJPEG
        },
        {
            name: "GIF Image",
            extension: "gif",
            mime: "image/gif",
            description: "",
            signature: {
                0: 0x47,
                1: 0x49,
                2: 0x46
            },
            extractor: null
        },
        {
            name: "PNG Image",
            extension: "png",
            mime: "image/png",
            description: "",
            signature: {
                0: 0x89,
                1: 0x50,
                2: 0x4e,
                3: 0x47
            },
            extractor: null
        },
        {
            name: "WEBP Image",
            extension: "webp",
            mime: "image/webp",
            description: "",
            signature: {
                8: 0x57,
                9: 0x45,
                10: 0x42,
                11: 0x50
            },
            extractor: null
        },
        {
            name: "TIFF Image",
            extension: "tif",
            mime: "image/tiff",
            description: "",
            signature: [
                {
                    0: 0x49,
                    1: 0x49,
                    2: 0x2a,
                    3: 0x0
                },
                {
                    0: 0x4d,
                    1: 0x4d,
                    2: 0x0,
                    3: 0x2a
                }
            ],
            extractor: null
        }, /*
        {
            name: " Image",
            extension: "",
            mime: "image/",
            description: "",
            signature: {
                0: 0x,
                1: 0x,
                2: 0x,
                3: 0x
            },
            extractor: null
        },
        {
            name: " Image",
            extension: "",
            mime: "image/",
            description: "",
            signature: {
                0: 0x,
                1: 0x,
                2: 0x,
                3: 0x
            },
            extractor: null
        },
        {
            name: " Image",
            extension: "",
            mime: "image/",
            description: "",
            signature: {
                0: 0x,
                1: 0x,
                2: 0x,
                3: 0x
            },
            extractor: null
        },
        {
            name: " Image",
            extension: "",
            mime: "image/",
            description: "",
            signature: {
                0: 0x,
                1: 0x,
                2: 0x,
                3: 0x
            },
            extractor: null
        },
        {
            name: " Image",
            extension: "",
            mime: "image/",
            description: "",
            signature: {
                0: 0x,
                1: 0x,
                2: 0x,
                3: 0x
            },
            extractor: null
        },
        {
            name: " Image",
            extension: "",
            mime: "image/",
            description: "",
            signature: {
                0: 0x,
                1: 0x,
                2: 0x,
                3: 0x
            },
            extractor: null
        },*/
    ],
    "Video": [
        {
            name: "WEBM",
            extension: "webm",
            mime: "video/webm",
            description: "",
            signature: {
                0: 0x1a,
                1: 0x45,
                2: 0xdf,
                3: 0xa3
            },
            extractor: null
        },
    ],
    "Audio": [
        {
            name: "WAV",
            extension: "wav",
            mime: "audio/x-wav",
            description: "",
            signature: {
                0: 0x52,
                1: 0x49,
                2: 0x46,
                3: 0x46,
                8: 0x57,
                9: 0x41,
                10: 0x56,
                11: 0x45
            },
            extractor: null
        },
        {
            name: "OGG",
            extension: "ogg",
            mime: "audio/ogg",
            description: "",
            signature: {
                0: 0x4f,
                1: 0x67,
                2: 0x67,
                3: 0x53
            },
            extractor: null
        },
    ],
    "Documents": [
        {
            name: "Portable Document Format",
            extension: "pdf",
            mime: "application/pdf",
            description: "",
            signature: {
                0: 0x25,
                1: 0x50,
                2: 0x44,
                3: 0x46
            },
            extractor: extractPDF
        },
    ],
    "Applications": [
        {
            name: "Windows Portable Executable",
            extension: "exe",
            mime: "application/x-msdownload",
            description: "",
            signature: {
                0: 0x4d,
                1: 0x5a
            },
            extractor: extractMZPE
        },
    ],
    "Archives": [
        {
            name: "ZIP",
            extension: "zip",
            mime: "application/zip",
            description: "",
            signature: {
                0: 0x50,
                1: 0x4b,
                2: [0x3, 0x5, 0x7],
                3: [0x4, 0x6, 0x8]
            },
            extractor: extractZIP
        },

    ],
};


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
 * @returns {Object[]} type
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

    // Delete all below this line once implemented in FILE_SIGNATURES above.


    /*
    // needs to be before `tif` check
    if (((buf[0] === 0x49 && buf[1] === 0x49 && buf[2] === 0x2A && buf[3] === 0x0) || (buf[0] === 0x4D && buf[1] === 0x4D && buf[2] === 0x0 && buf[3] === 0x2A)) && buf[8] === 0x43 && buf[9] === 0x52) {
        return {
            ext: "cr2",
            mime: "image/x-canon-cr2"
        };
    }

    if ((buf[0] === 0x49 && buf[1] === 0x49 && buf[2] === 0x2A && buf[3] === 0x0) || (buf[0] === 0x4D && buf[1] === 0x4D && buf[2] === 0x0 && buf[3] === 0x2A)) {
        return {
            ext: "tif",
            mime: "image/tiff"
        };
    }

    if (buf[0] === 0x42 && buf[1] === 0x4D) {
        return {
            ext: "bmp",
            mime: "image/bmp"
        };
    }

    if (buf[0] === 0x49 && buf[1] === 0x49 && buf[2] === 0xBC) {
        return {
            ext: "jxr",
            mime: "image/vnd.ms-photo"
        };
    }

    if (buf[0] === 0x38 && buf[1] === 0x42 && buf[2] === 0x50 && buf[3] === 0x53) {
        return {
            ext: "psd",
            mime: "image/vnd.adobe.photoshop"
        };
    }

    // needs to be before `zip` check
    if (buf[0] === 0x50 && buf[1] === 0x4B && buf[2] === 0x3 && buf[3] === 0x4 && buf[30] === 0x6D && buf[31] === 0x69 && buf[32] === 0x6D && buf[33] === 0x65 && buf[34] === 0x74 && buf[35] === 0x79 && buf[36] === 0x70 && buf[37] === 0x65 && buf[38] === 0x61 && buf[39] === 0x70 && buf[40] === 0x70 && buf[41] === 0x6C && buf[42] === 0x69 && buf[43] === 0x63 && buf[44] === 0x61 && buf[45] === 0x74 && buf[46] === 0x69 && buf[47] === 0x6F && buf[48] === 0x6E && buf[49] === 0x2F && buf[50] === 0x65 && buf[51] === 0x70 && buf[52] === 0x75 && buf[53] === 0x62 && buf[54] === 0x2B && buf[55] === 0x7A && buf[56] === 0x69 && buf[57] === 0x70) {
        return {
            ext: "epub",
            mime: "application/epub+zip"
        };
    }

    if (buf[257] === 0x75 && buf[258] === 0x73 && buf[259] === 0x74 && buf[260] === 0x61 && buf[261] === 0x72) {
        return {
            ext: "tar",
            mime: "application/x-tar"
        };
    }

    if (buf[0] === 0x52 && buf[1] === 0x61 && buf[2] === 0x72 && buf[3] === 0x21 && buf[4] === 0x1A && buf[5] === 0x7 && (buf[6] === 0x0 || buf[6] === 0x1)) {
        return {
            ext: "rar",
            mime: "application/x-rar-compressed"
        };
    }

    if (buf[0] === 0x1F && buf[1] === 0x8B && buf[2] === 0x8) {
        return {
            ext: "gz",
            mime: "application/gzip"
        };
    }

    if (buf[0] === 0x42 && buf[1] === 0x5A && buf[2] === 0x68) {
        return {
            ext: "bz2",
            mime: "application/x-bzip2"
        };
    }

    if (buf[0] === 0x37 && buf[1] === 0x7A && buf[2] === 0xBC && buf[3] === 0xAF && buf[4] === 0x27 && buf[5] === 0x1C) {
        return {
            ext: "7z",
            mime: "application/x-7z-compressed"
        };
    }

    if (buf[0] === 0x78 && buf[1] === 0x01) {
        return {
            ext: "dmg, zlib",
            mime: "application/x-apple-diskimage, application/x-deflate"
        };
    }

    if ((buf[0] === 0x0 && buf[1] === 0x0 && buf[2] === 0x0 && (buf[3] === 0x18 || buf[3] === 0x20) && buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) || (buf[0] === 0x33 && buf[1] === 0x67 && buf[2] === 0x70 && buf[3] === 0x35) || (buf[0] === 0x0 && buf[1] === 0x0 && buf[2] === 0x0 && buf[3] === 0x1C && buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70 && buf[8] === 0x6D && buf[9] === 0x70 && buf[10] === 0x34 && buf[11] === 0x32 && buf[16] === 0x6D && buf[17] === 0x70 && buf[18] === 0x34 && buf[19] === 0x31 && buf[20] === 0x6D && buf[21] === 0x70 && buf[22] === 0x34 && buf[23] === 0x32 && buf[24] === 0x69 && buf[25] === 0x73 && buf[26] === 0x6F && buf[27] === 0x6D)) {
        return {
            ext: "mp4",
            mime: "video/mp4"
        };
    }

    if ((buf[0] === 0x0 && buf[1] === 0x0 && buf[2] === 0x0 && buf[3] === 0x1C && buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70 && buf[8] === 0x4D && buf[9] === 0x34 && buf[10] === 0x56)) {
        return {
            ext: "m4v",
            mime: "video/x-m4v"
        };
    }

    if (buf[0] === 0x4D && buf[1] === 0x54 && buf[2] === 0x68 && buf[3] === 0x64) {
        return {
            ext: "mid",
            mime: "audio/midi"
        };
    }

    // needs to be before the `webm` check
    if (buf[31] === 0x6D && buf[32] === 0x61 && buf[33] === 0x74 && buf[34] === 0x72 && buf[35] === 0x6f && buf[36] === 0x73 && buf[37] === 0x6B && buf[38] === 0x61) {
        return {
            ext: "mkv",
            mime: "video/x-matroska"
        };
    }

    if (buf[0] === 0x0 && buf[1] === 0x0 && buf[2] === 0x0 && buf[3] === 0x14 && buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) {
        return {
            ext: "mov",
            mime: "video/quicktime"
        };
    }

    if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && buf[8] === 0x41 && buf[9] === 0x56 && buf[10] === 0x49) {
        return {
            ext: "avi",
            mime: "video/x-msvideo"
        };
    }

    if (buf[0] === 0x30 && buf[1] === 0x26 && buf[2] === 0xB2 && buf[3] === 0x75 && buf[4] === 0x8E && buf[5] === 0x66 && buf[6] === 0xCF && buf[7] === 0x11 && buf[8] === 0xA6 && buf[9] === 0xD9) {
        return {
            ext: "wmv",
            mime: "video/x-ms-wmv"
        };
    }

    if (buf[0] === 0x0 && buf[1] === 0x0 && buf[2] === 0x1 && buf[3].toString(16)[0] === "b") {
        return {
            ext: "mpg",
            mime: "video/mpeg"
        };
    }

    if ((buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) || (buf[0] === 0xFF && buf[1] === 0xfb)) {
        return {
            ext: "mp3",
            mime: "audio/mpeg"
        };
    }

    if ((buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70 && buf[8] === 0x4D && buf[9] === 0x34 && buf[10] === 0x41) || (buf[0] === 0x4D && buf[1] === 0x34 && buf[2] === 0x41 && buf[3] === 0x20)) {
        return {
            ext: "m4a",
            mime: "audio/m4a"
        };
    }

    if (buf[0] === 0x66 && buf[1] === 0x4C && buf[2] === 0x61 && buf[3] === 0x43) {
        return {
            ext: "flac",
            mime: "audio/x-flac"
        };
    }

    if (buf[0] === 0x23 && buf[1] === 0x21 && buf[2] === 0x41 && buf[3] === 0x4D && buf[4] === 0x52 && buf[5] === 0x0A) {
        return {
            ext: "amr",
            mime: "audio/amr"
        };
    }

    if ((buf[0] === 0x43 || buf[0] === 0x46) && buf[1] === 0x57 && buf[2] === 0x53) {
        return {
            ext: "swf",
            mime: "application/x-shockwave-flash"
        };
    }

    if (buf[0] === 0x7B && buf[1] === 0x5C && buf[2] === 0x72 && buf[3] === 0x74 && buf[4] === 0x66) {
        return {
            ext: "rtf",
            mime: "application/rtf"
        };
    }

    if (buf[0] === 0x77 && buf[1] === 0x4F && buf[2] === 0x46 && buf[3] === 0x46 && buf[4] === 0x00 && buf[5] === 0x01 && buf[6] === 0x00 && buf[7] === 0x00) {
        return {
            ext: "woff",
            mime: "application/font-woff"
        };
    }

    if (buf[0] === 0x77 && buf[1] === 0x4F && buf[2] === 0x46 && buf[3] === 0x32 && buf[4] === 0x00 && buf[5] === 0x01 && buf[6] === 0x00 && buf[7] === 0x00) {
        return {
            ext: "woff2",
            mime: "application/font-woff"
        };
    }

    if (buf[34] === 0x4C && buf[35] === 0x50 && ((buf[8] === 0x02 && buf[9] === 0x00 && buf[10] === 0x01) || (buf[8] === 0x01 && buf[9] === 0x00 && buf[10] === 0x00) || (buf[8] === 0x02 && buf[9] === 0x00 && buf[10] === 0x02))) {
        return {
            ext: "eot",
            mime: "application/octet-stream"
        };
    }

    if (buf[0] === 0x00 && buf[1] === 0x01 && buf[2] === 0x00 && buf[3] === 0x00 && buf[4] === 0x00) {
        return {
            ext: "ttf",
            mime: "application/font-sfnt"
        };
    }

    if (buf[0] === 0x4F && buf[1] === 0x54 && buf[2] === 0x54 && buf[3] === 0x4F && buf[4] === 0x00) {
        return {
            ext: "otf",
            mime: "application/font-sfnt"
        };
    }

    if (buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01 && buf[3] === 0x00) {
        return {
            ext: "ico",
            mime: "image/x-icon"
        };
    }

    if (buf[0] === 0x46 && buf[1] === 0x4C && buf[2] === 0x56 && buf[3] === 0x01) {
        return {
            ext: "flv",
            mime: "video/x-flv"
        };
    }

    if (buf[0] === 0x25 && buf[1] === 0x21) {
        return {
            ext: "ps",
            mime: "application/postscript"
        };
    }

    if (buf[0] === 0xFD && buf[1] === 0x37 && buf[2] === 0x7A && buf[3] === 0x58 && buf[4] === 0x5A && buf[5] === 0x00) {
        return {
            ext: "xz",
            mime: "application/x-xz"
        };
    }

    if (buf[0] === 0x53 && buf[1] === 0x51 && buf[2] === 0x4C && buf[3] === 0x69) {
        return {
            ext: "sqlite",
            mime: "application/x-sqlite3"
        };
    }
    */

    /**
     *
     * Added by n1474335 [n1474335@gmail.com] from here on
     *
     */
    /*
    if ((buf[0] === 0x1F && buf[1] === 0x9D) || (buf[0] === 0x1F && buf[1] === 0xA0)) {
        return {
            ext: "z, tar.z",
            mime: "application/x-gtar"
        };
    }

    if (buf[0] === 0x7F && buf[1] === 0x45 && buf[2] === 0x4C && buf[3] === 0x46) {
        return {
            ext: "none, axf, bin, elf, o, prx, puff, so",
            mime: "application/x-executable",
            desc: "Executable and Linkable Format file. No standard file extension."
        };
    }

    if (buf[0] === 0xCA && buf[1] === 0xFE && buf[2] === 0xBA && buf[3] === 0xBE) {
        return {
            ext: "class",
            mime: "application/java-vm"
        };
    }

    if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
        return {
            ext: "txt",
            mime: "text/plain",
            desc: "UTF-8 encoded Unicode byte order mark detected, commonly but not exclusively seen in text files."
        };
    }

    // Must be before Little-endian UTF-16 BOM
    if (buf[0] === 0xFF && buf[1] === 0xFE && buf[2] === 0x00 && buf[3] === 0x00) {
        return {
            ext: "UTF32LE",
            mime: "charset/utf32le",
            desc: "Little-endian UTF-32 encoded Unicode byte order mark detected."
        };
    }

    if (buf[0] === 0xFF && buf[1] === 0xFE) {
        return {
            ext: "UTF16LE",
            mime: "charset/utf16le",
            desc: "Little-endian UTF-16 encoded Unicode byte order mark detected."
        };
    }

    if ((buf[0x8001] === 0x43 && buf[0x8002] === 0x44 && buf[0x8003] === 0x30 && buf[0x8004] === 0x30 && buf[0x8005] === 0x31) ||
        (buf[0x8801] === 0x43 && buf[0x8802] === 0x44 && buf[0x8803] === 0x30 && buf[0x8804] === 0x30 && buf[0x8805] === 0x31) ||
        (buf[0x9001] === 0x43 && buf[0x9002] === 0x44 && buf[0x9003] === 0x30 && buf[0x9004] === 0x30 && buf[0x9005] === 0x31)) {
        return {
            ext: "iso",
            mime: "application/octet-stream",
            desc: "ISO 9660 CD/DVD image file"
        };
    }

    if (buf[0] === 0xD0 && buf[1] === 0xCF && buf[2] === 0x11 && buf[3] === 0xE0 && buf[4] === 0xA1 && buf[5] === 0xB1 && buf[6] === 0x1A && buf[7] === 0xE1) {
        return {
            ext: "doc, xls, ppt",
            mime: "application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint",
            desc: "Microsoft Office documents"
        };
    }

    if (buf[0] === 0x64 && buf[1] === 0x65 && buf[2] === 0x78 && buf[3] === 0x0A && buf[4] === 0x30 && buf[5] === 0x33 && buf[6] === 0x35 && buf[7] === 0x00) {
        return {
            ext: "dex",
            mime: "application/octet-stream",
            desc: "Dalvik Executable (Android)"
        };
    }

    if (buf[0] === 0x4B && buf[1] === 0x44 && buf[2] === 0x4D) {
        return {
            ext: "vmdk",
            mime: "application/vmdk, application/x-virtualbox-vmdk"
        };
    }

    if (buf[0] === 0x43 && buf[1] === 0x72 && buf[2] === 0x32 && buf[3] === 0x34) {
        return {
            ext: "crx",
            mime: "application/crx",
            desc: "Google Chrome extension or packaged app"
        };
    }

    if (buf[0] === 0x78 && (buf[1] === 0x01 || buf[1] === 0x9C || buf[1] === 0xDA || buf[1] === 0x5e)) {
        return {
            ext: "zlib",
            mime: "application/x-deflate"
        };
    }

    return null;
    */
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
        return new File([fileData], `extracted_at_0x${offset.toString(16)}.${fileDetail.extension}`);
    }

    throw new Error(`No extraction algorithm available for "${fileDetail.mime}" files`);
}


/**
 * JPEG extractor.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {Uint8Array}
 */
export function extractJPEG(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    while (stream.hasMore()) {
        const marker = stream.getBytes(2);
        if (marker[0] !== 0xff) throw new Error("Invalid JPEG marker: " + marker);

        let segmentSize = 0;
        switch (marker[1]) {
            // No length
            case 0xd8: // Start of Image
            case 0x01: // For temporary use in arithmetic coding
                break;
            case 0xd9: // End found
                return stream.carve();

            // Variable size segment
            case 0xc0: // Start of frame (Baseline DCT)
            case 0xc1: // Start of frame (Extended sequential DCT)
            case 0xc2: // Start of frame (Progressive DCT)
            case 0xc3: // Start of frame (Lossless sequential)
            case 0xc4: // Define Huffman Table
            case 0xc5: // Start of frame (Differential sequential DCT)
            case 0xc6: // Start of frame (Differential progressive DCT)
            case 0xc7: // Start of frame (Differential lossless)
            case 0xc8: // Reserved for JPEG extensions
            case 0xc9: // Start of frame (Extended sequential DCT)
            case 0xca: // Start of frame (Progressive DCT)
            case 0xcb: // Start of frame (Lossless sequential)
            case 0xcc: // Define arithmetic conditioning table
            case 0xcd: // Start of frame (Differential sequential DCT)
            case 0xce: // Start of frame (Differential progressive DCT)
            case 0xcf: // Start of frame (Differential lossless)
            case 0xdb: // Define Quantization Table
            case 0xde: // Define hierarchical progression
            case 0xe0: // Application-specific
            case 0xe1: // Application-specific
            case 0xe2: // Application-specific
            case 0xe3: // Application-specific
            case 0xe4: // Application-specific
            case 0xe5: // Application-specific
            case 0xe6: // Application-specific
            case 0xe7: // Application-specific
            case 0xe8: // Application-specific
            case 0xe9: // Application-specific
            case 0xea: // Application-specific
            case 0xeb: // Application-specific
            case 0xec: // Application-specific
            case 0xed: // Application-specific
            case 0xee: // Application-specific
            case 0xef: // Application-specific
            case 0xfe: // Comment
                segmentSize = stream.readInt(2, "be");
                stream.position += segmentSize - 2;
                break;

            // 1 byte
            case 0xdf: // Expand reference image
                stream.position++;
                break;

            // 2 bytes
            case 0xdc: // Define number of lines
            case 0xdd: // Define restart interval
                stream.position += 2;
                break;

            // Start scan
            case 0xda: // Start of scan
                segmentSize = stream.readInt(2, "be");
                stream.position += segmentSize - 2;
                stream.continueUntil(0xff);
                break;

            // Continue through encoded data
            case 0x00: // Byte stuffing
            case 0xd0: // Restart
            case 0xd1: // Restart
            case 0xd2: // Restart
            case 0xd3: // Restart
            case 0xd4: // Restart
            case 0xd5: // Restart
            case 0xd6: // Restart
            case 0xd7: // Restart
                stream.continueUntil(0xff);
                break;

            default:
                stream.continueUntil(0xff);
                break;
        }
    }

    throw new Error("Unable to parse JPEG successfully");
}


/**
 * Portable executable extractor.
 * Assumes that the offset refers to an MZ header.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {Uint8Array}
 */
export function extractMZPE(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    // Move to PE header pointer
    stream.moveTo(0x3c);
    const peAddress = stream.readInt(4, "le");

    // Move to PE header
    stream.moveTo(peAddress);

    // Get number of sections
    stream.moveForwardsBy(6);
    const numSections = stream.readInt(2, "le");

    // Get optional header size
    stream.moveForwardsBy(12);
    const optionalHeaderSize = stream.readInt(2, "le");

    // Move past optional header to section header
    stream.moveForwardsBy(2 + optionalHeaderSize);

    // Move to final section header
    stream.moveForwardsBy((numSections - 1) * 0x28);

    // Get raw data info
    stream.moveForwardsBy(16);
    const rawDataSize = stream.readInt(4, "le");
    const rawDataAddress = stream.readInt(4, "le");

    // Move to end of final section
    stream.moveTo(rawDataAddress + rawDataSize);

    return stream.carve();
}


/**
 * PDF extractor.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {Uint8Array}
 */
export function extractPDF(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    // Find end-of-file marker (%%EOF)
    stream.continueUntil([0x25, 0x25, 0x45, 0x4f, 0x46]);
    stream.moveForwardsBy(5);
    stream.consumeIf(0x0d);
    stream.consumeIf(0x0a);

    return stream.carve();
}


/**
 * ZIP extractor.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {Uint8Array}
 */
export function extractZIP(bytes, offset) {
    const stream = new Stream(bytes.slice(offset));

    // Find End of central directory record
    stream.continueUntil([0x50, 0x4b, 0x05, 0x06]);

    // Get comment length and consume
    stream.moveForwardsBy(20);
    const commentLength = stream.readInt(2, "le");
    stream.moveForwardsBy(commentLength);

    return stream.carve();
}
