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
class ParseIMF extends Operation {

    /**
     * Internet Message Format constructor
     */
    constructor() {
        super();
        this.name = "Parse Internet Message Format";
        this.module = "Default";
        this.description = ["Parse an IMF formatted messages following RFC5322.",
                            "<br><br>",
                            "Parses an IMF formated message. These often have the file extention &quot;.eml&quote; and contain the email headers and body. The output will be a file list of the root header and decoded mime parts.",
        ].join("\n");
        this.infoURL = "https://tools.ietf.org/html/rfc5322";
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
     *
     *
     *
     *
     *
     */
    run(input, args) {
        //let mimeObj = new Mime(input);
        return new Mime(input).decodeMime(args[0]);
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

export default ParseIMF;
