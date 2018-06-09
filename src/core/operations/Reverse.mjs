/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";

/**
 * Reverse operation
 */
class Reverse extends Operation {

    /**
     * Reverse constructor
     */
    constructor() {
        super();

        this.name = "Reverse";
        this.module = "Default";
        this.description = "Reverses the input string.";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.args = [
            {
                "name": "By",
                "type": "option",
                "value": ["Character", "Line"]
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        let i;
        if (args[0] === "Line") {
            const lines = [];
            let line = [],
                result = [];
            for (i = 0; i < input.length; i++) {
                if (input[i] === 0x0a) {
                    lines.push(line);
                    line = [];
                } else {
                    line.push(input[i]);
                }
            }
            lines.push(line);
            lines.reverse();
            for (i = 0; i < lines.length; i++) {
                result = result.concat(lines[i]);
                result.push(0x0a);
            }
            return result.slice(0, input.length);
        } else {
            return input.reverse();
        }
    }

}

export default Reverse;
