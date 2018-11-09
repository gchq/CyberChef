/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";

/**
 * JSON to CSV operation
 */
class JSONToCSV extends Operation {

    /**
     * JSONToCSV constructor
     */
    constructor() {
        super();

        this.name = "JSON to CSV";
        this.module = "Default";
        this.description = "Converts JSON data to a CSV.";
        this.infoURL = "https://wikipedia.org/wiki/Comma-separated_values";
        this.inputType = "JSON";
        this.outputType = "string";
        this.args = [
            {
                name: "Cell delimiter",
                type: "binaryShortString",
                value: ","
            },
            {
                name: "Row delimiter",
                type: "binaryShortString",
                value: "\\r\\n"
            }
        ];
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [cellDelim, rowDelim] = args;

        try {
            // If the JSON is an array of arrays, this is easy
            if (input[0] instanceof Array) {
                return input.map(row => row.join(cellDelim)).join(rowDelim) + rowDelim;
            }

            // If it's an array of dictionaries...
            const header = Object.keys(input[0]);
            return header.join(cellDelim) +
                rowDelim +
                input.map(
                    row => header.map(
                        h => row[h]
                    ).join(cellDelim)
                ).join(rowDelim) +
                rowDelim;
        } catch (err) {
            throw new OperationError("Unable to parse JSON to CSV: " + err);
        }
    }

}

export default JSONToCSV;
