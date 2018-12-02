/**
 * @author bwhitn [brian.m.whitney@outlook.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Mime from "../lib/Mime";

/**
 * Operation for Finding and replacing Mime encoded words.
 */
class DecodeMimeEncodedWords extends Operation {

    /**
     * DecodeMimeEncodedWords constructor
     */
    constructor() {
        super();
        this.name = "Decode Mime Encoded Words";
        this.module = "Default";
        this.description = ["Parser an IMF formatted messages following RFC5322.",
                            "<br><br>", "Parses an IMF formated message. These often have the file extention &quot;.eml&quote; and contain the email headers and body. The output will be a file list of the headers and mime parts.",
        ].join("\n");
        this.infoURL = "https://tools.ietf.org/html/rfc2047";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     *
     *
     *
     *
     *
     */
    run(input, args) {
        return Mime.replaceEncodedWord(input);
    }
}

export default DecodeMimeEncodedWords;
