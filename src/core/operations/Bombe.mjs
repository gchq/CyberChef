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
import {ROTORS, ROTORS_OPTIONAL, REFLECTORS, Reflector} from "../lib/Enigma";

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
        this.description = "";
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
                name: "2nd rotor",
                type: "editableOption",
                value: ROTORS,
                defaultIndex: 1
            },
            {
                name: "3rd rotor",
                type: "editableOption",
                value: ROTORS,
                defaultIndex: 0
            },
            {
                name: "4th rotor",
                type: "editableOption",
                value: ROTORS_OPTIONAL,
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
                name: "Offset",
                type: "number",
                value: 0
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const reflectorstr = args[4];
        const crib = args[5];
        const offset = args[6];
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
        input = input.replace(/[^A-Za-z]/g, "");
        const ciphertext = input.slice(offset, offset+crib.length);
        const reflector = new Reflector(reflectorstr);
        let update;
        try {
            update = self.sendStatusMessage;
        } catch (e) {
            // Happens when running headless
            update = undefined;
        }
        const bombe = new BombeMachine(rotors, reflector, ciphertext, crib, update);
        const result = bombe.run();
        let msg = `Bombe run on menu with ${bombe.nLoops} loops (2+ desirable). Note: Rotor positions are listed left to right and start at the beginning of the crib, and ignore stepping and the ring setting. One stecker pair is determined. Results:\n`;
        for (const [setting, wires] of result) {
            msg += `Stop: ${setting} (${wires})\n`;
        }
        return msg;
    }
}

export default Bombe;
