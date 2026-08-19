/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import { HTML_ENTITY_LOOKUP } from "../lib/HTMLEntities.mjs";

/**
 * To HTML Entity operation
 */
class ToHTMLEntity extends Operation {

    /**
     * ToHTMLEntity constructor
     */
    constructor() {
        super();

        this.name = "To HTML Entity";
        this.module = "Encodings";
        this.description = "Converts characters to HTML entities<br><br>e.g. <code>&amp;</code> becomes <code>&amp;<span>amp;</span></code>";
        this.infoURL = "https://wikipedia.org/wiki/List_of_XML_and_HTML_character_entity_references";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Convert all characters",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Convert to",
                "type": "option",
                "value": ["Named entities", "Numeric entities", "Hex entities"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const convertAll = args[0],
            numeric = args[1] === "Numeric entities",
            hexa = args[1] === "Hex entities";

        const charcodes = Utils.strToCharcode(input);
        let output = "";

        for (let i = 0; i < charcodes.length; i++) {
            const named = charcodes[i] in HTML_ENTITY_LOOKUP ?
                "&" + HTML_ENTITY_LOOKUP[charcodes[i]] + ";" : null;
            if (convertAll && numeric) {
                output += "&#" + charcodes[i] + ";";
            } else if (convertAll && hexa) {
                output += "&#x" + Utils.hex(charcodes[i]) + ";";
            } else if (convertAll) {
                output += named || "&#" + charcodes[i] + ";";
            } else if (numeric) {
                if (charcodes[i] > 255 || named) {
                    output += "&#" + charcodes[i] + ";";
                } else {
                    output += Utils.chr(charcodes[i]);
                }
            } else if (hexa) {
                if (charcodes[i] > 255 || named) {
                    output += "&#x" + Utils.hex(charcodes[i]) + ";";
                } else {
                    output += Utils.chr(charcodes[i]);
                }
            } else {
                output += named || (
                    charcodes[i] > 255 ?
                        "&#" + charcodes[i] + ";" :
                        Utils.chr(charcodes[i])
                );
            }
        }
        return output;
    }

}

export default ToHTMLEntity;
