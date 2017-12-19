import otp from "otp";
import Base64 from "./Base64.js";


/**
 * One-Time Password operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 *
 * @namespace
 */
const OTP = {

    /**
     * Generate TOTP operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runTOTP: function(input, args) {
        const otpObj = otp({
            name: args[0],
            keySize: args[1],
            codeLength: args[2],
            secret: Base64.runTo32(input, []),
            epoch: args[3],
            timeSlice: args[4]
        });
        return `URI: ${otpObj.totpURL}\n\nPassword: ${otpObj.totp()}`;
    },


    /**
     * Generate HOTP operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runHOTP: function(input, args) {
        const otpObj = otp({
            name: args[0],
            keySize: args[1],
            codeLength: args[2],
            secret: Base64.runTo32(input, []),
        });
        const counter = args[3];
        return `URI: ${otpObj.hotpURL}\n\nPassword: ${otpObj.hotp(counter)}`;
    },

};

export default OTP;
