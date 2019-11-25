/**
 * @author Matthieu [m@tthieu.xyz]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import unorm from "unorm";
import {UNICODE_NORMALISATION_FORMS} from "../lib/ChrEnc";

/**
 * Normalise Unicode operation
 */
class NormaliseUnicode extends Operation {

    /**
     * NormaliseUnicode constructor
     */
    constructor() {
        super();

        this.name = "Normalise Unicode";
        this.module = "UnicodeNormalisation";
        this.description = "Transform Unicode to one of the Normalisation Form";
        this.infoURL = "http://www.unicode.org/reports/tr15/";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Normal Form",
                type: "option",
                value: UNICODE_NORMALISATION_FORMS
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [normalForm] = args;
        if (normalForm === "NFD") {
            return unorm.nfd(input);
        } else if (normalForm === "NFC") {
            return unorm.nfc(input);
        } else if (normalForm === "NFKD") {
            return unorm.nfkd(input);
        } else if (normalForm === "NFKC") {
            return unorm.nfc(input);
        }

        throw new OperationError("Unknown Normalisation Form");
    }

}

export default NormaliseUnicode;
