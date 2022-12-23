/**
 * @author Benjamin Altpeter [hi@bn.al]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import qs from "qs";
import Operation from "../Operation.mjs";

/**
 * Query String Encode operation
 */
class QueryStringEncode extends Operation {
    /**
     * QueryStringEncode constructor
     */
    constructor() {
        super();

        this.name = "Query String Encode";
        this.module = "URL";
        this.description =
            "Converts JSON objects into a URL query string representation.<br><br>e.g. <code>{&quot;a&quot;: &quot;b&quot;, &quot;c&quot;: 1}</code> becomes <code>a=b&c=1</code>";
        this.infoURL = "https://wikipedia.org/wiki/Query_string";
        this.inputType = "JSON";
        this.outputType = "string";
        this.args = [
            {
                name: "Array format",
                type: "option",
                value: ["brackets", "indices", "repeat", "comma"],
                defaultIndex: 0,
            },
            {
                name: "Object format",
                type: "option",
                value: ["brackets", "dots"],
                defaultIndex: 0,
            },
            {
                name: "Delimiter",
                type: "string",
                value: "&",
            },
        ];
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [arrayFormat, objectFormat, delimiter] = args;
        return qs.stringify(input, {
            arrayFormat,
            delimiter,
            allowDots: objectFormat === "dots",
            encode: false,
        });
    }
}

export default QueryStringEncode;
