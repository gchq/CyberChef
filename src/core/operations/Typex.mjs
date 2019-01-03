/**
 * Emulation of the Typex machine.
 *
 * @author s2224834
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import Utils from "../Utils";
import * as Enigma from "../lib/Enigma";

const ROTORS = [
    {name: "1", value: "QWECYJIBFKMLTVZPOHUDGNRSXA<ACEINQTVY"},
    {name: "2", value: "AJDKSIRUXBLHWTMCQGZNPYFVOE<ACEINQTVY"},
    {name: "3", value: "BDFHJLCPRTXVZNYEIWGAKMUSQO<ACEINQTVY"},
    {name: "4", value: "ESOVPZJAYQUIRHXLNFTGKDCMWB<ACEINQTVY"},
    {name: "5", value: "VZBRGITYUPSDNHLXAWMJQOFECK<ACEINQTVY"},
    {name: "6", value: "FVPJIAOYEDRZXWGCTKUQSBNMHL<ACEINQTVY"},
    {name: "7", value: "KZGLIUCJEHADXRYWVTNSFQPMOB<ACEINQTVY"},
    {name: "8", value: "ZLVGOIFTYWUEPMABNCXRQSDKHJ<ACEINQTVY"},
];

const REFLECTORS = [
    {name: "Standard", value: "MO VW GL JX TZ AY EQ IP KN DH CU FS BR"},
];

// Special character handling on Typex keyboard
const KEYBOARD = {
    "Q": "1", "W": "2", "E": "3", "R": "4", "T": "5", "Y": "6", "U": "7", "I": "8", "O": "9", "P": "0",
    "A": "-", "S": "/", "D": "Z", "F": "%", "G": "X", "H": "£", "K": "(", "L": ")",
    "C": "V", "B": "'", "N": ",", "M": "."
};
const KEYBOARD_REV = {};
for (const i of Object.keys(KEYBOARD)) {
    KEYBOARD_REV[KEYBOARD[i]] = i;
}

/**
 * Typex machine. A lot like the Enigma, but five rotors, of which the first two are static.
 */
class TypexMachine extends Enigma.EnigmaBase {
    /**
     * TypexMachine constructor.
     *
     * @param {Object[]} rotors - List of Rotors.
     * @param {Object} reflector - A Reflector.
     * @param {Plugboard} plugboard - A Plugboard.
     */
    constructor(rotors, reflector, plugboard, keyboard) {
        super(rotors, reflector, plugboard);
        if (rotors.length !== 5) {
            throw new OperationError("Typex must have 5 rotors");
        }
        this.keyboard = keyboard;
    }

    /**
     * This is the same as the Enigma step function, it's just that the right-
     * most two rotors are static.
     */
    step() {
        const r0 = this.rotors[2];
        const r1 = this.rotors[3];
        r0.step();
        // The second test here is the double-stepping anomaly
        if (r0.steps.has(r0.pos) || r1.steps.has(Utils.mod(r1.pos + 1, 26))) {
            r1.step();
            if (r1.steps.has(r1.pos)) {
                const r2 = this.rotors[4];
                r2.step();
            }
        }
    }

    /**
     * Encrypt/decrypt data. This is identical to the Enigma version cryptographically, but we have
     * additional handling for the Typex's keyboard (which handles various special characters by
     * mapping them to particular letter combinations).
     *
     * @param {string} input - The data to encrypt/decrypt.
     * @return {string}
     */
    crypt(input) {
        let inputMod = input;
        if (this.keyboard === "Encrypt") {
            inputMod = "";
            // true = in symbol mode
            let mode = false;
            for (const x of input) {
                if (x === " ") {
                    inputMod += "X";
                } else if (mode) {
                    if (KEYBOARD_REV.hasOwnProperty(x)) {
                        inputMod += KEYBOARD_REV[x];
                    } else {
                        mode = false;
                        inputMod += "V" + x;
                    }
                } else {
                    if (KEYBOARD_REV.hasOwnProperty(x)) {
                        mode = true;
                        inputMod += "Z" + KEYBOARD_REV[x];
                    } else {
                        inputMod += x;
                    }
                }
            }
        }

        const output = super.crypt(inputMod);

        let outputMod = output;
        if (this.keyboard === "Decrypt") {
            outputMod = "";
            let mode = false;
            for (const x of output) {
                if (x === "X") {
                    outputMod += " ";
                } else if (x === "V") {
                    mode = false;
                } else if (x === "Z") {
                    mode = true;
                } else if (mode) {
                    outputMod += KEYBOARD[x];
                } else {
                    outputMod += x;
                }
            }
        }
        return outputMod;
    }
}

/**
 * Typex rotor. Like an Enigma rotor, but no ring setting, and can be reversed.
 */
class Rotor extends Enigma.Rotor {
    /**
     * Rotor constructor.
     *
     * @param {string} wiring - A 26 character string of the wiring order.
     * @param {string} steps - A 0..26 character string of stepping points.
     * @param {bool} reversed - Whether to reverse the rotor.
     * @param {char} initialPosition - The initial position of the rotor.
     */
    constructor(wiring, steps, reversed, initialPos) {
        let initialPosMod = initialPos;
        let wiringMod = wiring;
        if (reversed) {
            initialPosMod = Enigma.i2a(Utils.mod(26 - Enigma.a2i(initialPos), 26));
            const outMap = new Array(26).fill();
            for (let i=0; i<26; i++) {
                // wiring[i] is the original output
                // Enigma.LETTERS[i] is the original input
                const input = Utils.mod(26 - Enigma.a2i(wiring[i]), 26);
                const output = Enigma.i2a(Utils.mod(26 - Enigma.a2i(Enigma.LETTERS[i]), 26));
                outMap[input] = output;
            }
            wiringMod = outMap.join("");
        }
        super(wiringMod, steps, "A", initialPosMod);
    }
}

/**
 * Typex input plugboard. Based on a Rotor, because it allows arbitrary maps, not just switches
 * like the Enigma plugboard.
 * Not to be confused with the reflector plugboard.
 */
class Plugboard extends Enigma.Rotor {
    /**
     * Typex plugboard constructor.
     *
     * @param {string} wiring - 26 character string of mappings from A-Z, as per rotors, or "".
     */
    constructor(wiring) {
        try {
            super(wiring, "", "A", "A");
        } catch (err) {
            throw new OperationError(err.message.replace("Rotor", "Plugboard"));
        }
    }
}

/**
 * Typex operation
 */
class TypexOp extends Operation {
    /**
     * Typex constructor
     */
    constructor() {
        super();

        this.name = "Typex";
        this.module = "Default";
        this.description = "Encipher/decipher with the WW2 Typex machine.<br><br>The standard set of rotors are provided. Later Typexes had a plugboard to configure the reflector: to configure this, enter a string of connected pairs of letters, e.g. <code>AB CD EF</code> connects A to B, C to D, and E to F (you'll need to connect every letter). These Typexes also have an input plugboard: unlike Enigma's plugboard, it's not restricted to pairs, so it's entered like a rotor. To create your own rotor, enter the letters that the rotor maps A to Z to, in order, optionally followed by <code>&lt;</code> then a list of stepping points.";
        this.infoURL = "https://wikipedia.org/wiki/Typex";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "1st (right-hand, static) rotor",
                type: "editableOption",
                value: ROTORS,
                defaultIndex: 4
            },
            {
                name: "1st rotor reversed",
                type: "boolean",
                value: false
            },
            {
                name: "1st rotor initial value",
                type: "option",
                value: Enigma.LETTERS
            },
            {
                name: "2nd (static) rotor",
                type: "editableOption",
                value: ROTORS,
                defaultIndex: 3
            },
            {
                name: "2nd rotor reversed",
                type: "boolean",
                value: false
            },
            {
                name: "2nd rotor initial value",
                type: "option",
                value: Enigma.LETTERS
            },
            {
                name: "3rd rotor",
                type: "editableOption",
                value: ROTORS,
                defaultIndex: 2
            },
            {
                name: "3rd rotor reversed",
                type: "boolean",
                value: false
            },
            {
                name: "3rd rotor initial value",
                type: "option",
                value: Enigma.LETTERS
            },
            {
                name: "4th rotor",
                type: "editableOption",
                value: ROTORS,
                defaultIndex: 1
            },
            {
                name: "4th rotor reversed",
                type: "boolean",
                value: false
            },
            {
                name: "4th rotor initial value",
                type: "option",
                value: Enigma.LETTERS
            },
            {
                name: "5th rotor",
                type: "editableOption",
                value: ROTORS,
                defaultIndex: 0
            },
            {
                name: "5th rotor reversed",
                type: "boolean",
                value: false
            },
            {
                name: "5th rotor initial value",
                type: "option",
                value: Enigma.LETTERS
            },
            {
                name: "Reflector",
                type: "editableOption",
                value: REFLECTORS
            },
            {
                name: "Plugboard",
                type: "string",
                value: ""
            },
            {
                name: "Typex keyboard emulation",
                type: "option",
                value: ["None", "Encrypt", "Decrypt"]
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
        const reflectorstr = args[15];
        const plugboardstr = args[16];
        const typexKeyboard = args[17];
        const removeOther = args[18];
        const rotors = [];
        for (let i=0; i<5; i++) {
            const [rotorwiring, rotorsteps] = this.parseRotorStr(args[i*3]);
            rotors.push(new Rotor(rotorwiring, rotorsteps, args[i*3 + 1], args[i*3+2]));
        }
        const reflector = new Enigma.Reflector(reflectorstr);
        let plugboardstrMod = plugboardstr;
        if (plugboardstrMod === "") {
            plugboardstrMod = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        }
        const plugboard = new Plugboard(plugboardstrMod);
        if (removeOther) {
            if (typexKeyboard === "Encrypt") {
                input = input.replace(/[^A-Za-z0-9 /%£()',.-]/g, "");
            } else {
                input = input.replace(/[^A-Za-z]/g, "");
            }
        }
        const typex = new TypexMachine(rotors, reflector, plugboard, typexKeyboard);
        let result = typex.crypt(input);
        if (removeOther && typexKeyboard !== "Decrypt") {
            // Five character cipher groups is traditional
            result = result.replace(/([A-Z]{5})(?!$)/g, "$1 ");
        }
        return result;
    }

    /**
     * Highlight Typex
     * This is only possible if we're passing through non-alphabet characters.
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
        if (args[18] === false) {
            return pos;
        }
    }

    /**
     * Highlight Typex in reverse
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightReverse(pos, args) {
        if (args[18] === false) {
            return pos;
        }
    }

}

export default TypexOp;
