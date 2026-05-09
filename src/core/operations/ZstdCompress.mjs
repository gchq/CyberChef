/**
 * @author Leon Zandman [leon@wirwar.com]
 * @copyright Crown Copyright 2027
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { isWorkerEnvironment } from "../Utils.mjs";
import { zstdInit, compress } from "../lib/Zstd.mjs";

/**
 * Zstd Compress operation
 */
class ZstdCompress extends Operation {

    /**
     * ZstdCompress constructor
     */
    constructor() {
        super();

        this.name = "Zstd Compress";
        this.module = "Compression";
        this.description = "Compresses data using the Zstandard (Zstd) algorithm. Zstd offers high compression ratios at fast speeds and is widely used in Linux, databases, container images, and network protocols. Higher compression levels result in better compression but slower speed.";
        this.infoURL = "https://wikipedia.org/wiki/Zstandard";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.args = [
            {
                name: "Compression level",
                type: "option",
                value: [
                    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
                    "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
                    "21", "22"
                ],
                defaultIndex: 2
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    async run(input, args) {
        const level = parseInt(args[0], 10);
        if (input.byteLength === 0) throw new OperationError("Please provide an input.");
        if (isWorkerEnvironment()) self.sendStatusMessage("Loading Zstd...");
        await zstdInit();
        if (isWorkerEnvironment()) self.sendStatusMessage("Compressing data...");
        try {
            const result = compress(new Uint8Array(input), level);
            return result.buffer.slice(result.byteOffset, result.byteOffset + result.byteLength);
        } catch (err) {
            throw new OperationError(`Failed to compress: ${err.message}`);
        }
    }

}

export default ZstdCompress;
