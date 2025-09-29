/**
 * @author dolphinau [me@dawl.fr]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

import { deobfuscate, getLanguages } from "minusonejs";

/**
 * Deobfuscate operation
 */
class Deobfuscate extends Operation {
    /**
     * Deobfuscate constructor
     */
    constructor() {
        super();

        this.name = "Deobfuscate";
        this.module = "Obfuscation";
        this.description =
            "Deobfuscate input with the minusone engine.<br>Supported languages:<br>- Powershell";
        this.infoURL = "https://github.com/airbus-cert/minusone"; // Usually a Wikipedia link. Remember to remove localisation (i.e. https://wikipedia.org/etc rather than https://en.wikipedia.org/etc)
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Language",
                type: "option",
                value: getLanguages(),
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (!input) return "";

        const [Language] = args;
        const [res, err] = deobfuscate(input, Language);

        if (err) throw new OperationError(`Deobfuscate error: ${err}`);
        return res;
    }
}

export default Deobfuscate;
