/**
 * @author Didier Stevens [didier.stevens@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import {BITWISE_OP_DELIMS} from "../lib/BitwiseOp.mjs";
import Utils from "../Utils.mjs";

/**
 * Insert bytes operation
 */
class InsertBytes extends Operation {

    /**
     * InsertBytes constructor
     */
    constructor() {
        super();

        this.name = "Insert bytes";
        this.module = "Default";
        this.description = "Insert bytes at arbitrary position. Options 'from end' and 'overwrite' available.";
        this.infoURL = "";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.args = [
            {
                "name": "Bytes",
                "type": "toggleString",
                "value": "",
                "toggleValues": BITWISE_OP_DELIMS
            },
            {
                "name": "Start",
                "type": "number",
                "value": 0
            },
            {
                "name": "From end",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Overwrite",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const value = Utils.convertToByteArray(args[0].string || "", args[0].option);
        let start = args[1];
        const fromend = args[2];
        const overwrite = args[3];

        if (start < 0)
            throw new OperationError("Start must not be negative");
        if (start > input.length)
            throw new OperationError("Start must not be bigger than input");
        if (fromend)
            start = input.length - start;
        const left = input.slice(0, start);
        let right = input.slice(start);
        if (overwrite)
            right = right.slice(value.length);

        return left.concat(value, right);
    }

}

export default InsertBytes;
