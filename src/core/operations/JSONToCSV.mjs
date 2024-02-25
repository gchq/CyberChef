/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import * as flat from "flat";
const flatten = flat.default ? flat.default.flatten : flat.flatten;

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
        this.description =
            "Converts JSON data to a CSV based on the definition in RFC 4180.";
        this.infoURL = "https://wikipedia.org/wiki/Comma-separated_values";
        this.inputType = "JSON";
        this.outputType = "string";
        this.args = [
            {
                name: "Cell delimiter",
                type: "binaryShortString",
                value: ",",
            },
            {
                name: "Row delimiter",
                type: "binaryShortString",
                value: "\\r\\n",
            },
        ];
    }

    /**
     * Converts JSON to a CSV equivalent.
     *
     * @param {boolean} force - Whether to force conversion of data to fit in a cell
     * @returns {string}
     */
    toCSV(force = false) {
        const self = this;
        // If the JSON is an array of arrays, this is easy
        if (this.flattened[0] instanceof Array) {
            return (
                this.flattened
                    .map((row) =>
                        row
                            .map((d) => self.escapeCellContents(d, force))
                            .join(this.cellDelim),
                    )
                    .join(this.rowDelim) + this.rowDelim
            );
        }

        // If it's an array of dictionaries...
        const header = Object.keys(this.flattened[0]);
        return (
            header
                .map((d) => self.escapeCellContents(d, force))
                .join(this.cellDelim) +
            this.rowDelim +
            this.flattened
                .map((row) =>
                    header
                        .map((h) => row[h])
                        .map((d) => self.escapeCellContents(d, force))
                        .join(this.cellDelim),
                )
                .join(this.rowDelim) +
            this.rowDelim
        );
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [cellDelim, rowDelim] = args;

        // Record values so they don't have to be passed to other functions explicitly
        this.cellDelim = cellDelim;
        this.rowDelim = rowDelim;
        this.flattened = input;
        if (!(this.flattened instanceof Array)) {
            this.flattened = [input];
        }

        try {
            return this.toCSV();
        } catch (err) {
            try {
                this.flattened = flatten(input);
                if (!(this.flattened instanceof Array)) {
                    this.flattened = [this.flattened];
                }
                return this.toCSV(true);
            } catch (err) {
                throw new OperationError(
                    "Unable to parse JSON to CSV: " + err.toString(),
                );
            }
        }
    }

    /**
     * Correctly escapes a cell's contents based on the cell and row delimiters.
     *
     * @param {string} data
     * @param {boolean} force - Whether to force conversion of data to fit in a cell
     * @returns {string}
     */
    escapeCellContents(data, force = false) {
        if (data !== "string") {
            const isPrimitive = data == null || typeof data !== "object";
            if (isPrimitive) data = `${data}`;
            else if (force) data = JSON.stringify(data);
        }

        // Double quotes should be doubled up
        data = data.replace(/"/g, '""');

        // If the cell contains a cell or row delimiter or a double quote, it must be enclosed in double quotes
        if (
            data.indexOf(this.cellDelim) >= 0 ||
            data.indexOf(this.rowDelim) >= 0 ||
            data.indexOf("\n") >= 0 ||
            data.indexOf("\r") >= 0 ||
            data.indexOf('"') >= 0
        ) {
            data = `"${data}"`;
        }

        return data;
    }
}

export default JSONToCSV;
