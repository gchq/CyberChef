/**
 * Parity Bit functions.
 *
 * @author j83305 [awz22@protonmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 *
 */

import OperationError from "../errors/OperationError.mjs";

/**
 * Function to take the user input and encode using the given arguments
 * @param input string of binary
 * @param args array
 */
export function calculateParityBit(input, args) {
    let count1s = 0;
    for (let i = 0; i < input.length; i++) {
        const character = input.charAt(i);
        if (character === "1") {
            count1s++;
        } else if (character !== args[3] && character !== "0" && character !== " ") {
            throw new OperationError("unexpected character encountered: \"" + character + "\"");
        }
    }
    let parityBit = "1";
    const flipflop = args[0] === "Even Parity" ? 0 : 1;
    if (count1s % 2 === flipflop) {
        parityBit = "0";
    }
    if (args[1] === "End") {
        return input + parityBit;
    } else {
        return parityBit + input;
    }
}

/**
 * just removes the parity bit to return the original data
 * @param input string of binary, encoded
 * @param args array
 */
export function decodeParityBit(input, args) {
    if (args[1] === "End") {
        return input.slice(0, -1);
    } else {
        return input.slice(1);
    }
}
