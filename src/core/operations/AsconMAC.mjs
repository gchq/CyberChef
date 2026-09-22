/**
 * @author Medjedtxm
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import { toHexFast } from "../lib/Hex.mjs";
import AsconMac from "../vendor/ascon.mjs";

/**
 * Ascon MAC operation
 */
class AsconMAC extends Operation {

    /**
     * AsconMAC constructor
     */
    constructor() {
        super();

        this.name = "Ascon MAC";
        this.module = "Crypto";
        this.description = "Ascon-Mac produces a 128-bit (16-byte) message authentication code as part of the Ascon family standardised by NIST in SP 800-232. It provides authentication for messages using a secret key, ensuring both data integrity and authenticity.<br><br>Ascon is designed for lightweight cryptography on constrained devices such as IoT sensors and embedded systems.";
        this.infoURL = "https://wikipedia.org/wiki/Ascon_(cipher)";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                "name": "Key",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     * @throws {OperationError} if invalid key length
     */
    run(input, args) {
        const keyArray = Utils.convertToByteArray(args[0].string, args[0].option);

        if (keyArray.length !== 16) {
            throw new OperationError(`Invalid key length: ${keyArray.length} bytes.

Ascon-Mac requires a key of exactly 16 bytes (128 bits).`);
        }

        // Convert to Uint8Array for vendor Ascon implementation
        const keyUint8 = new Uint8Array(keyArray);
        const inputUint8 = new Uint8Array(input);

        // Compute MAC (returns Uint8Array)
        const macResult = AsconMac.mac(keyUint8, inputUint8);

        // Convert to hex string
        return toHexFast(macResult);
    }

}

export default AsconMAC;
