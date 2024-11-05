/**
 * @author git-commit-amen [daniel@danielwallace.com.au]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import CryptoJS from "crypto-js";

/**
 * Generate SSHA Hash operation
 */
class GenerateSSHAHash extends Operation {

    /**
     * GenerateSSHAHash constructor
     */
    constructor() {
        super();

        this.name = "Generate SSHA Hash";
        this.module = "Crypto";
        this.description = "Generates an RFC 2307-compliant, cryptographically-secure SSHA (Salted SHA1) password hash - commonly used for storing passwords in systems such as OpenLDAP.";
        this.infoURL = "https://www.openldap.org/faq/data/cache/347.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (!input) return "";

        const salt = CryptoJS.lib.WordArray.random(128/8).toString().substr(0, 4);
        const hash = CryptoJS.SHA1(input + salt);
        const result = CryptoJS.enc.Latin1.parse(hash.toString(CryptoJS.enc.Latin1) + salt).toString(CryptoJS.enc.Base64);
        return `{SSHA}${result}`;
    }

}

export default GenerateSSHAHash;
