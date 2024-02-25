/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 *
 * HASSH created by Salesforce
 *   Ben Reardon (@benreardon)
 *   Adel Karimi (@0x4d31)
 *   and the JA3 crew:
 *     John B. Althouse
 *     Jeff Atkinson
 *     Josh Atkins
 *
 * Algorithm released under the BSD-3-clause licence
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import Stream from "../lib/Stream.mjs";
import { runHash } from "../lib/Hash.mjs";

/**
 * HASSH Client Fingerprint operation
 */
class HASSHClientFingerprint extends Operation {
    /**
     * HASSHClientFingerprint constructor
     */
    constructor() {
        super();

        this.name = "HASSH Client Fingerprint";
        this.module = "Crypto";
        this.description
            = "Generates a HASSH fingerprint to help identify SSH clients based on hashing together values from the Client Key Exchange Init message.<br><br>Input: A hex stream of the SSH_MSG_KEXINIT packet application layer from Client to Server.";
        this.infoURL = "https://engineering.salesforce.com/open-sourcing-hassh-abed3ae5044c";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Input format",
                type: "option",
                value: ["Hex", "Base64", "Raw"]
            },
            {
                name: "Output format",
                type: "option",
                value: ["Hash digest", "HASSH algorithms string", "Full details"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [inputFormat, outputFormat] = args;

        input = Utils.convertToByteArray(input, inputFormat);
        const s = new Stream(new Uint8Array(input));

        // Length
        const length = s.readInt(4);
        if (s.length !== length + 4) throw new OperationError("Incorrect packet length.");

        // Padding length
        const paddingLength = s.readInt(1);

        // Message code
        const messageCode = s.readInt(1);
        if (messageCode !== 20) throw new OperationError("Not a Key Exchange Init.");

        // Cookie
        s.moveForwardsBy(16);

        // KEX Algorithms
        const kexAlgosLength = s.readInt(4);
        const kexAlgos = s.readString(kexAlgosLength);

        // Server Host Key Algorithms
        const serverHostKeyAlgosLength = s.readInt(4);
        s.moveForwardsBy(serverHostKeyAlgosLength);

        // Encryption Algorithms Client to Server
        const encAlgosC2SLength = s.readInt(4);
        const encAlgosC2S = s.readString(encAlgosC2SLength);

        // Encryption Algorithms Server to Client
        const encAlgosS2CLength = s.readInt(4);
        s.moveForwardsBy(encAlgosS2CLength);

        // MAC Algorithms Client to Server
        const macAlgosC2SLength = s.readInt(4);
        const macAlgosC2S = s.readString(macAlgosC2SLength);

        // MAC Algorithms Server to Client
        const macAlgosS2CLength = s.readInt(4);
        s.moveForwardsBy(macAlgosS2CLength);

        // Compression Algorithms Client to Server
        const compAlgosC2SLength = s.readInt(4);
        const compAlgosC2S = s.readString(compAlgosC2SLength);

        // Compression Algorithms Server to Client
        const compAlgosS2CLength = s.readInt(4);
        s.moveForwardsBy(compAlgosS2CLength);

        // Languages Client to Server
        const langsC2SLength = s.readInt(4);
        s.moveForwardsBy(langsC2SLength);

        // Languages Server to Client
        const langsS2CLength = s.readInt(4);
        s.moveForwardsBy(langsS2CLength);

        // First KEX packet follows
        s.moveForwardsBy(1);

        // Reserved
        s.moveForwardsBy(4);

        // Padding string
        s.moveForwardsBy(paddingLength);

        // Output
        const hassh = [kexAlgos, encAlgosC2S, macAlgosC2S, compAlgosC2S];
        const hasshStr = hassh.join(";");
        const hasshHash = runHash("md5", Utils.strToArrayBuffer(hasshStr));

        switch (outputFormat) {
            case "HASSH algorithms string":
                return hasshStr;
            case "Full details":
                return `Hash digest:
${hasshHash}

Full HASSH algorithms string:
${hasshStr}

Key Exchange Algorithms:
${kexAlgos}
Encryption Algorithms Client to Server:
${encAlgosC2S}
MAC Algorithms Client to Server:
${macAlgosC2S}
Compression Algorithms Client to Server:
${compAlgosC2S}`;
            case "Hash digest":
            default:
                return hasshHash;
        }
    }
}

export default HASSHClientFingerprint;
