/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import * as OTPAuth from "otpauth";

/**
 * Generate HOTP operation
 */
class GenerateHOTP extends Operation {
    /**
     *
     */
    constructor() {
        super();

        this.name = "Generate HOTP";
        this.module = "Default";
        this.description = "The HMAC-based One-Time Password algorithm (HOTP) is an algorithm that computes a one-time password from a shared secret key and an incrementing counter. It has been adopted as Internet Engineering Task Force standard RFC 4226, is the cornerstone of Initiative For Open Authentication (OAUTH), and is used in a number of two-factor authentication systems.<br><br>Enter the secret as the input or leave it blank for a random secret to be generated. The secret must be a valid base32 string (characters A–Z and 2–7).";
        this.infoURL = "https://wikipedia.org/wiki/HMAC-based_One-time_Password_algorithm";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                "name": "Name",
                "type": "string",
                "value": ""
            },
            {
                "name": "Code length",
                "type": "number",
                "value": 6
            },
            {
                "name": "Counter",
                "type": "number",
                "value": 0
            }
        ];
    }

    /**
     *
     */
    run(input, args) {
        const secretStr = new TextDecoder("utf-8").decode(input).trim();

        let secret;
        try {
            secret = secretStr ?
                OTPAuth.Secret.fromBase32(secretStr.toUpperCase().replace(/\s+/g, "")) :
                new OTPAuth.Secret();
        } catch {
            throw new OperationError("Invalid secret. The input must be a valid base32 string (characters A–Z and 2–7).");
        }

        const hotp = new OTPAuth.HOTP({
            issuer: "",
            label: args[0],
            algorithm: "SHA1",
            digits: args[1],
            counter: args[2],
            secret
        });

        const uri = hotp.toString();
        const code = hotp.generate();

        return `URI: ${uri}\n\nPassword: ${code}`;
    }
}

export default GenerateHOTP;
