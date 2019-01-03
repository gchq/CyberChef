/**
 * Emulation of the Enigma machine.
 *
 * @author s2224834
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import * as Enigma from "../lib/Enigma";

/**
 * Enigma operation
 */
class EnigmaOp extends Operation {
    /**
     * Enigma constructor
     */
    constructor() {
        super();

        this.name = "Enigma";
        this.module = "Default";
        this.description = "Encipher/decipher with the WW2 Enigma machine.<br><br>The standard set of German military rotors and reflectors are provided. To configure the plugboard, enter a string of connected pairs of letters, e.g. <code>AB CD EF</code> connects A to B, C to D, and E to F. This is also used to create your own reflectors. To create your own rotor, enter the letters that the rotor maps A to Z to, in order, optionally followed by <code>&lt;</code> then a list of stepping points.<br>This is deliberately fairly permissive with rotor placements etc compared to a real Enigma (on which, for example, a four-rotor Enigma uses the thin reflectors and the beta or gamma rotor in the 4th slot).";
        this.infoURL = "https://wikipedia.org/wiki/Enigma_machine";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "1st (right-hand) rotor",
                type: "editableOption",
                value: Enigma.ROTORS,
                // Default config is the rotors I-III *left to right*
                defaultIndex: 2
            },
            {
                name: "1st rotor ring setting",
                type: "option",
                value: Enigma.LETTERS
            },
            {
                name: "1st rotor initial value",
                type: "option",
                value: Enigma.LETTERS
            },
            {
                name: "2nd rotor",
                type: "editableOption",
                value: Enigma.ROTORS,
                defaultIndex: 1
            },
            {
                name: "2nd rotor ring setting",
                type: "option",
                value: Enigma.LETTERS
            },
            {
                name: "2nd rotor initial value",
                type: "option",
                value: Enigma.LETTERS
            },
            {
                name: "3rd rotor",
                type: "editableOption",
                value: Enigma.ROTORS,
                defaultIndex: 0
            },
            {
                name: "3rd rotor ring setting",
                type: "option",
                value: Enigma.LETTERS
            },
            {
                name: "3rd rotor initial value",
                type: "option",
                value: Enigma.LETTERS
            },
            {
                name: "4th rotor",
                type: "editableOption",
                value: Enigma.ROTORS_OPTIONAL,
                defaultIndex: 10
            },
            {
                name: "4th rotor initial value",
                type: "option",
                value: Enigma.LETTERS
            },
            {
                name: "Reflector",
                type: "editableOption",
                value: Enigma.REFLECTORS
            },
            {
                name: "Plugboard",
                type: "string",
                value: ""
            },
            {
                name: "Strict output",
                hint: "Remove non-alphabet letters and group output",
                type: "boolean",
                value: true
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
        const [
            rotor1str, rotor1ring, rotor1pos,
            rotor2str, rotor2ring, rotor2pos,
            rotor3str, rotor3ring, rotor3pos,
            rotor4str, rotor4pos,
            reflectorstr, plugboardstr,
            removeOther
        ] = args;
        const rotors = [];
        const [rotor1wiring, rotor1steps] = this.parseRotorStr(rotor1str, 1);
        rotors.push(new Enigma.Rotor(rotor1wiring, rotor1steps, rotor1ring, rotor1pos));
        const [rotor2wiring, rotor2steps] = this.parseRotorStr(rotor2str, 2);
        rotors.push(new Enigma.Rotor(rotor2wiring, rotor2steps, rotor2ring, rotor2pos));
        const [rotor3wiring, rotor3steps] = this.parseRotorStr(rotor3str, 3);
        rotors.push(new Enigma.Rotor(rotor3wiring, rotor3steps, rotor3ring, rotor3pos));
        if (rotor4str !== "") {
            // Fourth rotor doesn't have a ring setting - A is equivalent to no setting
            const [rotor4wiring, rotor4steps] = this.parseRotorStr(rotor4str, 4);
            rotors.push(new Enigma.Rotor(rotor4wiring, rotor4steps, "A", rotor4pos));
        }
        const reflector = new Enigma.Reflector(reflectorstr);
        const plugboard = new Enigma.Plugboard(plugboardstr);
        if (removeOther) {
            input = input.replace(/[^A-Za-z]/g, "");
        }
        const enigma = new Enigma.EnigmaMachine(rotors, reflector, plugboard);
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

export default EnigmaOp;
