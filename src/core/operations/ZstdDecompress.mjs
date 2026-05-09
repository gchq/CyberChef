/**
 * @author Leon Zandman [leon@wirwar.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { isWorkerEnvironment } from "../Utils.mjs";
import { zstdInit, decompress } from "../lib/Zstd.mjs";

/**
 * Zstd Decompress operation
 */
class ZstdDecompress extends Operation {

    /**
     * ZstdDecompress constructor
     */
    constructor() {
        super();

        this.name = "Zstd Decompress";
        this.module = "Compression";
        this.description = "Decompresses data compressed with the Zstandard (Zstd) algorithm.";
        this.infoURL = "https://wikipedia.org/wiki/Zstandard";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.args = [];
        this.checks = [
            {
                pattern: "^\\x28\\xb5\\x2f\\xfd",
                flags: "",
                args: []
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    async run(input, args) {
        if (input.byteLength === 0) throw new OperationError("Please provide an input.");
        if (isWorkerEnvironment()) self.sendStatusMessage("Loading Zstd...");
        await zstdInit();
        if (isWorkerEnvironment()) self.sendStatusMessage("Decompressing data...");
        try {
            const result = decompress(new Uint8Array(input));
            return result.buffer.slice(result.byteOffset, result.byteOffset + result.byteLength);
        } catch (err) {
            throw new OperationError(`Failed to decompress: ${err.message}`);
        }
    }

}

export default ZstdDecompress;
