/**
 * @author Medjedtxm
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { encode } from "../lib/Bech32.mjs";

/**
 * To Bech32 operation
 */
class ToBech32 extends Operation {

    /**
     * ToBech32 constructor
     */
    constructor() {
        super();

        this.name = "To Bech32";
        this.module = "Default";
        this.description = "Bech32 is an encoding scheme primarily used for Bitcoin SegWit addresses (BIP-0173). It uses a 32-character alphabet that excludes easily confused characters (1, b, i, o) and includes a checksum for error detection.<br><br>Bech32m (BIP-0350) is an updated version that fixes a weakness in the original Bech32 checksum and is used for Bitcoin Taproot addresses.<br><br>The Human-Readable Part (HRP) identifies the network or purpose (e.g., 'bc' for Bitcoin mainnet, 'tb' for testnet, 'age' for AGE encryption keys).<br><br>Maximum output length is 90 characters as per specification.";
        this.infoURL = "https://wikipedia.org/wiki/Bech32";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                "name": "Human-Readable Part (HRP)",
                "type": "string",
                "value": "bc"
            },
            {
                "name": "Encoding",
                "type": "option",
                "value": ["Bech32", "Bech32m"]
            },
            {
                "name": "Input Format",
                "type": "option",
                "value": ["Raw bytes", "Bitcoin SegWit (version + program)"]
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const hrp = args[0];
        const encoding = args[1];
        const inputFormat = args[2];

        const inputArray = new Uint8Array(input);
        const segwit = inputFormat === "Bitcoin SegWit (version + program)";

        return encode(hrp, inputArray, encoding, segwit);
    }

}

export default ToBech32;
