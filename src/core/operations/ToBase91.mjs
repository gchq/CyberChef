/**
 * @author Izai Alejandro Zalles Merino <zallesrene@gmail.com> (ialejandrozalles)
 * @copyright © 2025 Izai Alejandro Zalles Merino
 * @license Apache-2.0
 */

import { encodeBase91 } from "../lib/Base91.mjs";
import Operation from "../Operation.mjs";

/**
 * To Base91 operation
 */
class ToBase91 extends Operation {
    /**
     * ToBase91 constructor
     */
    constructor() {
        super();

        this.name = "To Base91";
        this.module = "Default";
        this.description = "Base91 is a binary-to-text encoding scheme that uses 91 printable ASCII characters. It provides better space efficiency than Base64 while maintaining readability. Base91 encodes arbitrary binary data using characters A-Z, a-z, 0-9, and various symbols (excluding hyphen, backslash, and single quote).";
        this.infoURL = "https://en.wikipedia.org/wiki/Binary-to-text_encoding#Encoding_standards";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const data = new Uint8Array(input);
        return encodeBase91(data);
    }
}

export default ToBase91;
