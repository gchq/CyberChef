/**
 * Emulation of the Bombe machine.
 *
 * @author s2224834
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import {BombeMachine} from "../lib/Bombe";
import {ROTORS, ROTORS_FOURTH, REFLECTORS, Reflector} from "../lib/Enigma";

/**
 * Bombe operation
 */
class Bombe extends Operation {
    /**
     * Bombe constructor
     */
    constructor() {
        super();

        this.name = "Bombe";
        this.module = "Default";
        this.description = "Emulation of the Bombe machine used to attack Enigma.<br><br>To run this you need to have a 'crib', which is some known plaintext for a chunk of the target ciphertext, and know the rotors used. (See the 'Bombe (multiple runs)' operation if you don't know the rotors.) The machine will suggest possible configurations of the Enigma. Each suggestion has the rotor start positions (left to right) and known plugboard pairs.<br><br>Choosing a crib: First, note that Enigma cannot encrypt a letter to itself, which allows you to rule out some positions for possible cribs. Secondly, the Bombe does not simulate the Enigma's middle rotor stepping. The longer your crib, the more likely a step happened within it, which will prevent the attack working. However, other than that, longer cribs are generally better. The attack produces a 'menu' which maps ciphertext letters to plaintext, and the goal is to produce 'loops': for example, with ciphertext ABC and crib CAB, we have the mappings A&lt;-&gt;C, B&lt;-&gt;A, and C&lt;-&gt;B, which produces a loop A-B-C-A. The more loops, the better the crib. The operation will output this: if your menu has too few loops, a large number of incorrect outputs will be produced. Try a different crib. If the menu seems good but the right answer isn't produced, your crib may be wrong, or you may have overlapped the middle rotor stepping - try a different crib.<br><br>Output is not sufficient to fully decrypt the data. You will have to recover the rest of the plugboard settings by inspection. And the ring position is not taken into account: this affects when the middle rotor steps. If your output is correct for a bit, and then goes wrong, adjust the ring and start position on the right-hand rotor together until the output improves. If necessary, repeat for the middle rotor.<br><br>By default this operation runs the checking machine, a manual process to verify the quality of Bombe stops, on each stop, discarding stops which fail. If you want to see how many times the hardware actually stops for a given input, disable the checking machine.";
        this.infoURL = "https://wikipedia.org/wiki/Bombe";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "1st (right-hand) rotor",
                type: "editableOption",
                value: ROTORS,
                defaultIndex: 2
            },
            {
                name: "2nd (middle) rotor",
                type: "editableOption",
                value: ROTORS,
                defaultIndex: 1
            },
            {
                name: "3rd (left-hand) rotor",
                type: "editableOption",
                value: ROTORS,
                defaultIndex: 0
            },
            {
                name: "4th (left-most, only some models) rotor",
                type: "editableOption",
                value: ROTORS_FOURTH,
                defaultIndex: 10
            },
            {
                name: "Reflector",
                type: "editableOption",
                value: REFLECTORS
            },
            {
                name: "Crib",
                type: "string",
                value: ""
            },
            {
                name: "Crib offset",
                type: "number",
                value: 0
            },
            {
                name: "Use checking machine",
                type: "boolean",
                value: true
            }
        ];
    }

    /**
     * Format and send a status update message.
     * @param {number} nLoops - Number of loops in the menu
     * @param {number} nStops - How many stops so far
     * @param {number} progress - Progress (as a float in the range 0..1)
     */
    updateStatus(nLoops, nStops, progress) {
        const msg = `Bombe run with ${nLoops} loops in menu (2+ desirable): ${nStops} stops, ${Math.floor(100 * progress)}% done`;
        self.sendStatusMessage(msg);
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const reflectorstr = args[4];
        let crib = args[5];
        const offset = args[6];
        const check = args[7];
        const rotors = [];
        for (let i=0; i<4; i++) {
            if (i === 3 && args[i] === "") {
                // No fourth rotor
                break;
            }
            let rstr = args[i];
            // The Bombe doesn't take stepping into account so we'll just ignore it here
            if (rstr.includes("<")) {
                rstr = rstr.split("<", 2)[0];
            }
            rotors.push(rstr);
        }
        if (crib.length === 0) {
            throw new OperationError("Crib cannot be empty");
        }
        if (offset < 0) {
            throw new OperationError("Offset cannot be negative");
        }
        // For symmetry with the Enigma op, for the input we'll just remove all invalid characters
        input = input.replace(/[^A-Za-z]/g, "").toUpperCase();
        crib = crib.replace(/[^A-Za-z]/g, "").toUpperCase();
        const ciphertext = input.slice(offset);
        const reflector = new Reflector(reflectorstr);
        let update;
        if (ENVIRONMENT_IS_WORKER()) {
            update = this.updateStatus;
        } else {
            update = undefined;
        }
        const bombe = new BombeMachine(rotors, reflector, ciphertext, crib, check, update);
        const result = bombe.run();
        let msg = `Bombe run on menu with ${bombe.nLoops} loops (2+ desirable). Note: Rotor positions are listed left to right and start at the beginning of the crib, and ignore stepping and the ring setting. Some plugboard settings are determined. A decryption preview starting at the beginning of the crib and ignoring stepping is also provided. Results:\n`;
        for (const [setting, stecker, decrypt] of result) {
            msg += `Stop: ${setting} (plugboard: ${stecker}): ${decrypt}\n`;
        }
        return msg;
    }
}

export default Bombe;
