/**
 * @author Roma476 [friciu.robert09@gmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { decodeJS6Chars } from "../lib/JS6Chars.mjs";

/**
 * From JS6Chars operation
 */
class FromJS6Chars extends Operation {

    /**
     * FromJS6Chars constructor
     */
    constructor() {
        super();

        this.name = "From JS6Chars";
        this.module = "Code";
        this.description = "Decodes JavaScript that has been obfuscated using only 6 characters: <code>[</code>, <code>]</code>, <code>(</code>, <code>)</code>, <code>!</code> and <code>+</code>. This technique exploits JavaScript's type coercion rules to construct code from a minimal character set.<br><br>The expression is interpreted statically and no code from the input is ever executed. Function bodies that cannot be reduced to a constant are returned as source code instead of being run.<br><br>e.g.  <code>[][(![]+[])[+[]]+...]</code> becomes <code>alert(1)</code>";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        return decodeJS6Chars(input);
    }

}

export default FromJS6Chars;
