/**
 * Turns a 32 byte private key into into a secp256k1 public key.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import ec from "elliptic";
import { validatePrivateKey, makeSureIsHex} from "../lib/Bitcoin.mjs";
// import { toHex } from "crypto-api/src/encoder/hex.mjs";

// const curves = ["secp256k1", "ed25519", "curve25519", "p521", "p384", "p256", "p224", "p192"];
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

        const privKeyCheck = validatePrivateKey(input);

        if (privKeyCheck.trim().length !== 0) {
            return "Error with the input as private key. Error is:\n\t" + privKeyCheck;
        }
        const processedInput = makeSureIsHex(input);
        const ecContext = ec.ec("secp256k1");
        const key = ecContext.keyFromPrivate(processedInput);
        const pubkey = key.getPublic(args[0], "hex");

        return pubkey;
    }

}

export default PrivateECKeyToPublic;
