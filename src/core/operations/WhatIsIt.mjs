/**
 * @author depperm [epper.marshall@gmail.com]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import what from "jswhat";

/**
 * WhatIsIt operation
 */
class WhatIsIt extends Operation {

    /**
     * WhatIsIt constructor
     */
    constructor() {
        super();

        this.name = "What Is It";
        this.module = "Default";
        this.description = "Implements JsWhat, a PyWhat port, to guess what a string is.";
        this.infoURL = "https://github.com/apteryxxyz/jswhat";
        this.inputType = "string";
        this.outputType = "JSON";
        this.presentType = "html";
        this.args = [
            {
                name: "Search",
                type: "boolean",
                value: false
            },
            {
                name: "Filter",
                type: "string",
                value: ""
            },
            {
                name: "Exclude",
                type: "string",
                value: ""
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    run(input, args) {
        const [search, filter, exclude] = args;
        const fOptions = { search };
        if (filter.length) {
            fOptions.filter = filter.split(/,\s?/);
        }
        if (exclude.length) {
            fOptions.exclude = exclude.split(/,\s?/);
        }

        return what.is(input, fOptions);
    }
    /**
     * Displays WhatIsIt results in HTML for web apps.
     *
     * @param {JSON} options
     * @returns {html}
     */
    present(options) {
        let output = `<table
                class='table table-hover table-sm table-bordered'
                style='table-layout: fixed;'>
            <tr>
                <th>Identified as</th>
                <th>Matched Text</th>
                <th>Description</th>
            </tr>`;

        options.forEach(option => {
            output += `<tr>
                <td>${option.name}</td>
                <td>${option.matched}</td>
                <td>${option.description}(${option.tags.join(", ")})</td>
            </tr>`;
        });

        output += "</table><script type='application/javascript'>$('[data-toggle=\"tooltip\"]').tooltip()</script>";

        if (!options.length) {
            output = "Nothing of interest could be detected about the input data.\nHave you tried modifying the operation arguments?";
        }

        return output;
    }

}

export default WhatIsIt;
