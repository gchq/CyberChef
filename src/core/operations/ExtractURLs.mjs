/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import { search } from "../lib/Extract";

/**
 * Extract URLs operation
 */
class ExtractURLs extends Operation {

    /**
     * ExtractURLs constructor
     */
    constructor() {
        super();

        this.name = "Extract URLs";
        this.module = "Regex";
        this.description = "Extracts Uniform Resource Locators (URLs) from the input. The protocol (http, ftp etc.) is required otherwise there will be far too many false positives.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Display total",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const displayTotal = args[0],
            protocol = "[A-Z]+://",
            hostname = "[-\\w]+(?:\\.\\w[-\\w]*)+",
            port = ":\\d+";
        let path = "/[^.!,?\"<>\\[\\]{}\\s\\x7F-\\xFF]*";

        path += "(?:[.!,?]+[^.!,?\"<>\\[\\]{}\\s\\x7F-\\xFF]+)*";
        const regex = new RegExp(protocol + hostname + "(?:" + port +
            ")?(?:" + path + ")?", "ig");
        return search(input, regex, null, displayTotal);
    }

}

export default ExtractURLs;
