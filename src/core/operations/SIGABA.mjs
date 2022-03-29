/**
 * Emulation of the SIGABA machine.
 *
 * @author hettysymes
 * @copyright hettysymes 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {LETTERS} from "../lib/Enigma.mjs";
import {NUMBERS, CR_ROTORS, I_ROTORS, SigabaMachine, CRRotor, IRotor} from "../lib/SIGABA.mjs";

/**
 * Sigaba operation
 */
class Sigaba extends Operation {

    /**
     * Sigaba constructor
     */
    constructor() {
        super();

        this.name = "SIGABA";
        this.module = "Bletchley";
        this.description = "Encipher/decipher with the WW2 SIGABA machine. <br><br>SIGABA, otherwise known as ECM Mark II, was used by the United States for message encryption during WW2 up to the 1950s. It was developed in the 1930s by the US Army and Navy, and has up to this day never been broken. Consisting of 15 rotors: 5 cipher rotors and 10 rotors (5 control rotors and 5 index rotors) controlling the stepping of the cipher rotors, the rotor stepping for SIGABA is much more complex than other rotor machines of its time, such as Enigma. All example rotor wirings are random example sets.<br><br>To configure rotor wirings, for the cipher and control rotors enter a string of letters which map from A to Z, and for the index rotors enter a sequence of numbers which map from 0 to 9. Note that encryption is not the same as decryption, so first choose the desired mode. <br><br> Note: Whilst this has been tested against other software emulators, it has not been tested against hardware.";
        this.infoURL = "https://wikipedia.org/wiki/SIGABA";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "1st (left-hand) cipher rotor",
                type: "editableOption",
                value: CR_ROTORS,
                defaultIndex: 0
            },
            {
                name: "1st cipher rotor reversed",
                type: "boolean",
                value: false
            },
            {
                name: "1st cipher rotor intial value",
                type: "option",
                value: LETTERS
            },
            {
                name: "2nd cipher rotor",
                type: "editableOption",
                value: CR_ROTORS,
                defaultIndex: 0
            },
            {
                name: "2nd cipher rotor reversed",
                type: "boolean",
                value: false
            },
            {
                name: "2nd cipher rotor intial value",
                type: "option",
                value: LETTERS
            },
            {
                name: "3rd (middle) cipher rotor",
                type: "editableOption",
                value: CR_ROTORS,
                defaultIndex: 0
            },
            {
                name: "3rd cipher rotor reversed",
                type: "boolean",
                value: false
            },
            {
                name: "3rd cipher rotor intial value",
                type: "option",
                value: LETTERS
            },
            {
                name: "4th cipher rotor",
                type: "editableOption",
                value: CR_ROTORS,
                defaultIndex: 0
            },
            {
                name: "4th cipher rotor reversed",
                type: "boolean",
                value: false
            },
            {
                name: "4th cipher rotor intial value",
                type: "option",
                value: LETTERS
            },
            {
                name: "5th (right-hand) cipher rotor",
                type: "editableOption",
                value: CR_ROTORS,
                defaultIndex: 0
            },
            {
                name: "5th cipher rotor reversed",
                type: "boolean",
                value: false
            },
            {
                name: "5th cipher rotor intial value",
                type: "option",
                value: LETTERS
            },
            {
                name: "1st (left-hand) control rotor",
                type: "editableOption",
                value: CR_ROTORS,
                defaultIndex: 0
            },
            {
                name: "1st control rotor reversed",
                type: "boolean",
                value: false
            },
            {
                name: "1st control rotor intial value",
                type: "option",
                value: LETTERS
            },
            {
                name: "2nd control rotor",
                type: "editableOption",
                value: CR_ROTORS,
                defaultIndex: 0
            },
            {
                name: "2nd control rotor reversed",
                type: "boolean",
                value: false
            },
            {
                name: "2nd control rotor intial value",
                type: "option",
                value: LETTERS
            },
            {
                name: "3rd (middle) control rotor",
                type: "editableOption",
                value: CR_ROTORS,
                defaultIndex: 0
            },
            {
                name: "3rd control rotor reversed",
                type: "boolean",
                value: false
            },
            {
                name: "3rd control rotor intial value",
                type: "option",
                value: LETTERS
            },
            {
                name: "4th control rotor",
                type: "editableOption",
                value: CR_ROTORS,
                defaultIndex: 0
            },
            {
                name: "4th control rotor reversed",
                type: "boolean",
                value: false
            },
            {
                name: "4th control rotor intial value",
                type: "option",
                value: LETTERS
            },
            {
                name: "5th (right-hand) control rotor",
                type: "editableOption",
                value: CR_ROTORS,
                defaultIndex: 0
            },
            {
                name: "5th control rotor reversed",
                type: "boolean",
                value: false
            },
            {
                name: "5th control rotor intial value",
                type: "option",
                value: LETTERS
            },
            {
                name: "1st (left-hand) index rotor",
                type: "editableOption",
                value: I_ROTORS,
                defaultIndex: 0
            },
            {
                name: "1st index rotor intial value",
                type: "option",
                value: NUMBERS
            },
            {
                name: "2nd index rotor",
                type: "editableOption",
                value: I_ROTORS,
                defaultIndex: 0
            },
            {
                name: "2nd index rotor intial value",
                type: "option",
                value: NUMBERS
            },
            {
                name: "3rd (middle) index rotor",
                type: "editableOption",
                value: I_ROTORS,
                defaultIndex: 0
            },
            {
                name: "3rd index rotor intial value",
                type: "option",
                value: NUMBERS
            },
            {
                name: "4th index rotor",
                type: "editableOption",
                value: I_ROTORS,
                defaultIndex: 0
            },
            {
                name: "4th index rotor intial value",
                type: "option",
                value: NUMBERS
            },
            {
                name: "5th (right-hand) index rotor",
                type: "editableOption",
                value: I_ROTORS,
                defaultIndex: 0
            },
            {
                name: "5th index rotor intial value",
                type: "option",
                value: NUMBERS
            },
            {
                name: "SIGABA mode",
                type: "option",
                value: ["Encrypt", "Decrypt"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const sigabaSwitch = args[40];
        const cipherRotors = [];
        const controlRotors = [];
        const indexRotors = [];
        for (let i=0; i<5; i++) {
            const rotorWiring = args[i*3];
            cipherRotors.push(new CRRotor(rotorWiring, args[i*3+2], args[i*3+1]));
        }
        for (let i=5; i<10; i++) {
            const rotorWiring = args[i*3];
            controlRotors.push(new CRRotor(rotorWiring, args[i*3+2], args[i*3+1]));
        }
        for (let i=15; i<20; i++) {
            const rotorWiring = args[i*2];
            indexRotors.push(new IRotor(rotorWiring, args[i*2+1]));
        }
        const sigaba = new SigabaMachine(cipherRotors, controlRotors, indexRotors);
        let result;
        if (sigabaSwitch === "Encrypt") {
            result = sigaba.encrypt(input);
        } else if (sigabaSwitch === "Decrypt") {
            result = sigaba.decrypt(input);
        }
        return result;
    }

}
export default Sigaba;
