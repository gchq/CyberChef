/**
 * @author gchq77703 []
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import LengthValue from "../lib/LengthValue";

/**
 * From LV Decode operation
 */
class LVDecode extends Operation {

    /**
     * LVDecode constructor
     */
    constructor() {
        super();

        this.name = "LV Decode";
        this.module = "Default";
        this.description = "Converts a Length-Value (LV) encoded string into a JSON object.  Can optionally include a <code>Key</code> / <code>Type</code> entry.";
        this.infoURL = "https://wikipedia.org/wiki/KLV";
        this.inputType = "byteArray";
        this.outputType = "JSON";
        this.args = [
            {
                name: "Bytes in Key Value",
                type: "option",
                value: [
                    "0 Bytes (No Key)",
                    "1 Byte",
                    "2 Bytes",
                    "4 Bytes"
                ]
            },
            {
                name: "Bytes in Length Value",
                type: "option",
                value: [
                    "1 Byte",
                    "2 Bytes",
                    "4 Bytes"
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
        const bytesInKey = parseInt(args[0].split(" ")[0], 10);
        const bytesInLength = parseInt(args[1].split(" ")[0], 10);
        const basicEncodingRules = args[2];

        const lv = new LengthValue(input, { bytesInLength, basicEncodingRules });

        const data = [];

        while (!lv.atEnd()) {
            const key = bytesInKey ? lv.getValue(bytesInKey) : undefined;
            const length = lv.getLength();
            const value = lv.getValue(length);

            data.push({ key, length, value });
        }

        return data;
    }

}

export default LVDecode;
