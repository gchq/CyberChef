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
                            "<br><br>", "Decodes Mime encoded words that are found in IMF messages.",
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
