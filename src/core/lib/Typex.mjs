/**
 * Emulation of the Typex machine.
 *
 * @author s2224834
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import OperationError from "../errors/OperationError";
import * as Enigma from "../lib/Enigma";
import Utils from "../Utils";

export const ROTORS = [
    {name: "1", value: "QWECYJIBFKMLTVZPOHUDGNRSXA<ACEINQTVY"},
    {name: "2", value: "AJDKSIRUXBLHWTMCQGZNPYFVOE<ACEINQTVY"},
    {name: "3", value: "BDFHJLCPRTXVZNYEIWGAKMUSQO<ACEINQTVY"},
    {name: "4", value: "ESOVPZJAYQUIRHXLNFTGKDCMWB<ACEINQTVY"},
    {name: "5", value: "VZBRGITYUPSDNHLXAWMJQOFECK<ACEINQTVY"},
    {name: "6", value: "FVPJIAOYEDRZXWGCTKUQSBNMHL<ACEINQTVY"},
    {name: "7", value: "KZGLIUCJEHADXRYWVTNSFQPMOB<ACEINQTVY"},
    {name: "8", value: "ZLVGOIFTYWUEPMABNCXRQSDKHJ<ACEINQTVY"},
];

export const REFLECTORS = [
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
export class TypexMachine extends Enigma.EnigmaBase {
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
export class Rotor extends Enigma.Rotor {
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
export class Plugboard extends Enigma.Rotor {
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
