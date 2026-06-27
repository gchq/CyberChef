/**
 * @author voo7ieX9
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {encode} from "../lib/Base65536.mjs";

/**
 * To Base65536 operation
 */
class ToBase65536 extends Operation {

    /**
     * ToBase65536 constructor
     */
    constructor() {
        super();

        this.name = "To Base65536";
        this.module = "Default";
        this.description = "Base65536 is a binary encoding that uses Unicode code points to represent data. This operation encodes data into a Unicode string.<br><br>e.g. <code>hello world</code> becomes <code>驨ꍬ啯𒁷ꍲᕤ</code>";
        this.infoURL = "https://github.com/qntm/base65536";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const data = new Uint8Array(input);
        return encode(data);
    }

}

export default ToBase65536;
