/**
 * @author Leon Zandman [leon@wirwar.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { isWorkerEnvironment } from "../Utils.mjs";
import { zstdInit, decompressStream } from "../lib/Zstd.mjs";

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
        return decompressStream(new Uint8Array(input));
    }

}

export default ZstdDecompress;
