/**
 * Emulation of the Enigma machine.
 *
 * Tested against various genuine Enigma machines using a variety of inputs
 * and settings to confirm correctness.
 *
 * @author s2224834
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import {
    ROTORS,
    LETTERS,
    ROTORS_FOURTH,
    REFLECTORS,
    Rotor,
    Reflector,
    Plugboard,
    EnigmaMachine,
} from "../lib/Enigma.mjs";

/**
 * Enigma operation
 */
class Enigma extends Operation {
    /**
     * Enigma constructor
     */
    constructor() {
        super();

        this.name = "Enigma";
        this.module = "Bletchley";
        this.description =
            "Encipher/decipher with the WW2 Enigma machine.<br><br>Enigma was used by the German military, among others, around the WW2 era as a portable cipher machine to protect sensitive military, diplomatic and commercial communications.<br><br>The standard set of German military rotors and reflectors are provided. To configure the plugboard, enter a string of connected pairs of letters, e.g. <code>AB CD EF</code> connects A to B, C to D, and E to F. This is also used to create your own reflectors. To create your own rotor, enter the letters that the rotor maps A to Z to, in order, optionally followed by <code>&lt;</code> then a list of stepping points.<br>This is deliberately fairly permissive with rotor placements etc compared to a real Enigma (on which, for example, a four-rotor Enigma uses only the thin reflectors and the beta or gamma rotor in the 4th slot).<br><br>More detailed descriptions of the Enigma, Typex and Bombe operations <a href='https://github.com/gchq/CyberChef/wiki/Enigma,-the-Bombe,-and-Typex'>can be found here</a>.";
        this.infoURL = "https://wikipedia.org/wiki/Enigma_machine";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Model",
                type: "argSelector",
                value: [
                    {
                        name: "3-rotor",
                        off: [1, 2, 3],
                    },
                    {
                        name: "4-rotor",
                        on: [1, 2, 3],
                    },
                ],
            },
            {
                name: "Left-most (4th) rotor",
                type: "editableOption",
                value: ROTORS_FOURTH,
                defaultIndex: 0,
            },
            {
                name: "Left-most rotor ring setting",
                type: "option",
                value: LETTERS,
            },
            {
                name: "Left-most rotor initial value",
                type: "option",
                value: LETTERS,
            },
            {
                name: "Left-hand rotor",
                type: "editableOption",
                value: ROTORS,
                defaultIndex: 0,
            },
            {
                name: "Left-hand rotor ring setting",
                type: "option",
                value: LETTERS,
            },
            {
                name: "Left-hand rotor initial value",
                type: "option",
                value: LETTERS,
            },
            {
                name: "Middle rotor",
                type: "editableOption",
                value: ROTORS,
                defaultIndex: 1,
            },
            {
                name: "Middle rotor ring setting",
                type: "option",
                value: LETTERS,
            },
            {
                name: "Middle rotor initial value",
                type: "option",
                value: LETTERS,
            },
            {
                name: "Right-hand rotor",
                type: "editableOption",
                value: ROTORS,
                // Default config is the rotors I-III *left to right*
                defaultIndex: 2,
            },
            {
                name: "Right-hand rotor ring setting",
                type: "option",
                value: LETTERS,
            },
            {
                name: "Right-hand rotor initial value",
                type: "option",
                value: LETTERS,
            },
            {
                name: "Reflector",
                type: "editableOption",
                value: REFLECTORS,
            },
            {
                name: "Plugboard",
                type: "string",
                value: "",
            },
            {
                name: "Strict output",
                hint: "Remove non-alphabet letters and group output",
                type: "boolean",
                value: true,
            },
        ];
    }

    /**
     * Helper - for ease of use rotors are specified as a single string; this
     * method breaks the spec string into wiring and steps parts.
     *
     * @param {string} rotor - Rotor specification string.
     * @param {number} i - For error messages, the number of this rotor.
     * @returns {string[]}
     */
    parseRotorStr(rotor, i) {
        if (rotor === "") {
            throw new OperationError(`Rotor ${i} must be provided.`);
        }
        if (!rotor.includes("<")) {
            return [rotor, ""];
        }
        return rotor.split("<", 2);
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const model = args[0];
        const reflectorstr = args[13];
        const plugboardstr = args[14];
        const removeOther = args[15];
        const rotors = [];
        for (let i = 0; i < 4; i++) {
            if (i === 0 && model === "3-rotor") {
                // Skip the 4th rotor settings
                continue;
            }
            const [rotorwiring, rotorsteps] = this.parseRotorStr(
                args[i * 3 + 1],
                1,
            );
            rotors.push(
                new Rotor(
                    rotorwiring,
                    rotorsteps,
                    args[i * 3 + 2],
                    args[i * 3 + 3],
                ),
            );
        }
        // Rotors are handled in reverse
        rotors.reverse();
        const reflector = new Reflector(reflectorstr);
        const plugboard = new Plugboard(plugboardstr);
        if (removeOther) {
            input = input.replace(/[^A-Za-z]/g, "");
        }
        const enigma = new EnigmaMachine(rotors, reflector, plugboard);
        let result = enigma.crypt(input);
        if (removeOther) {
            // Five character cipher groups is traditional
            result = result.replace(/([A-Z]{5})(?!$)/g, "$1 ");
        }
        return result;
    }

    /**
     * Highlight Enigma
     * This is only possible if we're passing through non-alphabet characters.
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
        if (args[13] === false) {
            return pos;
        }
    }

    /**
     * Highlight Enigma in reverse
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightReverse(pos, args) {
        if (args[13] === false) {
            return pos;
        }
    }
}

export default Enigma;
