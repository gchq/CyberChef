/**
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {  makeSureIsBytes, validatePublicKey} from "../lib/Bitcoin.mjs";
import JSSHA3 from "js-sha3";
import Utils from "../Utils.mjs";
import ec from "elliptic";

/**
 * Turns a public key into an ETH address.
 * @param {*} input Input, a public key in hex or bytes.
 */
function pubKeyToETHAddress(input) {
    // Ethereum addresses require uncompressed public keys.
    // We convert if the public key is compressed.
    let curKey = makeSureIsBytes(input);
    if (curKey[0] !== 0x04 || curKey.length !== 65) {
        const ecContext = ec.ec("secp256k1");
        const thisKey = ecContext.keyFromPublic(curKey);
        curKey = thisKey.getPublic(false, "hex");
    }
    const algo = JSSHA3.keccak256;
    // We need to redo the hex-> bytes transformation here because Javascript is silly.
    // sometimes what is desired is an array of ints.
    // Other times a string
    // Here, the Keccak algorithm seems to want an array of ints. (sigh)
    const result = algo(Utils.convertToByteArray(curKey, "hex").slice(1,));
    return "0x" + result.slice(-40);
}

/**
 * PublicKeyToETHStyleAddress operation
 */
class PublicKeyToETHStyleAddress extends Operation {

    /**
     * PublicKeyToETHStyleAddress constructor
     */
    constructor() {
        super();

        this.name = "Public Key To ETH Style Address";
        this.module = "Default";
        this.description = "Converts a public key (compressed or uncompressed) to an Ethereum style address.";
        this.infoURL = "https://www.freecodecamp.org/news/how-to-create-an-ethereum-wallet-address-from-a-private-key-ae72b0eee27b/";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
        this.checks = [
            {
                pattern: "^0[3|2][a-fA-F0-9]{64}$",
                flags: "",
                args: []
            },
            {
                pattern: "^04[a-fA-F0-9]{128}$",
                flags: "",
                args: []
            }

        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        // We check if input is blank.
        // If its blank or just whitespace, we don't need to bother dealing with it.
        if (input.trim().length === 0) {
            return "";
        }
        if (validatePublicKey(input) !== "") {
            return validatePublicKey(input);
        }
        return pubKeyToETHAddress(input);
    }

}

export default PublicKeyToETHStyleAddress;
