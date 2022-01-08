/**
 * @author hellodword
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import totp from "totp-generator";

/**
 * Generate TOTP Code operation
 */
class GenerateTOTPCode extends Operation {

    /**
     * GenerateTOTPCode constructor
     */
    constructor() {
        super();

        this.name = "Generate TOTP Code";
        this.module = "Default";
        this.description = "The Time-based One-Time Password algorithm (TOTP) is an algorithm that computes a one-time password from a shared secret key and the current time. It has been adopted as Internet Engineering Task Force standard RFC 6238, is the cornerstone of Initiative For Open Authentication (OAUTH), and is used in a number of two-factor authentication systems. A TOTP is an HOTP where the counter is the current time.<br><br>Enter the Secret to generate a TOTP code. Timestamp is in milliseconds.";
        this.infoURL = "https://wikipedia.org/wiki/Time-based_One-time_Password_algorithm";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                "name": "Secret",
                "type": "string",
                "value": ""
            },
            {
                "name": "Algorithm",
                "type": "editableOption",
                "value": [
                    {
                        name: "SHA-1",
                        value: "SHA-1",
                    },
                    {
                        name: "SHA-512",
                        value: "SHA-512",
                    },
                ]
            },
            {
                "name": "Period",
                "type": "number",
                "value": 30
            },
            {
                "name": "Digits",
                "type": "number",
                "value": 6
            },
            {
                "name": "Timestamp",
                "type": "number",
                "value": 0
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     *
     * @throws {OperationError} if invalid secret
     */
    run(input, args) {
        const secret = args[0];
        if (secret.length === 0) {
            throw new OperationError(`Invalid Secret`);
        }
        const token = totp(secret, {
            algorithm: args[1],
            period: args[2],
            digits: args[3],
            timestamp: args[4] === 0 ? +new Date() : args[4],
        });
        return token;
    }

}

export default GenerateTOTPCode;
