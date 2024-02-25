/**
 * @author Matt C [me@mitt.dev]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";

/**
 * Unicode Text Format operation
 */
class UnicodeTextFormat extends Operation {
    /**
     * UnicodeTextFormat constructor
     */
    constructor() {
        super();

        this.name = "Unicode Text Format";
        this.module = "Default";
        this.description =
            "Adds Unicode combining characters to change formatting of plaintext.";
        this.infoURL = "https://wikipedia.org/wiki/Combining_character";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.args = [
            {
                name: "Underline",
                type: "boolean",
                value: "false",
            },
            {
                name: "Strikethrough",
                type: "boolean",
                value: "false",
            },
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const [underline, strikethrough] = args;
        let output = input.map((char) => [char]);
        if (strikethrough) {
            output = output.map((charFormat) => {
                charFormat.push(...Utils.strToUtf8ByteArray("\u0336"));
                return charFormat;
            });
        }
        if (underline) {
            output = output.map((charFormat) => {
                charFormat.push(...Utils.strToUtf8ByteArray("\u0332"));
                return charFormat;
            });
        }
        // return output.flat(); - Not supported in Node 10, polyfilled
        return [].concat(...output);
    }
}

export default UnicodeTextFormat;
