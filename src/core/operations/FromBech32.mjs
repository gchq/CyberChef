/**
 * @author Medjedtxm
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { decode } from "../lib/Bech32.mjs";
import { toHex } from "../lib/Hex.mjs";

/**
 * From Bech32 operation
 */
class FromBech32 extends Operation {

    /**
     * FromBech32 constructor
     */
    constructor() {
        super();

        this.name = "From Bech32";
        this.module = "Default";
        this.description = "Bech32 is an encoding scheme primarily used for Bitcoin SegWit addresses (BIP-0173). It uses a 32-character alphabet that excludes easily confused characters (1, b, i, o) and includes a checksum for error detection.<br><br>Bech32m (BIP-0350) is an updated version used for Bitcoin Taproot addresses.<br><br>Auto-detect will attempt Bech32 first, then Bech32m if the checksum fails.<br><br>Output format options allow you to see the Human-Readable Part (HRP) along with the decoded data.";
        this.infoURL = "https://wikipedia.org/wiki/Bech32";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Encoding",
                "type": "option",
                "value": ["Auto-detect", "Bech32", "Bech32m"]
            },
            {
                "name": "Output Format",
                "type": "option",
                "value": ["Hex", "Bitcoin scriptPubKey", "Raw", "HRP: Hex", "JSON"]
            }
        ];
        this.checks = [
            {
                // Bitcoin mainnet SegWit/Taproot addresses
                pattern: "^bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{6,87}$",
                flags: "i",
                args: ["Auto-detect", "Hex"]
            },
            {
                // Bitcoin testnet addresses
                pattern: "^tb1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{6,87}$",
                flags: "i",
                args: ["Auto-detect", "Hex"]
            },
            {
                // AGE public keys
                pattern: "^age1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{6,87}$",
                flags: "i",
                args: ["Auto-detect", "HRP: Hex"]
            },
            {
                // AGE secret keys
                pattern: "^AGE-SECRET-KEY-1[QPZRY9X8GF2TVDW0S3JN54KHCE6MUA7L]{6,87}$",
                flags: "",
                args: ["Auto-detect", "HRP: Hex"]
            },
            {
                // Litecoin mainnet addresses
                pattern: "^ltc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{6,87}$",
                flags: "i",
                args: ["Auto-detect", "Hex"]
            },
            {
                // Generic bech32 pattern
                pattern: "^[a-z]{1,83}1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{6,}$",
                flags: "i",
                args: ["Auto-detect", "Hex"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const encoding = args[0];
        const outputFormat = args[1];

        input = input.trim();

        if (input.length === 0) {
            return "";
        }

        const decoded = decode(input, encoding);

        // Format output based on selected option
        switch (outputFormat) {
            case "Raw":
                return decoded.data.map(b => String.fromCharCode(b)).join("");

            case "Hex":
                return toHex(decoded.data, "");

            case "Bitcoin scriptPubKey": {
                // Convert to Bitcoin scriptPubKey format as shown in BIP-0173/BIP-0350
                // Format: [OP_version][length][witness_program]
                // OP_0 = 0x00, OP_1-OP_16 = 0x51-0x60
                if (decoded.witnessVersion === null || decoded.data.length < 2) {
                    // Not a SegWit address, fall back to hex
                    return toHex(decoded.data, "");
                }
                const witnessVersion = decoded.data[0];
                const witnessProgram = decoded.data.slice(1);

                // Convert witness version to OP code
                let opCode;
                if (witnessVersion === 0) {
                    opCode = 0x00; // OP_0
                } else if (witnessVersion >= 1 && witnessVersion <= 16) {
                    opCode = 0x50 + witnessVersion; // OP_1 = 0x51, ..., OP_16 = 0x60
                } else {
                    // Invalid witness version, fall back to hex
                    return toHex(decoded.data, "");
                }

                // Build scriptPubKey: [OP_version][length][program]
                const scriptPubKey = [opCode, witnessProgram.length, ...witnessProgram];
                return toHex(scriptPubKey, "");
            }

            case "HRP: Hex":
                return `${decoded.hrp}: ${toHex(decoded.data, "")}`;

            case "JSON":
                return JSON.stringify({
                    hrp: decoded.hrp,
                    encoding: decoded.encoding,
                    data: toHex(decoded.data, "")
                }, null, 2);

            default:
                return toHex(decoded.data, "");
        }
    }

}

export default FromBech32;
