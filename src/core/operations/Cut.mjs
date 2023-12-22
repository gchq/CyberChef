/**
 * @author emilhf [emil@cyberops.no]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import {SPLIT_DELIM_OPTIONS, JOIN_DELIM_OPTIONS} from "../lib/Delim.mjs";
import XRegExp from "xregexp";

/**
 * Cut operation
 */
class Cut extends Operation {

    /**
     * Cut constructor
     */
    constructor() {
        super();

        this.name = "Cut";
        this.module = "Utils";
        this.description = "Extract fields from records similarly to <code>awk</code> and <code>cut</code>. The expression <code>1, 3-4</code> will extract the 2nd, 4th and 5th fields. <code>3, 1 &quot;T&quot; 2</code> will extract the 4th field, then combine the 2nd and 3rd field into a new field (with the letter 'T' separating the original values).<br><br>If no input field delimiter is set, <strong>fixed width mode</strong> is enabled: Fields become the indices of the payload, and ranges will be appended to the current output field instead of creating new fields. This aids in carving e.g. CSVs from fixed width data.";
        this.infoURL = "https://en.wikipedia.org/wiki/Cut_(Unix)";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Common input type",
                "type": "populateOption",
                "value": [
                    {
                        name: "User defined",
                        value: ""
                    },
                    {
                        name: "CSV",
                        value: ","
                    },
                    {
                        name: "TSV",
                        value: "\\t"
                    },
                    {
                        name: "PSV",
                        value: "\\|"
                    },
                    {
                        name: "Space aligned",
                        value: "\\s+"
                    }
                ],
                "target": 4
            },
            {
                "name": "Expression",
                "type": "text",
                "value": "0-"
            },
            {
                "name": "Input record delimiter",
                "type": "editableOptionShort",
                "value": SPLIT_DELIM_OPTIONS,
                "defaultIndex": 2
            },
            {
                "name": "Output record delimiter",
                "type": "editableOptionShort",
                "value": SPLIT_DELIM_OPTIONS,
                "defaultIndex": 2
            },
            {
                "name": "Input field delimiter",
                "type": "shortString",
                "value": ""
            },
            {
                "name": "Output field delimiter",
                "type": "editableOptionShort",
                "value": JOIN_DELIM_OPTIONS,
                "defaultIndex": 3
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [, expr, inRecordDelim, outRecordDelim, inFieldDelim, outFieldDelim] = args;
        const split = new XRegExp(inFieldDelim);
        const fixedWidth = inFieldDelim === "";

        /**
         * @param {Array[]}
         * @returns {Array[]}
         */
        const gr = (data) => {
            data = fixedWidth ? data : data.split(split);
            return this.extract(data, expr, fixedWidth).join(outFieldDelim);
        };

        return input.split(inRecordDelim).map(gr).join(outRecordDelim);
        // return gr(input);
    }

    /**
     * Extracts fields as specified by the extraction expression. If fixedWidth
     * is true, ranges do not introduce new fields, but rather append to the
     * current field being dealt with.
     *
     * The extract expression is a lightweight DSL similar to the fields flag
     * (-f) of cut in UNIX, and also incorporates elements of the awk print
     * statement. It departs from cut in a few noteworthy ways:
     *
     * - Reverse ranges are supported, e.g. 4-1.
     *
     * - Negative field values, e.g. -1, are offsets from the end of the data.
     *   Note that negative ranges are not supported.
     *
     * - Fields are numbered from 0 instead of 1.
     *
     * - New fields can be constructed by combining existing fields. This
     *   operation also supports appending strings: '1 "@" 2' will join field 1
     *   and 2 with "@" in between them.
     *
     * @param {Array[]} data
     * @param {string} expr
     * @param {Boolean} fixedWidth
     * @returns {Array[Number]}
     */
    extract(data, expr, fixedWidth) {
        const maxOffset = data.length - 1;

        /**
         * @param {Number} n
         * @returns {Array[]}
         */
        const pick = (n) => n < 0 ? data[maxOffset + n + 1] : data[n];

        const fields = [];
        let currentField = [];
        let previousToken = null;
        const tokens = expr.trim().match(/((".*?")|(\d+-\d*)|(-?\d+)|(,))/g);
        tokens.forEach(token => {
            // Field separator
            if (token.match(/^,$/)) {
                previousToken = "delimiter";
                if (currentField.length) {
                    fields.push(currentField.join(""));
                    currentField = [];
                }
                return;
            }

            if (!fixedWidth && previousToken === "range") {
                throw new OperationError(
                    `Cannot join '${token}', as previous term was a range. Requires fixed width mode.`
                );
            }

            if (token.match("^-?[0-9]+$")) {
                previousToken = "extraction";
                const n = Number(token);
                currentField.push(pick(n));
                return;
            }
            if (token.match(/^\d+-\d*$/)) {
                previousToken = "range";
                if (!fixedWidth && currentField.length) {
                    throw new OperationError(
                        `Cannot join range '${token}' with rest of field: ${currentField.join("")}. Requires fixed width mode.`
                    );
                }
                const m = token.match(/^([0-9]+)-([0-9]*)$/);
                const a = Number(m[1]);
                const b = m[2] === "" ? maxOffset: Number(m[2]);

                const vals = [];
                if (a <= b) {
                    for (let i = a; i <= b && i <= maxOffset; i++) {
                        vals.push(pick(i));
                    }
                } else {
                    for (let i = a; i >= b && i <= maxOffset; i--) {
                        vals.push(pick(i));
                    }
                }

                if (fixedWidth) {
                    currentField.push(...vals);
                } else {
                    fields.push(...vals);
                }
                return;
            }
            if (token.match(/^".*"$/)) {
                previousToken = "string";
                const m = token.match(/"(.*)"/);
                currentField.push(m[1]);
            }
            // NOT REACHED
        });
        // Terminal condition
        if (currentField.length) {
            fields.push(currentField.join(""));
        }
        return fields;
    }

}

export default Cut;
