/**
 * @author sevzero [sevzero@protonmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";

/**
 * Dechunk HTTP response operation
 */
class DechunkHTTP extends Operation {

    /**
     * DechunkHTTP constructor
     */
    constructor() {
        super();

        this.name = "Dechunk HTTP response";
        this.module = "Default";
        this.description = "Parses a HTTP response transferred using transfer-encoding:chunked";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        let chunks = [];
        let chunkSizeEnd = input.indexOf("\n") + 1;
        let lineEndings = input.charAt(chunkSizeEnd - 2) === "\r" ? "\r\n" : "\n";
        let lineEndingsLength = lineEndings.length;
        let chunkSize = parseInt(input.slice(0, chunkSizeEnd), 16);
        while (!isNaN(chunkSize)) {
            chunks.push(input.slice(chunkSizeEnd, chunkSize + chunkSizeEnd)); 
            input = input.slice(chunkSizeEnd + chunkSize + lineEndingsLength);
            chunkSizeEnd = input.indexOf(lineEndings) + lineEndingsLength;
            chunkSize = parseInt(input.slice(0, chunkSizeEnd), 16);
        }
        return chunks.join("") + input;
    }

}

export default DechunkHTTP;
