/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Luhn Checksum operation
 */
class LuhnChecksum extends Operation {

    /**
     * LuhnChecksum constructor
     */
    constructor() {
        super();

        this.name = "Luhn Checksum";
        this.module = "Default";
        this.description = "The Luhn algorithm, also known as the modulus 10 or mod 10 algorithm, is a simple checksum formula used to validate a variety of identification numbers, such as credit card numbers, IMEI numbers and Canadian Social Insurance Numbers.";
        this.infoURL = "https://wikipedia.org/wiki/Luhn_algorithm";
        this.inputType = "string";
        this.outputType = "number";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {number}
     */
    run(input, args) {
        let even = false;
        return input.split("").reverse().reduce((acc, elem) => {

            // Convert element to integer.
            let temp = parseInt(elem, 10);

            // If element is not an integer.
            if (isNaN(temp))
                throw new OperationError("Character: " + elem + " is not a digit.");

            // If element is in an even position
            if (even) {

                // Double the element and add the quotient and remainder together.
                temp = 2 * elem;
                temp = Math.floor(temp/10) + (temp % 10);
            }

            even = !even;
            return acc + temp;

        }, 0)  % 10;
    }

}

export default LuhnChecksum;
