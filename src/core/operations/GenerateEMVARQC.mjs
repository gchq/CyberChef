/**
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { generateEmvAesCmacCryptogram } from "../lib/EmvCryptogram.mjs";

/**
 * Generate EMV ARQC operation.
 */
class GenerateEMVARQC extends Operation {

    /**
     * GenerateEMVARQC constructor.
     */
    constructor() {
        super();

        this.name = "Generate EMV ARQC";
        this.module = "Payment";
        this.description = "Paste the already-assembled EMV authorization-request input into the input field as hex and generate an AES-CMAC-based ARQC.<br><br><b>Input:</b> preassembled ARQC input data as hex.<br><b>Arguments:</b> provide the EMV session key in hex and choose how many bytes of the CMAC should be returned.<br><br>This operation intentionally covers only AES-CMAC-style EMV profiles where the session key and preimage are already known.";
        this.inlineHelp = "<strong>Input:</strong> preassembled ARQC data as hex.<br><strong>Args:</strong> provide the AES session key and choose the truncated cryptogram length.";
        this.testDataSamples = [
            {
                name: "AES-CMAC ARQC sample",
                input: "000102030405060708090A0B0C0D0E0F",
                args: ["00112233445566778899AABBCCDDEEFF", 8, false]
            }
        ];
        this.infoURL = "https://docs.aws.amazon.com/payment-cryptography/latest/userguide/crypto-ops-carddata.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Session key (hex)",
                type: "string",
                value: "",
                comment: "Provide the already-derived EMV session key as hex. Assumption: this op does not derive EMV session keys."
            },
            {
                name: "Cryptogram bytes",
                type: "number",
                value: 8,
                min: 1,
                max: 16,
                comment: "Number of leftmost CMAC bytes to return. Common ARQC length is <code>8</code> bytes."
            },
            {
                name: "Output as JSON",
                type: "boolean",
                value: false,
                comment: "When enabled, returns the full AES-CMAC and the truncated ARQC value."
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [sessionKeyHex, cryptogramBytes, outputJson] = args;
        const result = generateEmvAesCmacCryptogram(input, sessionKeyHex, cryptogramBytes);
        return outputJson ? JSON.stringify(result, null, 4) : result.cryptogramHex;
    }
}

export default GenerateEMVARQC;
