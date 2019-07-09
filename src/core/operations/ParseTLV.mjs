/**
 * @author gchq77703 []
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import TLVParser from "../lib/TLVParser.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Parse TLV operation
 */
class ParseTLV extends Operation {

    /**
     * ParseTLV constructor
     */
    constructor() {
        super();

        this.name = "Parse TLV";
        this.module = "Default";
        this.description = "Converts a Type-Length-Value (TLV) encoded string into a JSON object.  Can optionally include a <code>Key</code> / <code>Type</code> entry. <br><br>Tags: Key-Length-Value, KLV, Length-Value, LV";
        this.infoURL = "https://wikipedia.org/wiki/Type-length-value";
        this.inputType = "byteArray";
        this.outputType = "JSON";
        this.args = [
            {
                name: "Type/Key size",
                type: "number",
                value: 1
            },
            {
                name: "Length size",
                type: "number",
                value: 1
            },
            {
                name: "Use BER",
                type: "boolean",
                value: false
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [bytesInKey, bytesInLength, basicEncodingRules] = args;

        if (bytesInKey <= 0 && bytesInLength <= 0)
            throw new OperationError("Type or Length size must be greater than 0");

        const tlv = new TLVParser(input, { bytesInLength, basicEncodingRules });

        const data = [];

        while (!tlv.atEnd()) {
            const key = bytesInKey ? tlv.getValue(bytesInKey) : undefined;
            const length = tlv.getLength();
            const value = tlv.getValue(length);

            data.push({ key, length, value });
        }

        return data;
    }

}

export default ParseTLV;
