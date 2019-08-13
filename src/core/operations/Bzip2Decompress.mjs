/**
 * @author Matt C [me@mitt.dev]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Bzip2 from "libbzip2-wasm";
import { isWorkerEnvironment } from "../Utils.mjs";

/**
 * Bzip2 Decompress operation
 */
class Bzip2Decompress extends Operation {

    /**
     * Bzip2Decompress constructor
     */
    constructor() {
        super();

        this.name = "Bzip2 Decompress";
        this.module = "Compression";
        this.description = "Decompresses data using the Bzip2 algorithm.";
        this.infoURL = "https://wikipedia.org/wiki/Bzip2";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.args = [
            {
                name: "Use low-memory, slower decompression algorithm",
                type: "boolean",
                value: false
            }
        ];
        this.patterns = [
            {
                "match": "^\\x42\\x5a\\x68",
                "flags": "",
                "args": []
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [small] = args;
        if (input.byteLength <= 0) {
            throw new OperationError("Please provide an input.");
        }
        if (isWorkerEnvironment()) self.sendStatusMessage("Loading Bzip2...");
        return new Promise((resolve, reject) => {
            Bzip2().then(bzip2 => {
                if (isWorkerEnvironment()) self.sendStatusMessage("Decompressing data...");
                const inpArray = new Uint8Array(input);
                const bzip2cc = bzip2.decompressBZ2(inpArray, small ? 1 : 0);
                if (bzip2cc.error !== 0) {
                    reject(new OperationError(bzip2cc.error_msg));
                } else {
                    const output = bzip2cc.output;
                    resolve(output.buffer.slice(output.byteOffset, output.byteLength + output.byteOffset));
                }
            });
        });
    }

}

export default Bzip2Decompress;
