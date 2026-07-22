/**
 * Turns a 32 byte private key into into a secp256k1 public key.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import ec from "elliptic";
import { validatePrivateKey, makeSureIsHex} from "../lib/Bitcoin.mjs";

// import { toHex } from "crypto-api/src/encoder/hex.mjs";

// const curves = ["secp256k1", "ed25519", "curve25519", "p521", "p384", "p256", "p224", "p192"];
const OUTPUT_OPTIONS = ["Public Key Only", "Private,Public", "Public,Private"];

/**
 * Format the output based on the passed in option from OUTPUT_OPTIONS
 * @param {*} public_key
 * @param {*} private_key
 * @param {*} option
 * @returns
 */
function formatOutput(privateKey, publicKey, option) {
    switch (option) {
        case "Public Key Only":
            return publicKey;
        case "Private,Public":
            return privateKey+","+publicKey;
        case "Public,Private":
            return publicKey+","+privateKey;
        default:
            throw OperationError("Invalid output format option: " + option + ".");

    }
}
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
        this.description = "Turns a private key to the appropriate ECC public key. Covers secp256k1 and ed25519 curves. For secp256k1 curves we can output either compressed or uncompressed public keys. ED25519 keys are slightly different, in this case we differentiate between clamped scalar multiplication (used most often) or unclamped (less frequently used, though used in Monero addresses).";
        this.inputType = "string";
        this.outputType = "string";
        this.infoURL = "https://en.bitcoin.it/wiki/Secp256k1";
        this.args = [
            {
                "name": "Compressed/Clamped",
                "type": "boolean",
                "value": true
            },
            {
                "name": "Curve",
                "type": "option",
                "value": ["secp256k1", "ed25519"]
            },
            {
                "name": "Output Option",
                "type": "option",
                "value": OUTPUT_OPTIONS
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
            throw new OperationError("Error with the input as private key. Error is:\n\t" + privKeyCheck);
        }
        const processedInput = makeSureIsHex(input);

        if (args[1] === "secp256k1") {
            const ecContext = ec.ec("secp256k1");
            const key = ecContext.keyFromPrivate(processedInput);
            const pubkey = key.getPublic(args[0], "hex");
            return formatOutput(processedInput, pubkey, args[2]);
        } else if (args[1] === "ed25519") {
            if (args[0]) {
                const ed = new ec.eddsa("ed25519");
                const publicKeyHex = ed.keyFromSecret(processedInput).getPublic("hex");
                return formatOutput(processedInput, publicKeyHex, args[2]);
            } else {
                const ed = new ec.eddsa("ed25519");
                const scalarBytes = Buffer.from(processedInput, "hex");
                const scalar = ed.decodeInt([...scalarBytes]);
                const point = ed.g.mul(scalar);
                const encodedPoint = Buffer.from(ed.encodePoint(point));
                return encodedPoint.toString("hex");
            }
        } else {
            throw OperationError("Unexpected curve selection: " + args[1] + ".");
        }


    }

}

export default PrivateECKeyToPublic;
