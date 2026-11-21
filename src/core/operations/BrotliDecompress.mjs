/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import {decompress} from "brotli-compress/external";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import {isWorkerEnvironment} from "../Utils.mjs";

/**
 * Brotli Decompress operation.
 */
class BrotliDecompress extends Operation {

    /**
     * BrotliDecompress constructor.
     */
    constructor() {
        super();

        this.name = "Brotli Decompress";
        this.module = "Compression";
        this.description = "Decompresses data encoded with the Brotli compression algorithm.";
        this.infoURL = "https://www.rfc-editor.org/rfc/rfc7932";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @returns {ArrayBuffer}
     */
    async run(input) {
        if (isWorkerEnvironment()) self.sendStatusMessage("Decompressing Brotli data...");

        try {
            const output = await decompress(new Uint8Array(input));
            return output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength);
        } catch {
            throw new OperationError("Unable to decompress Brotli data.");
        }
    }
}

export default BrotliDecompress;
