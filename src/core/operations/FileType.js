import Utils from "../Utils.js";


/**
 * File type operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const FileType = {

    /**
     * Detect File Type operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runDetect: function(input, args) {
        var type = FileType._magicType(input);

        if (!type) {
            return "Unknown file type. Have you tried checking the entropy of this data to determine whether it might be encrypted or compressed?";
        } else {
            var output = "File extension: " + type.ext + "\n" +
                "MIME type:      " + type.mime;

            if (type.desc && type.desc.length) {
                output += "\nDescription:    " + type.desc;
            }

            return output;
        }
    },


    /**
     * @constant
     * @default
     */
    IGNORE_COMMON_BYTE_SEQUENCES: true,

    /**
     * Scan for Embedded Files operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runScanForEmbeddedFiles: function(input, args) {
        var output = "Scanning data for 'magic bytes' which may indicate embedded files. The following results may be false positives and should not be treat as reliable. Any suffiently long file is likely to contain these magic bytes coincidentally.\n",
            type,
            ignoreCommon = args[0],
            commonExts = ["ico", "ttf", ""],
            numFound = 0,
            numCommonFound = 0;

        for (var i = 0; i < input.length; i++) {
            type = FileType._magicType(input.slice(i));
            if (type) {
                if (ignoreCommon && commonExts.indexOf(type.ext) > -1) {
                    numCommonFound++;
                    continue;
                }
                numFound++;
                output += "\nOffset " + i + " (0x" + Utils.hex(i) + "):\n" +
                    "  File extension: " + type.ext + "\n" +
                    "  MIME type:      " + type.mime + "\n";

                if (type.desc && type.desc.length) {
                    output += "  Description:    " + type.desc + "\n";
                }
            }
        }

        if (numFound === 0) {
            output += "\nNo embedded files were found.";
        }

        if (numCommonFound > 0) {
            output += "\n\n" + numCommonFound;
            output += numCommonFound === 1 ?
                " file type was detected that has a common byte sequence. This is likely to be a false positive." :
                " file types were detected that have common byte sequences. These are likely to be false positives.";
            output += " Run this operation with the 'Ignore common byte sequences' option unchecked to see details.";
        }

        return output;
    },


    /**
     * Given a buffer, detects magic byte sequences at specific positions and returns the
     * extension and mime type.
     *
     * @private
     * @param {byteArray} buf
     * @returns {Object} type
     * @returns {string} type.ext - File extension
     * @returns {string} type.mime - Mime type
     * @returns {string} [type.desc] - Description
     */
    _magicType: function (buf) {
        if (!(buf && buf.length > 1)) {
            return null;
        }

        if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) {
            return {
                ext: "jpg",
                mime: "image/jpeg"
            };
        }

        if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
            return {
                ext: "png",
                mime: "image/png"
            };
        }

        if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
            return {
                ext: "gif",
                mime: "image/gif"
            };
        }

        if (buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) {
            return {
                ext: "webp",
                mime: "image/webp"
            };
        }

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

        if (buf[0] === 0x50 && buf[1] === 0x4B && (buf[2] === 0x3 || buf[2] === 0x5 || buf[2] === 0x7) && (buf[3] === 0x4 || buf[3] === 0x6 || buf[3] === 0x8)) {
            return {
                ext: "zip",
                mime: "application/zip"
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
                ext: "dmg",
                mime: "application/x-apple-diskimage"
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

        if (buf[0] === 0x1A && buf[1] === 0x45 && buf[2] === 0xDF && buf[3] === 0xA3) {
            return {
                ext: "webm",
                mime: "video/webm"
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

        if (buf[0] === 0x4F && buf[1] === 0x67 && buf[2] === 0x67 && buf[3] === 0x53) {
            return {
                ext: "ogg",
                mime: "audio/ogg"
            };
        }

        if (buf[0] === 0x66 && buf[1] === 0x4C && buf[2] === 0x61 && buf[3] === 0x43) {
            return {
                ext: "flac",
                mime: "audio/x-flac"
            };
        }

        if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && buf[8] === 0x57 && buf[9] === 0x41 && buf[10] === 0x56 && buf[11] === 0x45) {
            return {
                ext: "wav",
                mime: "audio/x-wav"
            };
        }

        if (buf[0] === 0x23 && buf[1] === 0x21 && buf[2] === 0x41 && buf[3] === 0x4D && buf[4] === 0x52 && buf[5] === 0x0A) {
            return {
                ext: "amr",
                mime: "audio/amr"
            };
        }

        if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) {
            return {
                ext: "pdf",
                mime: "application/pdf"
            };
        }

        if (buf[0] === 0x4D && buf[1] === 0x5A) {
            return {
                ext: "exe",
                mime: "application/x-msdownload"
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

        // Added by n1474335 [n1474335@gmail.com] from here on
        // ################################################################## //
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
                ext: "",
                mime: "",
                desc: "Little-endian UTF-32 encoded Unicode byte order mark detected."
            };
        }

        if (buf[0] === 0xFF && buf[1] === 0xFE) {
            return {
                ext: "",
                mime: "",
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

        return null;
    },

};

export default FileType;
