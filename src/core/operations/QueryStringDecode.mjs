/**
 * @author Benjamin Altpeter [hi@bn.al]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import qs from "qs";
import Operation from "../Operation.mjs";

/**
 * Query String Decode operation
 */
class QueryStringDecode extends Operation {
    /**
     * QueryStringDecode constructor
     */
    constructor() {
        super();

        this.name = "Query String Decode";
        this.module = "URL";
        this.description =
            "Converts URL query strings into a JSON representation.<br><br>e.g. <code>a=b&c=1</code> becomes <code>{&quot;a&quot;: &quot;b&quot;, &quot;c&quot;: &quot;1&quot;}</code>";
        this.infoURL = "https://wikipedia.org/wiki/Query_string";
        this.inputType = "string";
        this.outputType = "JSON";
        this.args = [
            {
                name: "Depth",
                type: "number",
                value: 5,
            },
            {
                name: "Parameter limit",
                type: "number",
                value: 1000,
            },
            {
                name: "Delimiter",
                type: "string",
                value: "&",
            },
            {
                name: "Allow dot notation (<code>a.b=c</code>)?",
                type: "boolean",
                value: false,
            },
            {
                name: "Allow comma arrays (<code>a=b,c</code>)?",
                type: "boolean",
                value: false,
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    run(input, args) {
        const [depth, parameterLimit, delimiter, allowDots, comma] = args;
        return qs.parse(input, {
            depth,
            delimiter,
            parameterLimit,
            allowDots,
            comma,
            ignoreQueryPrefix: true,
        });
    }
}

export default QueryStringDecode;
