/**
 * @author gaijinat [web@gaijin.at]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";

/**
 * Output operation
 */
class Output extends Operation {

    /**
     * Output constructor
     */
    constructor() {
        super();

        this.name = "Output";
        this.module = "Default";
        this.description = "Outputs the entered text.<br><br>This is useful to output text with stored registers.<br><br>Example:<br>Assuming <code>$R0</code> is <code>test</code>, the string:<br><code>Value=$R0</code><br>will output:<br><code>Value=test</code>";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Output",
                type: "toggleString",
                value: "",
                toggleValues: ["Simple string", "Extended (\\n, \\t, \\x...)"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const typeOutput = args[0].option;
        let strOutput = args[0].string;

        if (typeOutput.startsWith("Extended")) strOutput = Utils.parseEscapedChars(strOutput);

        return strOutput;
    }

}

export default Output;
