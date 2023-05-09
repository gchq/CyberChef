/**
 * @author gaijinat [web@gaijin.at]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";

/**
 * Prepend / Append operation
 */
class PrependAppend extends Operation {

    /**
     * PrependAppend constructor
     */
    constructor() {
        super();

        this.name = "Prepend / Append";
        this.module = "Default";
        this.description = "Adds the specified text to the beginning and/or end of each line, character or the entire input.<br><br>Includes support for simple strings and extended strings (which support \\n, \\r, \\t, \\b, \\f and escaped hex bytes using \\x notation, e.g. \\x00 for a null byte).";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Prepend",
                type: "toggleString",
                value: "",
                toggleValues: ["Simple string", "Extended (\\n, \\t, \\x...)"]
            },
            {
                name: "Append",
                type: "toggleString",
                value: "",
                toggleValues: ["Simple string", "Extended (\\n, \\t, \\x...)"]
            },
            {
                name: "Apply to",
                type: "option",
                value: ["Input", "Lines", "Characters"],
                defaultIndex: 1
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [{option: typePrepend}, {option: typeAppend}, applyTo] = args;
        let [{string: strPrepend}, {string: strAppend}] = args;
        let output = "";
        let joinChar = "";

        if (typePrepend.startsWith("Extended")) strPrepend = Utils.parseEscapedChars(strPrepend);
        if (typeAppend.startsWith("Extended")) strAppend = Utils.parseEscapedChars(strAppend);

        if (applyTo === "Input") {
            output = strPrepend + input + strAppend;
        } else {
            if (applyTo === "Lines") {
                input = input.split("\n");
                joinChar = "\n";
            }
            for (let i = 0; i < input.length; i++) {
                output += strPrepend + input[i] + strAppend + joinChar;
            }
        }

        if (joinChar.length > 0) output = output.slice(0, output.length - joinChar.length);
        return output;
    }

}

export default PrependAppend;
