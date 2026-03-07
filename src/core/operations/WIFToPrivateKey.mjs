/**
 * Extracts the private key from a WIF format key.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { base58Decode, b58DoubleSHAChecksum} from "../lib/Bitcoin.mjs";
import { fromArrayBuffer } from "crypto-api/src/encoder/array-buffer.mjs";
import {toHex} from "crypto-api/src/encoder/hex.mjs";


/**
 * Converts a private key to the WIF format.
 */
class WIFToPrivateKey extends Operation {

    /**
     * Converts a private key to the WIF format.
     */
    constructor() {
        super();

        this.name = "From WIF Format";
        this.module = "Default";
        this.description = "Turns a WIF format cryptocurrency key into the 32 byte private key. ";
        this.inputType = "string";
        this.outputType = "string";
        this.infoURL = "https://en.bitcoin.it/wiki/Wallet_import_format";
        this.args = [
        ];
        this.checks = [
            {
                "pattern": "^5[HJK][a-km-zA-HJ-NP-Z1-9]{49}$",
                "flags": "",
                "args": []
            },
            {
                "pattern": "^[KL][a-km-zA-HJ-NP-Z1-9]{51}$",
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
        if (b58DoubleSHAChecksum(input)) {
            const decoded = base58Decode(input);
            const trimmed = toHex(fromArrayBuffer(decoded.slice(1, -4)));
            if (trimmed.endsWith("01") && trimmed.length === 66) {
                return trimmed.slice(0, -2);
            } else {
                return trimmed;
            }
        } else {
            return "Invalid Checksum. May not be a private Key. ";
        }

    }

}

export default WIFToPrivateKey;
