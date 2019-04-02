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
        this.description = "yeet";
        this.infoURL = "https://en.wikipedia.org/wiki/Bzip2";
        this.inputType = "ArrayBuffer";
        this.outputType = "File";
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
            },
            {
                name: "Compressed filename",
                type: "string",
                value: "compressed.bz2"
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
                    resolve(new File([bzip2cc.output], filename));
                }
            });
        });
    }

}

export default Bzip2Compress;
