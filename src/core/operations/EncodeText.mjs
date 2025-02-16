/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import cptable from "codepage";
import {CHR_ENC_CODE_PAGES} from "../lib/ChrEnc.mjs";

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
        this.module = "Encodings";
        this.description = [
            "Encodes text into the chosen character encoding.",
            "<br><br>",
            "Supported charsets are:",
            "<ul>",
            Object.keys(CHR_ENC_CODE_PAGES).map(e => `<li>${e}</li>`).join("\n"),
            "</ul>",
        ].join("\n");
        this.infoURL = "https://wikipedia.org/wiki/Character_encoding";
        this.inputType = "string";
        this.outputType = "ArrayBuffer";
        this.args = [
            {
                "name": "Encoding",
                "type": "option",
                "value": Object.keys(CHR_ENC_CODE_PAGES)
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        const format = CHR_ENC_CODE_PAGES[args[0]];
        const encoded = cptable.utils.encode(format, input);
        return new Uint8Array(encoded).buffer;
    }

}


export default EncodeText;
