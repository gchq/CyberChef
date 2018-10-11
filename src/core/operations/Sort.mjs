/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import {INPUT_DELIM_OPTIONS} from "../lib/Delim";

/**
 * Sort operation
 */
class Sort extends Operation {

    /**
     * Sort constructor
     */
    constructor() {
        super();

        this.name = "Sort";
        this.module = "Default";
        this.description = "Alphabetically sorts strings separated by the specified delimiter.<br><br>The IP address option supports IPv4 only.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Delimiter",
                "type": "option",
                "value": INPUT_DELIM_OPTIONS
            },
            {
                "name": "Reverse",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Order",
                "type": "option",
                "value": ["Alphabetical (case sensitive)", "Alphabetical (case insensitive)", "IP address", "Numeric", "Numeric (hexadecimal)"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const delim = Utils.charRep(args[0]),
            sortReverse = args[1],
            order = args[2];
        let sorted = input.split(delim);

        if (order === "Alphabetical (case sensitive)") {
            sorted = sorted.sort();
        } else if (order === "Alphabetical (case insensitive)") {
            sorted = sorted.sort(Sort._caseInsensitiveSort);
        } else if (order === "IP address") {
            sorted = sorted.sort(Sort._ipSort);
        } else if (order === "Numeric") {
            sorted = sorted.sort(Sort._numericSort);
        } else if (order === "Numeric (hexadecimal)") {
            sorted = sorted.sort(Sort._hexadecimalSort);
        }

        if (sortReverse) sorted.reverse();
        return sorted.join(delim);
    }

    /**
     * Comparison operation for sorting of strings ignoring case.
     *
     * @private
     * @param {string} a
     * @param {string} b
     * @returns {number}
     */
    static _caseInsensitiveSort(a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    }


    /**
     * Comparison operation for sorting of IPv4 addresses.
     *
     * @private
     * @param {string} a
     * @param {string} b
     * @returns {number}
     */
    static _ipSort(a, b) {
        let a_ = a.split("."),
            b_ = b.split(".");

        a_ = a_[0] * 0x1000000 + a_[1] * 0x10000 + a_[2] * 0x100 + a_[3] * 1;
        b_ = b_[0] * 0x1000000 + b_[1] * 0x10000 + b_[2] * 0x100 + b_[3] * 1;

        if (isNaN(a_) && !isNaN(b_)) return 1;
        if (!isNaN(a_) && isNaN(b_)) return -1;
        if (isNaN(a_) && isNaN(b_)) return a.localeCompare(b);

        return a_ - b_;
    }

    /**
     * Comparison operation for sorting of numeric values.
     *
     * @author Chris van Marle
     * @private
     * @param {string} a
     * @param {string} b
     * @returns {number}
     */
    static _numericSort(a, b) {
        const a_ = a.split(/([^\d]+)/),
            b_ = b.split(/([^\d]+)/);

        for (let i = 0; i < a_.length && i < b.length; ++i) {
            if (isNaN(a_[i]) && !isNaN(b_[i])) return 1; // Numbers after non-numbers
            if (!isNaN(a_[i]) && isNaN(b_[i])) return -1;
            if (isNaN(a_[i]) && isNaN(b_[i])) {
                const ret = a_[i].localeCompare(b_[i]); // Compare strings
                if (ret !== 0) return ret;
            }
            if (!isNaN(a_[i]) && !isNaN(a_[i])) { // Compare numbers
                if (a_[i] - b_[i] !== 0) return a_[i] - b_[i];
            }
        }

        return a.localeCompare(b);
    }

    /**
     * Comparison operation for sorting of hexadecimal values.
     *
     * @author Chris van Marle
     * @private
     * @param {string} a
     * @param {string} b
     * @returns {number}
     */
    static _hexadecimalSort(a, b) {
        const a_ = a.split(/([^\da-f]+)/i),
            b_ = b.split(/([^\da-f]+)/i);

		for (let i = 0; i < a_.length; ++i) {
			let t = parseInt(a_[i], 16);
			if (!isNaN(t)) {
				a_[i] = t;
			}
		}

		for (let i = 0; i < b_.length; ++i) {
			let t = parseInt(b_[i], 16);
			if (!isNaN(t)) {
				b_[i] = t;
			}
		}

        for (let i = 0; i < a_.length && i < b.length; ++i) {
            if (isNaN(a_[i]) && !isNaN(b_[i])) return 1; // Numbers after non-numbers
            if (!isNaN(a_[i]) && isNaN(b_[i])) return -1;
            if (isNaN(a_[i]) && isNaN(b_[i])) {
                const ret = a_[i].localeCompare(b_[i]); // Compare strings
                if (ret !== 0) return ret;
            }
            if (!isNaN(a_[i]) && !isNaN(a_[i])) { // Compare numbers
                if (a_[i] - b_[i] !== 0) return a_[i] - b_[i];
            }
        }

        return a.localeCompare(b);
    }

}

export default Sort;
