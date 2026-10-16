/**
 * @author MP Gowtham [gowthamrockerzzz@gmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {decompressHuffman} from "../lib/XPRESS.mjs";

/**
 * XPRESS LZ77+Huffman Decompress operation
 */
class XPRESSHuffmanDecompress extends Operation {

    /**
     * XPRESS LZ77+Huffman Decompress constructor
     */
    constructor() {
        super();

        this.name = "XPRESS LZ77+Huffman Decompress";
        this.module = "Compression";
        this.description = "Decompresses data using the XPRESS LZ77+Huffman algorithm (MS-XCA section 2.2).<br><br>The uncompressed size must be known in advance, as it is from the WOF chunk table or WIM header, so it is taken as an argument.";
        this.infoURL = "https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-xca/5655f4a3-6ba4-489b-959f-e1f407c52f15";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.args = [
            {
                "name": "Decompressed size",
                "type": "number",
                "value": 4096
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const size = args[0];
        return decompressHuffman(input, size);
    }

}

export default XPRESSHuffmanDecompress;
