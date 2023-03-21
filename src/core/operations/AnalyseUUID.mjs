/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import * as uuid from "uuid";
import OperationError from "../errors/OperationError.mjs";

/**
 * Analyse hash operation
 */
class AnalyseHash extends Operation {

    /**
     * AnalyseHash constructor
     */
    constructor() {
        super();

        this.name = "Analyse UUID";
        this.module = "Crypto";
        this.description = "Tries to determine information about a given UUID and suggests which version may have been used to generate it";
        this.infoURL = "https://wikipedia.org/wiki/Universally_unique_identifier";
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
        try {
            const uuidVersion = uuid.version(input);
            return "UUID version: " + uuidVersion;
        } catch (error) {
            throw new OperationError("Invalid UUID");
        }
    }

}

export default AnalyseHash;
