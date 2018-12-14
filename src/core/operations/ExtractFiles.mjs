/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
// import OperationError from "../errors/OperationError";
import Magic from "../lib/Magic";
import Utils from "../Utils";
import {extractFile} from "../lib/FileExtraction";

/**
 * Extract Files operation
 */
class ExtractFiles extends Operation {

    /**
     * ExtractFiles constructor
     */
    constructor() {
        super();

        this.name = "Extract Files";
        this.module = "Default";
        this.description = "TODO";
        this.infoURL = "https://forensicswiki.org/wiki/File_Carving";
        this.inputType = "ArrayBuffer";
        this.outputType = "List<File>";
        this.presentType = "html";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {List<File>}
     */
    run(input, args) {
        const bytes = new Uint8Array(input);

        // Scan for embedded files
        const fileDetails = scanForEmbeddedFiles(bytes);

        // Extract each file that we support
        const files = [];
        fileDetails.forEach(fileDetail => {
            try {
                files.push(extractFile(bytes, fileDetail));
            } catch (err) {}
        });

        return files;
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

}

/**
 * TODO refactor
 * @param data
 */
function scanForEmbeddedFiles(data) {
    let type;
    const types = [];

    for (let i = 0; i < data.length; i++) {
        type = Magic.magicFileType(data.slice(i));
        if (type) {
            types.push({
                offset: i,
                ext: type.ext,
                mime: type.mime,
                desc: type.desc
            });
        }
    }

    return types;
}

export default ExtractFiles;
