/**
 * Emulation of the Typex machine.
 *
 * @author s2224834
 * @author The National Museum of Computing - Bombe Rebuild Project
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import OperationError from "../errors/OperationError.mjs";
import * as Enigma from "../lib/Enigma.mjs";
import Utils from "../Utils.mjs";

/**
 * A set of example Typex rotors. No Typex rotor wirings are publicly available, so these are
 * randomised.
 */
export const ROTORS = [
    { name: "Example 1", value: "MCYLPQUVRXGSAOWNBJEZDTFKHI<BFHNQUW" },
    { name: "Example 2", value: "KHWENRCBISXJQGOFMAPVYZDLTU<BFHNQUW" },
    { name: "Example 3", value: "BYPDZMGIKQCUSATREHOJNLFWXV<BFHNQUW" },
    { name: "Example 4", value: "ZANJCGDLVHIXOBRPMSWQUKFYET<BFHNQUW" },
    { name: "Example 5", value: "QXBGUTOVFCZPJIHSWERYNDAMLK<BFHNQUW" },
    { name: "Example 6", value: "BDCNWUEIQVFTSXALOGZJYMHKPR<BFHNQUW" },
    { name: "Example 7", value: "WJUKEIABMSGFTQZVCNPHORDXYL<BFHNQUW" },
    { name: "Example 8", value: "TNVCZXDIPFWQKHSJMAOYLEURGB<BFHNQUW" },
];

/**
 * An example Typex reflector. Again, randomised.
 */
export const REFLECTORS = [
    { name: "Example", value: "AN BC FG IE KD LU MH OR TS VZ WQ XJ YP" },
];

// Special character handling on Typex keyboard
const KEYBOARD = {
    Q: "1",
    W: "2",
    E: "3",
    R: "4",
    T: "5",
    Y: "6",
    U: "7",
    I: "8",
    O: "9",
    P: "0",
    A: "-",
    S: "/",
    D: "Z",
    F: "%",
    G: "X",
    H: "£",
    K: "(",
    L: ")",
    C: "V",
    B: "'",
    N: ",",
    M: ".",
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
                    if (Object.prototype.hasOwnProperty.call(KEYBOARD_REV, x)) {
                        inputMod += KEYBOARD_REV[x];
                    } else {
                        mode = false;
                        inputMod += "V" + x;
                    }
                } else {
                    if (Object.prototype.hasOwnProperty.call(KEYBOARD_REV, x)) {
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
     * @param {char} ringSetting - Ring setting of the rotor.
     * @param {char} initialPosition - The initial position of the rotor.
     */
    constructor(wiring, steps, reversed, ringSetting, initialPos) {
        let wiringMod = wiring;
        if (reversed) {
            const outMap = new Array(26);
            for (let i = 0; i < 26; i++) {
                // wiring[i] is the original output
                // Enigma.LETTERS[i] is the original input
                const input = Utils.mod(26 - Enigma.a2i(wiring[i]), 26);
                const output = Enigma.i2a(
                    Utils.mod(26 - Enigma.a2i(Enigma.LETTERS[i]), 26),
                );
                outMap[input] = output;
            }
            wiringMod = outMap.join("");
        }
        super(wiringMod, steps, ringSetting, initialPos);
    }
}

/**
 * Typex input plugboard. Based on a Rotor, because it allows arbitrary maps, not just switches
 * like the Enigma plugboard.
 * Not to be confused with the reflector plugboard.
 * This is also where the Typex's backwards input wiring is implemented - it's a bit of a hack, but
 * it means everything else continues to work like in the Enigma.
 */
export class Plugboard extends Enigma.Rotor {
    /**
     * Typex plugboard constructor.
     *
     * @param {string} wiring - 26 character string of mappings from A-Z, as per rotors, or "".
     */
    constructor(wiring) {
        // Typex input wiring is backwards vs Enigma: that is, letters enter the rotors in a
        // clockwise order, vs. Enigma's anticlockwise (or vice versa depending on which side
        // you're looking at it from). I'm doing the transform here to avoid having to rewrite
        // the Engima crypt() method in Typex as well.
        // Note that the wiring for the reflector is the same way around as Enigma, so no
        // transformation is necessary on that side.
        // We're going to achieve this by mapping the plugboard settings through an additional
        // transform that mirrors the alphabet before we pass it to the superclass.
        if (!/^[A-Z]{26}$/.test(wiring)) {
            throw new OperationError(
                "Plugboard wiring must be 26 unique uppercase letters",
            );
        }
        const reversed = "AZYXWVUTSRQPONMLKJIHGFEDCB";
        wiring = wiring.replace(/./g, (x) => {
            return reversed[Enigma.a2i(x)];
        });
        try {
            super(wiring, "", "A", "A");
        } catch (err) {
            throw new OperationError(err.message.replace("Rotor", "Plugboard"));
        }
    }

    /**
     * Transform a character through this rotor forwards.
     *
     * @param {number} c - The character.
     * @returns {number}
     */
    transform(c) {
        return Utils.mod(this.map[Utils.mod(c + this.pos, 26)] - this.pos, 26);
    }

    /**
     * Transform a character through this rotor backwards.
     *
     * @param {number} c - The character.
     * @returns {number}
     */
    revTransform(c) {
        return Utils.mod(
            this.revMap[Utils.mod(c + this.pos, 26)] - this.pos,
            26,
        );
    }
}
