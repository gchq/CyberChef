/**
 * @author Matt C [me@mitt.dev]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import Bzip2 from "libbzip2-wasm";

/**
 * Bzip2 Compress operation
 */
class Bzip2Compress extends Operation {

    /**
     * Bzip2Compress constructor
     */
    constructor() {
        super();

        this.name = "Bzip2 Compress";
        this.module = "Compression";
        this.description = "Bzip2 is a compression library developed by Julian Seward (of GHC fame) that uses the Burrows-Wheeler algorithm. It only supports compressing single files and its compression is slow, however is more effective than Deflate (.gz & .zip).";
        this.infoURL = "https://wikipedia.org/wiki/Bzip2";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.args = [
            {
                name: "Block size (100s of kb)",
                type: "number",
                value: 9
            },
            {
                name: "Work factor",
                type: "number",
                value: 30
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {File}
     */
    run(input, args) {
        const [blockSize, workFactor, filename] = args;
        if (input.byteLength <= 0) {
            throw new OperationError("Please provide an input.");
        }
        if (ENVIRONMENT_IS_WORKER()) self.sendStatusMessage("Loading Bzip2...");
        return new Promise((resolve, reject) => {
            Bzip2().then(bzip2 => {
                if (ENVIRONMENT_IS_WORKER()) self.sendStatusMessage("Compressing data...");
                const inpArray = new Uint8Array(input);
                const bzip2cc = bzip2.compressBZ2(inpArray, blockSize, workFactor);
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

export default Bzip2Compress;
