/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import cptable from "../vendor/js-codepage/cptable.js";
import {IO_FORMAT} from "../lib/ChrEnc.mjs";

/**
 * Decode text operation
 */
class DecodeText extends Operation {

    /**
     * DecodeText constructor
     */
    constructor() {
        super();

        this.name = "Decode text";
        this.module = "Encodings";
        this.description = [
            "Decodes text from the chosen character encoding.",
            "<br><br>",
            "Supported charsets are:",
            "<ul>",
            Object.keys(IO_FORMAT).map(e => `<li>${e}</li>`).join("\n"),
            "</ul>",
        ].join("\n");
        this.infoURL = "https://wikipedia.org/wiki/Character_encoding";
        this.inputType = "byteArray";
        this.outputType = "string";
        this.args = [
            {
                "name": "Encoding",
                "type": "option",
                "value": Object.keys(IO_FORMAT)
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const format = IO_FORMAT[args[0]];
        return cptable.utils.decode(format, input);
    }

}

export default DecodeText;
