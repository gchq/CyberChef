/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import * as OTPAuth from "otpauth";

/**
 * Generate TOTP operation
 */
class GenerateTOTP extends Operation {
    /**
     *
     */
    constructor() {
        super();
        this.name = "Generate TOTP";
        this.module = "Default";
        this.description = "The Time-based One-Time Password algorithm (TOTP) is an algorithm that computes a one-time password from a shared secret key and the current time. It has been adopted as Internet Engineering Task Force standard RFC 6238, is the cornerstone of Initiative For Open Authentication (OAUTH), and is used in a number of two-factor authentication systems. A TOTP is an HOTP where the counter is the current time.<br><br>Enter the secret as the input or leave it blank for a random secret to be generated. T0 and T1 are in seconds.";
        this.infoURL = "https://wikipedia.org/wiki/Time-based_One-time_Password_algorithm";
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
                "name": "Epoch offset (T0)",
                "type": "number",
                "value": 0
            },
            {
                "name": "Interval (T1)",
                "type": "number",
                "value": 30
            }
        ];
    }

    /**
     *
     */
    run(input, args) {
        const secretStr = new TextDecoder("utf-8").decode(input).trim();
        const secret = secretStr ? secretStr.toUpperCase().replace(/\s+/g, "") : "";

        const totp = new OTPAuth.TOTP({
            issuer: "",
            label: args[0],
            algorithm: "SHA1",
            digits: args[1],
            period: args[3],
            epoch: args[2] * 1000, // Convert seconds to milliseconds
            secret: OTPAuth.Secret.fromBase32(secret)
        });

        const uri = totp.toString();
        const code = totp.generate();

        return `URI: ${uri}\n\nPassword: ${code}`;
    }
}

export default GenerateTOTP;
