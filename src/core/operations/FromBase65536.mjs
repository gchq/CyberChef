/**
 * @author voo7ieX9
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {decode} from "../lib/Base65536.mjs";

/**
 * From Base65536 operation
 */
class FromBase65536 extends Operation {

    /**
     * FromBase65536 constructor
     */
    constructor() {
        super();

        this.name = "From Base65536";
        this.module = "Default";
        this.description = "Base65536 is a binary encoding that uses Unicode code points to represent data. This operation decodes a Base65536 string back into its original form.<br><br>e.g. <code>驨ꍬ啯𒁷ꍲᕤ</code> becomes <code>hello world</code>";
        this.infoURL = "https://github.com/qntm/base65536";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const result = decode(input);
        return Array.from(result);
    }

}

export default FromBase65536;
