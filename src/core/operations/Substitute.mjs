/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";

/**
 * Substitute operation
 */
class Substitute extends Operation {

    /**
     * Substitute constructor
     */
    constructor() {
        super();

        this.name = "Substitute";
        this.module = "Ciphers";
        this.description = "A substitution cipher allowing you to specify bytes to replace with other byte values. This can be used to create Caesar ciphers but is more powerful as any byte value can be substituted, not just letters, and the substitution values need not be in order.<br><br>Enter the bytes you want to replace in the Plaintext field and the bytes to replace them with in the Ciphertext field.<br><br>Non-printable bytes can be specified using string escape notation. For example, a line feed character can be written as either <code>\n</code> or <code>\x0a</code>.<br><br>Byte ranges can be specified using a hyphen. For example, the sequence <code>0123456789</code> can be written as <code>0-9</code>.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Plaintext",
                "type": "binaryString",
                "value": "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            },
            {
                "name": "Ciphertext",
                "type": "binaryString",
                "value": "XYZABCDEFGHIJKLMNOPQRSTUVW"
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const plaintext = Utils.expandAlphRange(args[0]).join(""),
            ciphertext = Utils.expandAlphRange(args[1]).join("");
        let output = "",
            index = -1;

        if (plaintext.length !== ciphertext.length) {
            output = "Warning: Plaintext and Ciphertext lengths differ\n\n";
        }

        for (let i = 0; i < input.length; i++) {
            index = plaintext.indexOf(input[i]);
            output += index > -1 && index < ciphertext.length ? ciphertext[index] : input[i];
        }

        return output;
    }

}

export default Substitute;
