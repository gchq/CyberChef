/**
 * Turns a 32 byte private key into into a secp256k1 public key.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {toHex} from "../lib/Hex.mjs";
import ec from "elliptic";

/**
 * Class that takes in a private key, and returns the public key, either in compressed or uncompressed form(s).
 */
class PrivateECKeyToPublic extends Operation {
    /**
     * Constructor.
     */
    constructor() {
        super();

        this.name = "Private EC Key to Public Key";
        this.module = "Default";
        this.description = "Turns a private key to the appropriate ECC public key. Right now assumes the private key is a private key to the Secp256k1 curve.";
        this.inputType = "string";
        this.outputType = "string";
        this.infoURL = "https://en.bitcoin.it/wiki/Secp256k1";
        this.args = [
            {
                "name": "Compressed",
                "type": "boolean",
                "value": true
            }
        ];
        this.checks = [
            {
                "pattern": "^[0-9A-Fa-f]{64}$",
                "flags": "",
                "args": [true]
            }
        ];

    }

    /**
     * Takes in a string, and an array of args. Interpolates the string as a private ECC Key, and attempts to construct the public key.
     * @param {string} input
     * @param {*} args
     * @returns
     */
    run(input, args) {
        // We check if input is blank.
        // If its blank or just whitespace, we don't need to bother dealing with it.
        if (input.trim().length === 0) {
            return "";
        }
        input = input.trim();
        const re = /^[0-9A-Fa-f]{2,}$/g;
        if (!(input.length === 64 && re.test(input)) && !(input.length === 32)) {
            return "Must pass a hex string of length 64, or a byte string of length 32. Got length " + input.length;
        }
        // If we have bytes, we need to turn the bytes to hex.
        if (input.length !== undefined && input.length === 32) {
            const buf = new Uint8Array(new ArrayBuffer(32));

            for (let i= 0; i < 32; i ++) {
                if (input.charCodeAt(i) > 255) {
                    return "Cannot interpret this 32 character string as bytes.";
                }
                buf[i] = input.charCodeAt(i);
            }
            input = toHex(buf, "", 2, "", 0);
        }
        const ecContext = ec.ec("secp256k1");
        const key = ecContext.keyFromPrivate(input);
        const pubkey = key.getPublic(args[0], "hex");

        return pubkey;
    }

}

export default PrivateECKeyToPublic;
