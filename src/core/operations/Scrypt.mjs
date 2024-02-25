/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";
import scryptsy from "scryptsy";
import { isWorkerEnvironment } from "../Utils.mjs";

/**
 * Scrypt operation
 */
class Scrypt extends Operation {
    /**
     * Scrypt constructor
     */
    constructor() {
        super();

        this.name = "Scrypt";
        this.module = "Crypto";
        this.description
            = "scrypt is a password-based key derivation function (PBKDF) created by Colin Percival. The algorithm was specifically designed to make it costly to perform large-scale custom hardware attacks by requiring large amounts of memory. In 2016, the scrypt algorithm was published by IETF as RFC 7914.<br><br>Enter the password in the input to generate its hash.";
        this.infoURL = "https://wikipedia.org/wiki/Scrypt";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Salt",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "Base64", "UTF8", "Latin1"]
            },
            {
                "name": "Iterations (N)",
                "type": "number",
                "value": 16384
            },
            {
                "name": "Memory factor (r)",
                "type": "number",
                "value": 8
            },
            {
                "name": "Parallelization factor (p)",
                "type": "number",
                "value": 1
            },
            {
                "name": "Key length",
                "type": "number",
                "value": 64
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const salt = Buffer.from(Utils.convertToByteArray(args[0].string || "", args[0].option)),
            iterations = args[1],
            memFactor = args[2],
            parallelFactor = args[3],
            keyLength = args[4];

        try {
            const data = scryptsy(input, salt, iterations, memFactor, parallelFactor, keyLength, (p) => {
                // Progress callback
                if (isWorkerEnvironment()) self.sendStatusMessage(`Progress: ${p.percent.toFixed(0)}%`);
            });

            return data.toString("hex");
        } catch (err) {
            throw new OperationError("Error: " + err.toString());
        }
    }
}

export default Scrypt;
