/**
 * @author bwhitn [brian.m.whitney@outlook.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Mime from "../lib/Mime";
import Utils from "../Utils";

/**
 *
 */
class ParseMime extends Operation {

    /**
     * ParseMime constructor
     */
    constructor() {
        super();
        this.name = "Parse Mime";
        this.module = "Default";
        this.description = ["Generic Mime Message parser that decodes Mime messages into files",
                            "<br><br>",
                            "The output will be the root header and the associated mime parts.",
                            "This includes Internet Message Format which are found in SMTP traffic."
        ].join("\n");
        this.infoURL = "https://tools.ietf.org/html/rfc2045";
        this.inputType = "string";
        this.outputType = "List<File>";
        this.presentType = "html";
        this.args = [
            {
                "name": "Decode Encoded-Words",
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
     * @param {boolean} decodeWords
     * @returns {File[]}
     */
    run(input, args) {
        const eml = new Mime(input);
        if (!eml.mimeObj) {
            return [];
        }
        eml.decodeMimeObjects();
        if (args[0]) {
            eml.decodeHeaderWords(false);
        }
        const fields = [["filename", "content-disposition", "filename"],
                        ["name", "content-type", "name"],
                        ["type", "content-type"],
                        ["subject", "subject"]];
        const dataObj = eml.extractData(fields);
        let subject = null;
        const retval = [];
        if (dataObj.length >= 1) {
            subject = dataObj[0].fields.subject;
            if (dataObj[0].header) {
                retval.push(new File([dataObj[0].header], "Header.txt", {type: "text/plain"}));
            }
        }
        dataObj.forEach(function(obj) {
            if (obj.body) {
                let name = obj.fields.filename ? obj.fields.filename : obj.fields.name;
                const type = obj.fields.type ? obj.fields.type : "text/plain";
                if (!name) {
                    name = (subject ? subject : "Undefined").concat(ParseMime.getFileExt(type));
                }
                if (Array.isArray(obj.body)) {
                    retval.push(new File([Uint8Array.from(obj.body)], name, {type: type}));
                } else {
                    retval.push(new File([obj.body], name, {type: type}));
                }
            }
        });
        return retval;
    }

    /**
     * Simple function to add a common file extention based on mime type string.
     *
     * @param {string} mimetype
     * @returns {string}
     */
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
     * Displays the files in HTML for web apps.
     *
     * @param {File[]} files
     * @returns {html}
     */
    async present(files) {
        return await Utils.displayFilesAsHTML(files);
    }
}

export default ParseMime;
