/**
 * @author Matt C [matt@artemisbot.uk]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import {DELIM_OPTIONS} from "../lib/Delim";


/**
 * To Octal operation
 */
class ToOctal extends Operation {

    /**
     * ToOctal constructor
     */
    constructor() {
        super();

        this.name = "To Octal";
        this.module = "Default";
        this.description = "Converts the input string to octal bytes separated by the specified delimiter.<br><br>e.g. The UTF-8 encoded string <code>Γειά σου</code> becomes <code>316 223 316 265 316 271 316 254 40 317 203 316 277 317 205</code>";
        this.infoURL = "https://wikipedia.org/wiki/Octal";
        this.inputType = "byteArray";
        this.outputType = "string";
        this.args = [
            {
                "name": "Delimiter",
                "type": "option",
                "value": DELIM_OPTIONS
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const delim = Utils.charRep(args[0] || "Space");
        return input.map(val => val.toString(8)).join(delim);
    }

}

export default ToOctal;
