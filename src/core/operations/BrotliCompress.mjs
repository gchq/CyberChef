/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import {compress} from "brotli-compress/external";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import {isWorkerEnvironment} from "../Utils.mjs";

/**
 * Brotli Compress operation.
 */
class BrotliCompress extends Operation {

    /**
     * BrotliCompress constructor.
     */
    constructor() {
        super();

        this.name = "Brotli Compress";
        this.module = "Compression";
        this.description = "Compresses data using the Brotli compression algorithm.";
        this.infoURL = "https://www.rfc-editor.org/rfc/rfc7932";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.args = [
            {
                name: "Quality",
                type: "number",
                value: 11,
                min: 0,
                max: 11
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    async run(input, args) {
        if (isWorkerEnvironment()) self.sendStatusMessage("Compressing data with Brotli...");

        try {
            const output = await compress(new Uint8Array(input), {quality: args[0]});
            return output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength);
        } catch {
            throw new OperationError("Unable to compress data with Brotli.");
        }
    }
}

export default BrotliCompress;
