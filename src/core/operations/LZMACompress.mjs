/**
 * @author Matt C [me@mitt.dev]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

import { compress } from "@blu3r4y/lzma";

/**
 * LZMA Compress operation
 */
class LZMACompress extends Operation {

    /**
     * LZMACompress constructor
     */
    constructor() {
        super();

        this.name = "LZMA Compress";
        this.module = "Compression";
        this.description = "Compresses data using the Lempel\u2013Ziv\u2013Markov chain algorithm. Compression mode determines the speed and effectiveness of the compression: 1 is fastest and less effective, 9 is slowest and most effective";
        this.infoURL = "https://wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Markov_chain_algorithm";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.args = [
            {
                name: "Compression Mode",
                type: "option",
                value: [
                    "1", "2", "3", "4", "5", "6", "7", "8", "9"
                ],
                "defaultIndex": 6
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        return new Promise((resolve, reject) => {
            compress(new Uint8Array(input), Number(args[0]), (result, error) => {
                if (error) {
                    reject(new OperationError(`Failed to compress input: ${error.message}`));
                }
                // The compression returns as an Int8Array, but we can just get the unsigned data from the buffer
                resolve(new Int8Array(result).buffer);
            }, (percent) => {
                self.sendStatusMessage(`Compressing input: ${(percent*100).toFixed(2)}%`);
            });
        });
    }

}

export default LZMACompress;
