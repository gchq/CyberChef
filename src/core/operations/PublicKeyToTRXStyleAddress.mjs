/**
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {makeSureIsBytes, validatePublicKey, base58Encode, doubleSHA} from "../lib/Bitcoin.mjs";
import { fromArrayBuffer } from "crypto-api/src/encoder/array-buffer.mjs";
import {toHex} from "crypto-api/src/encoder/hex.mjs";
import JSSHA3 from "js-sha3";
import Utils from "../Utils.mjs";
import ec from "elliptic";

/**
 * Turns a public key into an ETH address.
 * @param {*} input Input, a public key in hex or bytes.
 */
function pubKeyToTRXAddress(input) {
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
    const unencodedAddress = result.slice(-40);
    const checksumHash = toHex(doubleSHA(fromArrayBuffer(Utils.convertToByteArray("41" + unencodedAddress, "hex"))));
    const finalString = "41" + unencodedAddress + checksumHash.slice(0, 8);
    const address = base58Encode(Utils.convertToByteArray(finalString, "hex"));
    return address;

}

/**
 * Public Key To TRX Style Address operation
 */
class PublicKeyToTRXStyleAddress extends Operation {

    /**
     * PublicKeyToTRXStyleAddress constructor
     */
    constructor() {
        super();

        this.name = "Public Key To TRX Style Address";
        this.module = "Default";
        this.description = "Converts a public key, (33 bytes beginning with 02 or 03 for compressed or 65 bytes beginning with 04) to a TRX style address. This involves hashing the public key using keccack-256 like Ethereum, but encoding the result using base58 encoding. ";
        this.infoURL = "https://developers.tron.network/docs/account";
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
        // We check if input is blank.
        // If its blank or just whitespace, we don't need to bother dealing with it.
        if (input.trim().length === 0) {
            return "";
        }
        if (validatePublicKey(input) !== "") {
            return validatePublicKey(input);
        }
        return pubKeyToTRXAddress(input);
    }

}

export default PublicKeyToTRXStyleAddress;
