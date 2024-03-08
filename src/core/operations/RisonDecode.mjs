/**
 * @author sg5506844 [sg5506844@gmail.com]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import rison from "rison";

/**
 * Rison Decode operation
 */
class RisonDecode extends Operation {

    /**
     * RisonDecode constructor
     */
    constructor() {
        super();

        this.name = "Rison Decode";
        this.module = "Default";
        this.description = "Rison, a data serialization format optimized for compactness in URIs. Rison is a slight variation of JSON that looks vastly superior after URI encoding. Rison still expresses exactly the same set of data structures as JSON, so data can be translated back and forth without loss or guesswork.";
        this.infoURL = "https://github.com/Nanonid/rison";
        this.inputType = "string";
        this.outputType = "Object";
        this.args = [
            {
                name: "Decode Option",
                type: "editableOption",
                value: [
                    { name: "Decode", value: "Decode", },
                    { name: "Decode Object", value: "Decode Object", },
                    { name: "Decode Array", value: "Decode Array", },
                ]
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {Object}
     */
    run(input, args) {
        const [decodeOption] = args;
        switch (decodeOption) {
            case "Decode":
                return rison.decode(input);
            case "Decode Object":
                return rison.decode_object(input);
            case "Decode Array":
                return rison.decode_array(input);
        }
        throw new OperationError("Invalid Decode option");
    }
}

export default RisonDecode;
