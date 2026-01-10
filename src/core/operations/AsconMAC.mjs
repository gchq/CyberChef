/**
 * @author txm20
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import { toHexFast } from "../lib/Hex.mjs";

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
     */
    async run(input, args) {
        const JsAscon = (await import("js-ascon")).default;

        const keyStr = Utils.convertToByteString(args[0].string, args[0].option);

        // Convert ArrayBuffer to string for js-ascon
        const inputStr = new TextDecoder().decode(input);

        // Compute MAC (returns Uint8Array)
        const macResult = JsAscon.mac(keyStr, inputStr);

        // Convert to hex string
        return toHexFast(macResult);
    }

}

export default AsconMAC;
