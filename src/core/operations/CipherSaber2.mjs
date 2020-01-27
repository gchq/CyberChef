/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import crypto from "crypto";
import Utils from "../Utils.mjs";

/**
 * CipherSaber2 operation
 */
class CipherSaber2 extends Operation {

    /**
     * CipherSaber2 constructor
     */
    constructor() {
        super();

        this.name = "CipherSaber2";
        this.module = "Crypto";
        this.description = "";
        this.infoURL = "";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.args = [
            {
                name: "Key",
                type: "string",
                value: ""
            },
            {
                name: "Rounds",
                type: "number",
                value: 20
            },
            {
                name: "Mode",
                type: "option",
                value: ["Encrypt", "Decrypt"]
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        input = new Uint8Array(input);
        const ivp = new Uint8Array(args[0].length + 10);
        ivp.set(new Uint8Array(Utils.strToByteArray(args[0])), 0);
        const result = [];
        let tempIVP;

        // Assign into initialisation vector based on cipher mode.
        if (args[2] === "Encrypt") {
            tempIVP = crypto.randomBytes(10);
            for (let m = 0; m < 10; m++)
                result.push(tempIVP[m]);
        } else {
            tempIVP = input.slice(0, 10);
            input = input.slice(10);
        }
        ivp.set(tempIVP, args[0].length);
        const state = new Array(256).fill(0);
        let j = 0, i = 0;

        // Mixing states based off of IV.
        for (let i = 0; i < 256; i++)
            state[i] = i;
        const ivpLength = ivp.length;
        for (let r = 0; r < args[1]; r ++) {
            for (let k = 0; k < 256; k++) {
                j = (j + state[k] + ivp[k % ivpLength]) % 256;
                [state[k], state[j]] = [state[j], state[k]];
            }
        }
        j = 0;
        i = 0;

        // XOR cipher with key.
        for (let x = 0; x < input.length; x++) {
            i = (++i) % 256;
            j = (j + state[i]) % 256;
            [state[i], state[j]] = [state[j], state[i]];
            const n = (state[i] + state[j]) % 256;
            result.push(state[n] ^ input[x]);
        }
        return new Uint8Array(result).buffer;
    }

}

export default CipherSaber2;
