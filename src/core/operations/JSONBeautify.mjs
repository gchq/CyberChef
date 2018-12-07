/**
 * @author n1474335 [n1474335@gmail.com]
 * @author Phillip Nordwall [phillip.nordwall@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import vkbeautify from "vkbeautify";
import Operation from "../Operation";

/**
 * JSON Beautify operation
 */
class JSONBeautify extends Operation {

    /**
     * JSONBeautify constructor
     */
    constructor() {
        super();

        this.name = "JSON Beautify";
        this.module = "Code";
        this.description = "Indents and prettifies JavaScript Object Notation (JSON) code.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Indent string",
                "type": "binaryShortString",
                "value": "    "
            },
            {
                "name": "Sort Object Keys",
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
        const [indentStr, sortBool] = args;

        if (!input) return "";
        if (sortBool) {
            input = JSON.stringify(JSONBeautify._sort(JSON.parse(input)));
        }
        return vkbeautify.json(input, indentStr);
    }


    /**
     * Sort JSON representation of an object
     *
     * @author Phillip Nordwall [phillip.nordwall@gmail.com]
     * @private
     * @param {object} o
     * @returns {object}
     */
    static _sort(o) {
        if (Array.isArray(o)) {
            return o.map(JSONBeautify._sort);
        } else if ("[object Object]" === Object.prototype.toString.call(o)) {
            return Object.keys(o).sort().reduce(function(a, k) {
                a[k] = JSONBeautify._sort(o[k]);
                return a;
            }, {});
        }
        return o;
    }
}

export default JSONBeautify;
