/**
 * @author gaijinat [web@gaijin.at]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";

/**
 * Pad operation
 */
class Pad extends Operation {

    /**
     * Pad constructor
     */
    constructor() {
        super();

        this.name = "Pad";
        this.module = "Default";
        this.description = "Fills the input with one or more characters until the specified length is reached.";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Position",
                type: "option",
                value: ["Start", "End", "Both"]
            },
            {
                name: "Length",
                type: "number",
                value: 0
            },
            {
                name: "String",
                type: "toggleString",
                value: "",
                toggleValues: ["Simple string", "Extended (\\n, \\t, \\x...)"]
            },
            {
                name: "Apply to",
                type: "option",
                value: ["Input", "Lines"],
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
        const [position, padLength, {option: type}, applyTo] = args;
        let padCharacters = args[2].string;
        let output = "";
        let joinCharLenght = 0;

        if (type.startsWith("Extended")) padCharacters = Utils.parseEscapedChars(padCharacters);
        if (padCharacters === "") padCharacters = " ";

        if (applyTo === "Lines") {
            input = input.split("\n");
            joinCharLenght = 1;
            for (let i = 0; i < input.length; i++) {
                output += this.padEx(input[i], position, padLength, padCharacters) + "\n";
            }
        } else {
            output = this.padEx(input, position, padLength, padCharacters);
        }

        if (output === "") {
            return input;
        } else {
            if (joinCharLenght > 0) output = output.slice(0, output.length - joinCharLenght);
            return output;
        }
    }

    /**
     * @param {string} input
     * @param {integer} position
     * @param {integer} padLength
     * @param {string} padCharacters
     * @returns {string}
     */
    padEx(input, position, padLength, padCharacters) {
        let spaceLength, padStartLength;
        let output = "";

        if (position === "Start") {
            output = input.padStart(padLength, padCharacters);
        } else if (position === "End") {
            output = input.padEnd(padLength, padCharacters);
        } else if (position === "Both") {
            spaceLength = padLength - input.length;
            if (spaceLength > 0) {
                padStartLength = Math.floor(spaceLength / 2) + input.length;
                output = input.padStart(padStartLength, padCharacters).padEnd(padLength, padCharacters);
            }
        }

        return output;
    }

}

export default Pad;
