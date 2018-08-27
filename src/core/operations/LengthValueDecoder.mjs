/**
 * @author gchq77703 []
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import LengthValue from "../lib/LengthValue";

/**
 * From Length Value operation
 */
class FromLengthValue extends Operation {

    /**
     * FromLengthValue constructor
     */
    constructor() {
        super();

        this.name = "From Length Value";
        this.module = "Default";
        this.description = "Converts a Length-Value (LV) encoded string into a line-delimited JSON (LDJSON / Streaming JSON) format";
        this.infoURL = "";
        this.inputType = "byteArray";
        this.outputType = "string";
        this.args = [
            {
                name: "Bytes in Length Value",
                type: "populateOption",
                value: [
                    {
                        name: "1 Byte",
                        value: "1"
                    },
                    {
                        name: "2 Bytes",
                        value: "2"
                    },
                    {
                        name: "4 Bytes",
                        value: "4"
                    }
                ]
            },
            {
                name: "Use Basic Encoding Rules",
                type: "boolean"
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const bytesInLength = parseInt(args[0].split(" ")[0], 10);
        const basicEncodingRules = args[2];

        const lv = new LengthValue(input, { bytesInLength, basicEncodingRules });

        const data = [];

        while (!lv.atEnd()) {
            const dataLength = lv.getLength();
            const value = lv.getValue(dataLength);

            data.push(value);
        }

        return data.map(line => line.map(value => ("00" + value.toString(16)).slice(-2)).join(" ")).join("\n");
    }

}

export default FromLengthValue;
