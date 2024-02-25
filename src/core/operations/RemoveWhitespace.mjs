/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Remove whitespace operation
 */
class RemoveWhitespace extends Operation {
    /**
     * RemoveWhitespace constructor
     */
    constructor() {
        super();

        this.name = "Remove whitespace";
        this.module = "Default";
        this.description
            = "Optionally removes all spaces, carriage returns, line feeds, tabs and form feeds from the input data.<br><br>This operation also supports the removal of full stops which are sometimes used to represent non-printable bytes in ASCII output.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Spaces",
                "type": "boolean",
                "value": true
            },
            {
                "name": "Carriage returns (\\r)",
                "type": "boolean",
                "value": true
            },
            {
                "name": "Line feeds (\\n)",
                "type": "boolean",
                "value": true
            },
            {
                "name": "Tabs",
                "type": "boolean",
                "value": true
            },
            {
                "name": "Form feeds (\\f)",
                "type": "boolean",
                "value": true
            },
            {
                "name": "Full stops",
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
        const [removeSpaces, removeCarriageReturns, removeLineFeeds, removeTabs, removeFormFeeds, removeFullStops]
            = args;
        let data = input;

        if (removeSpaces) data = data.replace(/ /g, "");
        if (removeCarriageReturns) data = data.replace(/\r/g, "");
        if (removeLineFeeds) data = data.replace(/\n/g, "");
        if (removeTabs) data = data.replace(/\t/g, "");
        if (removeFormFeeds) data = data.replace(/\f/g, "");
        if (removeFullStops) data = data.replace(/\./g, "");
        return data;
    }
}

export default RemoveWhitespace;
