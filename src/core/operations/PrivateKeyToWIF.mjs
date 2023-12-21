/**
 * Turns a 32 byte private key into Wallet-Import-Format
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { base58Encode, getWIFVersionByte, doubleSHA} from "../lib/Bitcoin.mjs";
import { fromArrayBuffer } from "crypto-api/src/encoder/array-buffer.mjs";
import {toHex} from "crypto-api/src/encoder/hex.mjs";
import {toHex as toHexOther} from "../lib/Hex.mjs";
import Utils from "../Utils.mjs";


/**
 * Converts a private key to the WIF format.
 */
class PrivateKeyToWIF extends Operation {

    /**
     * Converts a private key to the WIF format.
    */
    constructor() {
        super();

        this.name = "To WIF Format";
        this.module = "Default";
        this.description = "Turns a 32 bye private key into a WIF format key. Options include if the key should produce a compressed or uncompressed public key";
        this.inputType = "string";
        this.outputType = "string";
        this.infoURL = "https://en.bitcoin.it/wiki/Wallet_import_format";
        this.args = [
            {
                "name": "Currency Type",
                "type": "option",
                "value": ["BTC", "Testnet"]
            },
            {
                "name": "Compressed",
                "type": "boolean",
                "value": true
            }
        ];
        this.checks = [
            {
                "pattern": "^[0-9a-fA-F]{64}$",
                "flags": "",
                "args": ["BTC", true]
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
        // We check to see if the input is hex or not.
        // If it is not, we convert it back to hex
        const re = /[0-9A-Fa-f]{2,}/g;
        if (!(input.length === 64 && re.test(input)) && !(input.length === 32)) {
            return "Must pass a hex string of length 64, or a byte string of length 32. Got length: " + input.length;
        }
        if (input.length === 32) {
            const buf = new Uint8Array(new ArrayBuffer(32));

            for (let i= 0; i < 32; i ++) {
                if (input.charCodeAt(i) > 255) {
                    return "Cannot interpret this 32 character string as bytes.";
                }
                buf[i] = input.charCodeAt(i);
            }
            input = toHexOther(buf, "", 2, "", 0);
        }

        const versionByte = getWIFVersionByte(args[0]);
        let extendedPrivateKey = versionByte + input;
        if (args[1]) {
            extendedPrivateKey += "01";
        }

        const checksumHash = toHex(doubleSHA(fromArrayBuffer(Utils.convertToByteArray(extendedPrivateKey, "hex"))));
        const finalString = extendedPrivateKey + checksumHash.slice(0, 8);
        const wifKey = base58Encode(Utils.convertToByteArray(finalString, "hex"));
        return wifKey;

    }

}

export default PrivateKeyToWIF;
