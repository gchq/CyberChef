// import Utils from "../Utils.mjs";

/**
 * Base32 resources.
 *
 * @author Peter C-S [petercs@purelymail.com]
 * @license Apache-2.0
 */

/**
 * Base32 alphabets.
 */
export const ALPHABET_OPTIONS = [
    {
        name: "Standard", // https://www.rfc-editor.org/rfc/rfc4648#section-6
        value: "A-Z2-7=",
    },
    {
        name: "Hex Extended", // https://www.rfc-editor.org/rfc/rfc4648#section-7
        value: "0-9A-V=",
    },
];

