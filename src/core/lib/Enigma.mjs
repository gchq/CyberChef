/**
 * Emulation of the Enigma machine.
 *
 * @author s2224834
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";

/**
 * Provided default Enigma rotor set.
 * These are specified as a list of mappings from the letters A through Z in order, optionally
 * followed by < and a list of letters at which the rotor steps.
 */
export const ROTORS = [
    { name: "I", value: "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R" },
    { name: "II", value: "AJDKSIRUXBLHWTMCQGZNPYFVOE<F" },
    { name: "III", value: "BDFHJLCPRTXVZNYEIWGAKMUSQO<W" },
    { name: "IV", value: "ESOVPZJAYQUIRHXLNFTGKDCMWB<K" },
    { name: "V", value: "VZBRGITYUPSDNHLXAWMJQOFECK<A" },
    { name: "VI", value: "JPGVOUMFYQBENHZRDKASXLICTW<AN" },
    { name: "VII", value: "NZJHGRCXMYSWBOUFAIVLPEKQDT<AN" },
    { name: "VIII", value: "FKQHTLXOCBJSPDZRAMEWNIUYGV<AN" },
];

export const ROTORS_FOURTH = [
    { name: "Beta", value: "LEYJVCNIXWPBQMDRTAKZGFUHOS" },
    { name: "Gamma", value: "FSOKANUERHMBTIYCWLQPZXVGJD" },
];

/**
 * Provided default Enigma reflector set.
 * These are specified as 13 space-separated transposed pairs covering every letter.
 */
export const REFLECTORS = [
    { name: "B", value: "AY BR CU DH EQ FS GL IP JX KN MO TZ VW" },
    { name: "C", value: "AF BV CP DJ EI GO HY KR LZ MX NW TQ SU" },
    { name: "B Thin", value: "AE BN CK DQ FU GY HW IJ LO MP RX SZ TV" },
    { name: "C Thin", value: "AR BD CO EJ FN GT HK IV LM PW QZ SX UY" },
];

export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * Map a letter to a number in 0..25.
 *
 * @param {char} c
 * @param {boolean} permissive - Case insensitive; don't throw errors on other chars.
 * @returns {number}
 */
export function a2i(c, permissive = false) {
    const i = Utils.ord(c);
    if (i >= 65 && i <= 90) {
        return i - 65;
    }
    if (permissive) {
        // Allow case insensitivity
        if (i >= 97 && i <= 122) {
            return i - 97;
        }
        return -1;
    }
    throw new OperationError("a2i called on non-uppercase ASCII character");
}

/**
 * Map a number in 0..25 to a letter.
 *
 * @param {number} i
 * @returns {char}
 */
export function i2a(i) {
    if (i >= 0 && i < 26) {
        return Utils.chr(i + 65);
    }
    throw new OperationError("i2a called on value outside 0..25");
}

/**
 * A rotor in the Enigma machine.
 */
export class Rotor {
    /**
     * Rotor constructor.
     *
     * @param {string} wiring - A 26 character string of the wiring order.
     * @param {string} steps - A 0..26 character string of stepping points.
     * @param {char} ringSetting - The ring setting.
     * @param {char} initialPosition - The initial position of the rotor.
     */
    constructor(wiring, steps, ringSetting, initialPosition) {
        if (!/^[A-Z]{26}$/.test(wiring)) {
            throw new OperationError(
                "Rotor wiring must be 26 unique uppercase letters",
            );
        }
        if (!/^[A-Z]{0,26}$/.test(steps)) {
            throw new OperationError(
                "Rotor steps must be 0-26 unique uppercase letters",
            );
        }
        if (!/^[A-Z]$/.test(ringSetting)) {
            throw new OperationError(
                "Rotor ring setting must be exactly one uppercase letter",
            );
        }
        if (!/^[A-Z]$/.test(initialPosition)) {
            throw new OperationError(
                "Rotor initial position must be exactly one uppercase letter",
            );
        }
        this.map = new Array(26);
        this.revMap = new Array(26);
        const uniq = {};
        for (let i = 0; i < LETTERS.length; i++) {
            const a = a2i(LETTERS[i]);
            const b = a2i(wiring[i]);
            this.map[a] = b;
            this.revMap[b] = a;
            uniq[b] = true;
        }
        if (Object.keys(uniq).length !== LETTERS.length) {
            throw new OperationError(
                "Rotor wiring must have each letter exactly once",
            );
        }
        const rs = a2i(ringSetting);
        this.steps = new Set();
        for (const x of steps) {
            this.steps.add(Utils.mod(a2i(x) - rs, 26));
        }
        if (this.steps.size !== steps.length) {
            // This isn't strictly fatal, but it's probably a mistake
            throw new OperationError("Rotor steps must be unique");
        }
        this.pos = Utils.mod(a2i(initialPosition) - rs, 26);
    }

    /**
     * Step the rotor forward by one.
     */
    step() {
        this.pos = Utils.mod(this.pos + 1, 26);
        return this.pos;
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

/**
 * Base class for plugboard and reflector (since these do effectively the same
 * thing).
 */
class PairMapBase {
    /**
     * PairMapBase constructor.
     *
     * @param {string} pairs - A whitespace separated string of letter pairs to swap.
     * @param {string} [name='PairMapBase'] - For errors, the name of this object.
     */
    constructor(pairs, name = "PairMapBase") {
        // I've chosen to make whitespace significant here to make a) code and
        // b) inputs easier to read
        this.pairs = pairs;
        this.map = {};
        if (pairs === "") {
            return;
        }
        pairs.split(/\s+/).forEach((pair) => {
            if (!/^[A-Z]{2}$/.test(pair)) {
                throw new OperationError(
                    name +
                        " must be a whitespace-separated list of uppercase letter pairs",
                );
            }
            const a = a2i(pair[0]),
                b = a2i(pair[1]);
            if (a === b) {
                // self-stecker
                return;
            }
            if (Object.prototype.hasOwnProperty.call(this.map, a)) {
                throw new OperationError(
                    `${name} connects ${pair[0]} more than once`,
                );
            }
            if (Object.prototype.hasOwnProperty.call(this.map, b)) {
                throw new OperationError(
                    `${name} connects ${pair[1]} more than once`,
                );
            }
            this.map[a] = b;
            this.map[b] = a;
        });
    }

    /**
     * Transform a character through this object.
     * Returns other characters unchanged.
     *
     * @param {number} c - The character.
     * @returns {number}
     */
    transform(c) {
        if (!Object.prototype.hasOwnProperty.call(this.map, c)) {
            return c;
        }
        return this.map[c];
    }

    /**
     * Alias for transform, to allow interchangeable use with rotors.
     *
     * @param {number} c - The character.
     * @returns {number}
     */
    revTransform(c) {
        return this.transform(c);
    }
}

/**
 * Reflector. PairMapBase but requires that all characters are accounted for.
 *
 * Includes a couple of optimisations on that basis.
 */
export class Reflector extends PairMapBase {
    /**
     * Reflector constructor. See PairMapBase.
     * Additional restriction: every character must be accounted for.
     */
    constructor(pairs) {
        super(pairs, "Reflector");
        const s = Object.keys(this.map).length;
        if (s !== 26) {
            throw new OperationError(
                "Reflector must have exactly 13 pairs covering every letter",
            );
        }
        const optMap = new Array(26);
        for (const x of Object.keys(this.map)) {
            optMap[x] = this.map[x];
        }
        this.map = optMap;
    }

    /**
     * Transform a character through this object.
     *
     * @param {number} c - The character.
     * @returns {number}
     */
    transform(c) {
        return this.map[c];
    }
}

/**
 * Plugboard. Unmodified PairMapBase.
 */
export class Plugboard extends PairMapBase {
    /**
     * Plugboard constructor. See PairMapbase.
     */
    constructor(pairs) {
        super(pairs, "Plugboard");
    }
}

/**
 * Base class for the Enigma machine itself. Holds rotors, a reflector, and a plugboard.
 */
export class EnigmaBase {
    /**
     * EnigmaBase constructor.
     *
     * @param {Object[]} rotors - List of Rotors.
     * @param {Object} reflector - A Reflector.
     * @param {Plugboard} plugboard - A Plugboard.
     */
    constructor(rotors, reflector, plugboard) {
        this.rotors = rotors;
        this.rotorsRev = [].concat(rotors).reverse();
        this.reflector = reflector;
        this.plugboard = plugboard;
    }

    /**
     * Step the rotors forward by one.
     *
     * This happens before the output character is generated.
     *
     * Note that rotor 4, if it's there, never steps.
     *
     * Why is all the logic in EnigmaBase and not a nice neat method on
     * Rotor that knows when it should advance the next item?
     * Because the double stepping anomaly is a thing. tl;dr if the left rotor
     * should step the next time the middle rotor steps, the middle rotor will
     * immediately step.
     */
    step() {
        const r0 = this.rotors[0];
        const r1 = this.rotors[1];
        r0.step();
        // The second test here is the double-stepping anomaly
        if (r0.steps.has(r0.pos) || r1.steps.has(Utils.mod(r1.pos + 1, 26))) {
            r1.step();
            if (r1.steps.has(r1.pos)) {
                const r2 = this.rotors[2];
                r2.step();
            }
        }
    }

    /**
     * Encrypt (or decrypt) some data.
     * Takes an arbitrary string and runs the Engima machine on that data from
     * *its current state*, and outputs the result. Non-alphabetic characters
     * are returned unchanged.
     *
     * @param {string} input - Data to encrypt.
     * @returns {string}
     */
    crypt(input) {
        let result = "";
        for (const c of input) {
            let letter = a2i(c, true);
            if (letter === -1) {
                result += c;
                continue;
            }
            // First, step the rotors forward.
            this.step();
            // Now, run through the plugboard.
            letter = this.plugboard.transform(letter);
            // Then through each wheel in sequence, through the reflector, and
            // backwards through the wheels again.
            for (const rotor of this.rotors) {
                letter = rotor.transform(letter);
            }
            letter = this.reflector.transform(letter);
            for (const rotor of this.rotorsRev) {
                letter = rotor.revTransform(letter);
            }
            // Finally, back through the plugboard.
            letter = this.plugboard.revTransform(letter);
            result += i2a(letter);
        }
        return result;
    }
}

/**
 * The Enigma machine itself. Holds 3-4 rotors, a reflector, and a plugboard.
 */
export class EnigmaMachine extends EnigmaBase {
    /**
     * EnigmaMachine constructor.
     *
     * @param {Object[]} rotors - List of Rotors.
     * @param {Object} reflector - A Reflector.
     * @param {Plugboard} plugboard - A Plugboard.
     */
    constructor(rotors, reflector, plugboard) {
        super(rotors, reflector, plugboard);
        if (rotors.length !== 3 && rotors.length !== 4) {
            throw new OperationError("Enigma must have 3 or 4 rotors");
        }
    }
}
