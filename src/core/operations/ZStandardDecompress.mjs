/**
 * @author Scarjit [ferdinand@linnenberg.dev]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

global.document = {};
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import {isWorkerEnvironment} from "../Utils.mjs";
import * as fzstd from "fzstd";

/**
 * ZStandard Decompress operation
 */
class ZStandardDecompress extends Operation {

    /**
     * ZStandardDecompress constructor
     */
    constructor() {
        super();

        this.name = "ZStandard Decompress";
        this.module = "Compress";
        this.description = "ZStandard is a compression algorithm focused on fast decompression.";
        this.infoURL = "https://wikipedia.org/wiki/Zstd"; // Usually a Wikipedia link. Remember to remove localisation (i.e. https://wikipedia.org/etc rather than https://en.wikipedia.org/etc)
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.args = [
            {
                "name": "Chunk Size (bytes)",
                "type": "number",
                "value": 65536
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        const chunkSize = args[0];
        if (input.byteLength <= 0) {
            throw new OperationError("Please provide an input.");
        }
        // Validate input starts with ZStandard magic number
        const magicNumber = new Uint8Array(input, 0, 4);
        if (magicNumber[0] !== 0x28 || magicNumber[1] !== 0xb5 || magicNumber[2] !== 0x2f || magicNumber[3] !== 0xfd) {
            throw new OperationError("Invalid ZStandard input: does not start with magic number.");
        }

        if (isWorkerEnvironment()) self.sendStatusMessage("Loading ZStandard...");
        return new Promise(async (resolve, reject) => {
            const compressed = new Uint8Array(input);
            try {
                const outChunks = []; // Array of Uint8Array chunks
                const stream = new fzstd.Decompress((chunk, isLast) => {
                    // Add to list of output chunks
                    outChunks.push(chunk);
                    // Log after all chunks decompressed
                    if (isLast) {
                        // Combine all chunks into a single Uint8Array
                        const totalLength = outChunks.reduce((sum, chunk) => sum + chunk.length, 0);
                        const result = new Uint8Array(totalLength);
                        let offset = 0;
                        for (const chunk of outChunks) {
                            result.set(chunk, offset);
                            offset += chunk.length;
                        }
                        resolve(result.buffer);
                    }
                });
                for (let i = 0; i < compressed.length; i += chunkSize) {
                    if (isWorkerEnvironment()) self.sendStatusMessage(`Decompressing chunk ${i / chunkSize + 1} of ${Math.ceil(compressed.length / chunkSize)}`);
                    const chunk = compressed.subarray(i, i + chunkSize);
                    stream.push(chunk);
                }
                stream.push(new Uint8Array(0), true); // Signal end of stream
            } catch (error) {
                reject(new OperationError("Decompression failed: " + error.message));
            }
        });
    }

}

export default ZStandardDecompress;
