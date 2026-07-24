/**
 * @author Roma476 [friciu.robert09@gmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

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
        this.module = "Default";
        this.description = "Decodes JavaScript that has been obfuscated using only 6 characters: <code>[</code>, <code>]</code>, <code>(</code>, <code>)</code>, <code>!</code> and <code>+</code>. This technique exploits JavaScript's type coercion rules to construct executable code from a minimal character set.<br><br>e.g.  <code>[][(![]+[])[+[]]+...]</code> becomes <code>alert(1)</code>";
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
        // Input Validation
        for (let i = 0; i < input.length; i++) {
            const char = input[i];
            if (!["[", "]", "(", ")", "!", "+"].includes(char)) {
                throw new OperationError(`Invalid character at position ${i}: ${char}`);
            }
        }

        try {
            return String(Function("\"use strict\"; return (" + input + ")")());
        } catch (err) {
            throw new OperationError("Unable to decode: " + err.message);
        }
    }

}

export default FromJS6Chars;
