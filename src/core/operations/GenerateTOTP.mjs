/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import otp from "otp";

/**
 * Generate TOTP operation
 */
class GenerateTOTP extends Operation {

    /**
     * GenerateTOTP constructor
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
                "name": "Key size",
                "type": "number",
                "value": 32
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
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const secretStr = new TextDecoder("utf-8").decode(input).trim();

        // uppercase it and remove spaces. If input is empty, let otp generate a random key.
        const secret = secretStr ?
            secretStr.toUpperCase().replace(/\s+/g, "") : // e.g. "ok53 fvlf" -> "OK53FVLF"
            "";

        // Construct the OTP object. If secret is "", otp will auto-generate one.
        const otpObj = new otp({
            name: args[0],
            keySize: args[1],
            codeLength: args[2],
            secret: secret,
            epoch: args[3],
            timeSlice: args[4]
        });

        // Return TOTP URI and code
        return `URI: ${otpObj.totpURL}\n\nPassword: ${otpObj.totp()}`;
    }

}

export default GenerateTOTP;
