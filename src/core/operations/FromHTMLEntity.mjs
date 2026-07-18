/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import { HTML_ENTITY_REVERSE_LOOKUP } from "../lib/HTMLEntities.mjs";

/**
 * From HTML Entity operation
 */
class FromHTMLEntity extends Operation {

    /**
     * FromHTMLEntity constructor
     */
    constructor() {
        super();

        this.name = "From HTML Entity";
        this.module = "Encodings";
        this.description = "Converts HTML entities back to characters<br><br>e.g. <code>&amp;<span>amp;</span></code> becomes <code>&amp;</code>";
        this.infoURL = "https://wikipedia.org/wiki/List_of_XML_and_HTML_character_entity_references";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
        this.checks = [
            {
                pattern: "&(?:#\\d{2,3}|#x[\\da-f]{2}|[a-z]{2,6});",
                flags: "i",
                args: []
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const regex = /&(#?x?[a-zA-Z0-9]{1,20});/g;
        let output = "",
            m,
            i = 0;

        while ((m = regex.exec(input))) {
            // Add up to match
            for (; i < m.index;)
                output += input[i++];

            // Add match
            const bite = HTML_ENTITY_REVERSE_LOOKUP[m[1]];
            if (bite) {
                output += Utils.chr(bite);
            } else if (!bite && m[1][0] === "#" && m[1].length > 1 && /^#\d{1,6}$/.test(m[1])) {
                // Numeric entity (e.g. &#10;)
                const num = m[1].slice(1, m[1].length);
                output += Utils.chr(parseInt(num, 10));
            } else if (!bite && m[1][0] === "#" && m[1].length > 3 && /^#x[\dA-F]{2,8}$/i.test(m[1])) {
                // Hex entity (e.g. &#x3A;)
                const hex = m[1].slice(2, m[1].length);
                output += Utils.chr(parseInt(hex, 16));
            } else {
                // Not a valid entity, print as normal
                for (; i < regex.lastIndex;)
                    output += input[i++];
            }

            i = regex.lastIndex;
        }
        // Add all after final match
        for (; i < input.length;)
            output += input[i++];

        return output;
    }

}

export default FromHTMLEntity;
