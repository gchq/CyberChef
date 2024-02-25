/**
 * @author sg5506844 [sg5506844@gmail.com]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import rison from "rison";

/**
 * Rison Encode operation
 */
class RisonEncode extends Operation {
    /**
     * RisonEncode constructor
     */
    constructor() {
        super();

        this.name = "Rison Encode";
        this.module = "Default";
        this.description =
            "Rison, a data serialization format optimized for compactness in URIs. Rison is a slight variation of JSON that looks vastly superior after URI encoding. Rison still expresses exactly the same set of data structures as JSON, so data can be translated back and forth without loss or guesswork.";
        this.infoURL = "https://github.com/Nanonid/rison";
        this.inputType = "Object";
        this.outputType = "string";
        this.args = [
            {
                name: "Encode Option",
                type: "editableOption",
                value: [
                    { name: "Encode", value: "Encode" },
                    { name: "Encode Object", value: "Encode Object" },
                    { name: "Encode Array", value: "Encode Array" },
                    { name: "Encode URI", value: "Encode URI" },
                ],
            },
        ];
    }

    /**
     * @param {Object} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [encodeOption] = args;
        switch (encodeOption) {
            case "Encode":
                return rison.encode(input);
            case "Encode Object":
                return rison.encode_object(input);
            case "Encode Array":
                return rison.encode_array(input);
            case "Encode URI":
                return rison.encode_uri(input);
        }
        throw new OperationError("Invalid encode option");
    }
}

export default RisonEncode;
