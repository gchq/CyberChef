/**
 * Base85 resources.
 *
 * @author PenguinGeorge [george@penguingeorge.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

/**
 * Base85 alphabet options.
 */
export const ALPHABET_OPTIONS = [
    {
        name: "Standard",
        value: "!-u",
    },
    {
        name: "Z85 (ZeroMQ)",
        value: "0-9a-zA-Z.#\\-:+=^!/*?&<>()[]{}@%$#",
    },
    {
        name: "IPv6",
        value: "0-9A-Za-z!#$%&()*+\\-;<=>?@^_`{|~}",
    }
];


/**
 * Returns the name of the alphabet, when given the alphabet.
 *
 * @param {string} alphabet
 * @returns {string}
 */
export function alphabetName(alphabet) {
    alphabet = alphabet.replace("'", "&apos;");
    alphabet = alphabet.replace("\"", "&quot;");
    alphabet = alphabet.replace("\\", "&bsol;");
    let name;

    ALPHABET_OPTIONS.forEach(function(a) {
        if (escape(alphabet) === escape(a.value)) name = a.name;
    });

    return name;
}
