/**
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
// import OperationError from "../errors/OperationError.mjs";
import { b58DoubleSHAChecksum} from "../lib/Bitcoin.mjs";
import { BIP32Factory} from "bip32";
import ecc from "@bitcoinerlab/secp256k1";

/**
 * Sanity checks a derivation path.
 * @param {*} input
 */
function verifyDerivationPath(input) {
    const splitResults = input.split("/");
    let startIndex = 0;
    // We skip the first index if its m, as that's common.
    if (splitResults[0] === "m") {
        startIndex = 1;
    }
    for (let i =startIndex; i < splitResults.length; i++) {
        const re = /^[0-9]{1,}[']{0,1}$/g;
        if (!re.test(splitResults[i])) {
            return false;
        }
    }
    return true;
}

/**
 * BIP32Derive operation
 */
class BIP32Derive extends Operation {

    /**
     * BIP32Derive constructor
     */
    constructor() {
        super();

        this.name = "BIP32Derive";
        this.module = "Default";
        this.description = "Takes in an extended key, performs BIP32 key derivation on the extended key, and returns the result as an extended key.";
        this.infoURL = "https://en.bitcoin.it/wiki/BIP_0032";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Derivation Path",
                "type": "string",
                "value": ""
            },
        ];
        this.checks = [
            {
                "pattern": "^(X|x|Y|y|Z|z|L|l|T|t)[pub|prv|tbv|tub][A-HJ-NP-Za-km-z1-9]{2,}$",
                "flags": "",
                "args": []
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
        input = input.trim();
        if (!verifyDerivationPath(args[0])) {
            return "Invalid derivation path: " + args[0] + "\n";
        }
        const xkeyRe = /^(X|x|Y|y|Z|z|L|l|T|t)[pub|prv|tbv|tub][A-HJ-NP-Za-km-z1-9]{2,}$/g;
        if (!b58DoubleSHAChecksum(input) || !xkeyRe.test(input)) {
            return "Possibly invalid Extended Key: " + input + "\n";
        }
        const bip32 = BIP32Factory(ecc);
        const node = bip32.fromBase58(input);
        const child = node.derivePath(args[0]);
        return child.toBase58();
    }

}

export default BIP32Derive;
