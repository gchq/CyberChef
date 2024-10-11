/**
 * @author Scarjit [ferdinand@linnenberg.dev]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * ZStandard Decode operation
 */
class ZStandardDecode extends Operation {

    /**
     * ZStandardDecode constructor
     */
    constructor() {
        super();

        this.name = "ZStandard Decode";
        this.module = "Compression";
        this.description = "Zstandard is a lossless data compression algorithm designed for fast compression and decompression. It was developed by Facebook.";
        this.infoURL = "https://wikipedia.org/wiki/Zstd"; // Usually a Wikipedia link. Remember to remove localisation (i.e. https://wikipedia.org/etc rather than https://en.wikipedia.org/etc)
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
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
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        // const [firstArg, secondArg] = args;

        throw new OperationError("Test");
    }

}

export default ZStandardDecode;
