/**
 * @author Klaxon [klaxon@veyr.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";

/**
 * Remove Letter Accents operation
 */
class RemoveLetterAccents extends Operation {

    /**
     * RemoveLetterAccents constructor
     */
    constructor() {
        super();

        this.name = "Remove Letter Accents";
        this.module = "Default";
        this.description = "Replaces accented characters with their latin character equivalent.";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            /* Example arguments. See the project wiki for full details.
            {
                name: "First arg",
                type: "string",
                value: "Don't Panic"
            },
            {
                name: "Second arg",
                type: "number",
                value: 42
            }
            */
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        //reference: https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript/37511463
    }

}

export default RemoveLetterAccents;
