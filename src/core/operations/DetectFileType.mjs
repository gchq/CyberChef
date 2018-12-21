/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import {detectFileType} from "../lib/FileType";

/**
 * Detect File Type operation
 */
class DetectFileType extends Operation {

    /**
     * DetectFileType constructor
     */
    constructor() {
        super();

        this.name = "Detect File Type";
        this.module = "Default";
        this.description = "Attempts to guess the MIME (Multipurpose Internet Mail Extensions) type of the data based on 'magic bytes'.<br><br>Currently supports the following file types: 7z, amr, avi, bmp, bz2, class, cr2, crx, dex, dmg, doc, elf, eot, epub, exe, flac, flv, gif, gz, ico, iso, jpg, jxr, m4a, m4v, mid, mkv, mov, mp3, mp4, mpg, ogg, otf, pdf, png, ppt, ps, psd, rar, rtf, sqlite, swf, tar, tar.z, tif, ttf, utf8, vmdk, wav, webm, webp, wmv, woff, woff2, xls, xz, zip.";
        this.infoURL = "https://wikipedia.org/wiki/List_of_file_signatures";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const data = new Uint8Array(input),
            types = detectFileType(data);

        if (!types.length) {
            return "Unknown file type. Have you tried checking the entropy of this data to determine whether it might be encrypted or compressed?";
        } else {
            let output = "";

            types.forEach(type => {
                output += "File extension: " + type.extension + "\n" +
                    "MIME type:      " + type.mime + "\n";

                if (type.description && type.description.length) {
                    output += "\nDescription:    " + type.description + "\n";
                }
            });

            return output;
        }
    }

}

export default DetectFileType;
