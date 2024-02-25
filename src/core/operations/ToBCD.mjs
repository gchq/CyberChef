/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";
import { ENCODING_SCHEME, ENCODING_LOOKUP, FORMAT } from "../lib/BCD.mjs";
import BigNumber from "bignumber.js";

/**
 * To BCD operation
 */
class ToBCD extends Operation {
    /**
     * ToBCD constructor
     */
    constructor() {
        super();

        this.name = "To BCD";
        this.module = "Default";
        this.description =
            "Binary-Coded Decimal (BCD) is a class of binary encodings of decimal numbers where each decimal digit is represented by a fixed number of bits, usually four or eight. Special bit patterns are sometimes used for a sign";
        this.infoURL = "https://wikipedia.org/wiki/Binary-coded_decimal";
        this.inputType = "BigNumber";
        this.outputType = "string";
        this.args = [
            {
                name: "Scheme",
                type: "option",
                value: ENCODING_SCHEME,
            },
            {
                name: "Packed",
                type: "boolean",
                value: true,
            },
            {
                name: "Signed",
                type: "boolean",
                value: false,
            },
            {
                name: "Output format",
                type: "option",
                value: FORMAT,
            },
        ];
    }

    /**
     * @param {BigNumber} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (input.isNaN()) throw new OperationError("Invalid input");
        if (!input.integerValue(BigNumber.ROUND_DOWN).isEqualTo(input))
            throw new OperationError(
                "Fractional values are not supported by BCD",
            );

        const encoding = ENCODING_LOOKUP[args[0]],
            packed = args[1],
            signed = args[2],
            outputFormat = args[3];

        // Split input number up into separate digits
        const digits = input.toFixed().split("");

        if (digits[0] === "-" || digits[0] === "+") {
            digits.shift();
        }

        let nibbles = [];

        digits.forEach((d) => {
            const n = parseInt(d, 10);
            nibbles.push(encoding[n]);
        });

        if (signed) {
            if (packed && digits.length % 2 === 0) {
                // If there are an even number of digits, we add a leading 0 so
                // that the sign nibble doesn't sit in its own byte, leading to
                // ambiguity around whether the number ends with a 0 or not.
                nibbles.unshift(encoding[0]);
            }

            nibbles.push(input > 0 ? 12 : 13);
            // 12 ("C") for + (credit)
            // 13 ("D") for - (debit)
        }

        let bytes = [];

        if (packed) {
            let encoded = 0,
                little = false;

            nibbles.forEach((n) => {
                encoded ^= little ? n : n << 4;
                if (little) {
                    bytes.push(encoded);
                    encoded = 0;
                }
                little = !little;
            });

            if (little) bytes.push(encoded);
        } else {
            bytes = nibbles;

            // Add null high nibbles
            nibbles = nibbles
                .map((n) => {
                    return [0, n];
                })
                .reduce((a, b) => {
                    return a.concat(b);
                });
        }

        // Output
        switch (outputFormat) {
            case "Nibbles":
                return nibbles
                    .map((n) => {
                        return n.toString(2).padStart(4, "0");
                    })
                    .join(" ");
            case "Bytes":
                return bytes
                    .map((b) => {
                        return b.toString(2).padStart(8, "0");
                    })
                    .join(" ");
            case "Raw":
            default:
                return Utils.byteArrayToChars(bytes);
        }
    }
}

export default ToBCD;
