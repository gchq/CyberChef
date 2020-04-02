/**
 * @author cbeuw [cbeuw.andy@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import {parseQTable, indexOfMarker} from "../lib/QuantisationTable.mjs";

/**
 * Extract Quantisation Tables operation
 */
class ExtractQuantisationTables extends Operation {

    /**
     * ExtractQuantisationTables constructor
     */
    constructor() {
        super();

        this.name = "Extract Quantisation Tables";
        this.module = "Default";
        this.description = "Extracts quantisation tables embedded in a JPEG image.";
        this.infoURL = "https://en.wikipedia.org/wiki/Quantization_(image_processing)";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const image = new Uint8Array(input);
        // maximally 4 tables are allowed in a JPEG file

        let ptr = indexOfMarker(image, 0xD8);
        if (ptr === -1) throw new OperationError("Malformed image file: Start of Image not found");

        let ret = "";

        do {
            const dqtIndex = indexOfMarker(image, 0xDB, ptr);
            if (dqtIndex === -1) {
                break;
            }
            // -2 here because the length bytes include the two bytes used to record length
            // -1 to exclude the byte used to record the table's precision and id
            const tableLength = (image[dqtIndex+2] << 8) + image[dqtIndex+3] - 2 - 1;
            // if the table is 16-bit precision
            const doublePrecision = (image[dqtIndex+4] >> 4) === 1;
            if (tableLength !== (doublePrecision? 128:64)) throw new OperationError(`Invalid table length ${tableLength} at table definition beginning at ${dqtIndex}`);
            const tableId = image[dqtIndex+4] & 0x0F;
            if (tableId >= 4) throw new OperationError(`Invalid table identifier ${tableId} at table definition beginning at ${dqtIndex}`);
            const table = parseQTable(image.slice(dqtIndex + 5, dqtIndex + 5 + tableLength), doublePrecision);

            ret += `Quantisation table at position ${dqtIndex}. ID ${tableId}, ${(doublePrecision? "16":"8")}-bit precision:\n`;
            ret += this.prettifyMatrix(table);
            ret += "\n";

            ptr = dqtIndex + 5 + tableLength + 1;
        } while (ptr < image.length);

        return ret;
    }

    /**
     * @param {number[][]} mat
     * @returns {string}
     */
    prettifyMatrix(mat) {
        const nRows = mat.length;
        const nCols = mat[0].length;
        let maxLen = 0;
        for (let i = 0; i < nRows; i++) {
            for (let j = 0; j < nCols; j++) {
                const elemLen = mat[i][j].toString().length;
                if (elemLen > maxLen) {
                    maxLen = elemLen;
                }
            }
        }

        let ret = "";
        for (let i = 0; i < nRows; i++) {
            for (let j = 0; j < nCols; j++) {
                ret += mat[i][j].toString().padStart(maxLen) + " ";
            }
            ret += "\n";
        }
        return ret;
    }
}

export default ExtractQuantisationTables;
