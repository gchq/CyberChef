/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import cptable from "../vendor/js-codepage/cptable.js";
import {IO_FORMAT} from "../lib/ChrEnc";

/**
 * Encode text operation
 */
class EncodeText extends Operation {

    /**
     * EncodeText constructor
     */
    constructor() {
        super();

        this.name = "Encode text";
        this.module = "CharEnc";
        this.description = [
            "Encodes text into the chosen character encoding.",
            "<br><br>",
            "Supported charsets are:",
            "<ul>",
            Object.keys(IO_FORMAT).map(e => `<li>${e}</li>`).join("\n"),
            "</ul>",
        ].join("\n");
        this.infoURL = "https://wikipedia.org/wiki/Character_encoding";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [
            {
                "name": "Encoding",
                "type": "option",
                "value": Object.keys(IO_FORMAT)
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const format = IO_FORMAT[args[0]];
        let encoded = cptable.utils.encode(format, input);
        encoded = Array.from(encoded);
        return encoded;
    }

}


export default EncodeText;
