/**
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */
import Operation from "../Operation.mjs";
 /**
  * Gootloader code parser operation
  */
class GootloaderCodeParser extends Operation {
     /**
      * GootLoader constructor
      */
    constructor() {
        super();
        this.name = "Gootloader Code Parser";
        this.module = "Code";
        this.description = "Parse the actual code of Gootloader from JS";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

     /**
    * @param {string} input
    * @param {Object[]} args
    * @returns {string}
    */
    run(input, args) {
        if (!input) return "";
        input = input.split("\n");

        const mainRegex = /^[a-z0-9]+\(/;
        const variableRegex = /^[a-z0-9]+\s*=\s*/;
        const functionRegex = /^function [a-z]/;

        const main = input.filter(line => mainRegex.test(line));
        const variables = input.filter(line => variableRegex.test(line));
        const functionIndices = input
            .map((line, index) => (functionRegex.test(line) ? index : -1))
            .filter(index => index !== -1);
        const functions = functionIndices.map(fStart => {
            const fEnd = input.slice(fStart).findIndex(line => line === "}");
            return input.slice(fStart, fStart + fEnd + 1).join("");
        });

        return variables.join("\n") + "\n\n" + functions.join("\n") + "\n\n" + main.join("\n");
    }
}

export default GootloaderCodeParser;
