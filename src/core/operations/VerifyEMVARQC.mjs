/**
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { generateEmvAesCmacCryptogram } from "../lib/EmvCryptogram.mjs";

/**
 * Verify EMV ARQC operation.
 */
class VerifyEMVARQC extends Operation {
    /**
     * VerifyEMVARQC constructor.
     */
    constructor() {
        super();

        this.name = "Verify EMV ARQC";
        this.module = "Payment";
        this.description = "Paste the already-assembled EMV authorization-request input into the input field as hex and verify an AES-CMAC-based ARQC.<br><br><b>Input:</b> preassembled ARQC input data as hex.<br><b>Arguments:</b> provide the EMV session key, cryptogram length, and expected ARQC hex value.<br><br>This operation intentionally covers only AES-CMAC-style EMV profiles where the session key and preimage are already known.";
        this.inlineHelp = "<strong>Input:</strong> preassembled ARQC data as hex.<br><strong>Args:</strong> provide the AES session key and expected ARQC.";
        this.testDataSamples = [
            {
                name: "AES-CMAC ARQC verification sample",
                input: "000102030405060708090A0B0C0D0E0F",
                args: ["00112233445566778899AABBCCDDEEFF", 8, "C1F732B52FB20CAA"]
            }
        ];
        this.infoURL = "https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/API_VerifyAuthRequestCryptogram.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            { name: "Session key (hex)", type: "string", value: "", comment: "Provide the already-derived EMV session key as hex. This wrapper does not derive EMV session keys." },
            { name: "Cryptogram bytes", type: "number", value: 8, min: 1, max: 16, comment: "Number of leftmost CMAC bytes to compare." },
            { name: "Expected ARQC (hex)", type: "string", value: "", comment: "Expected ARQC value as hex." },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [sessionKeyHex, cryptogramBytes, expectedArqc] = args;
        const generated = generateEmvAesCmacCryptogram(input, sessionKeyHex, cryptogramBytes);
        const normalizedExpected = (expectedArqc || "").replace(/\s+/g, "").toUpperCase();
        return JSON.stringify({
            ...generated,
            expectedArqcHex: normalizedExpected,
            valid: generated.cryptogramHex === normalizedExpected
        }, null, 4);
    }
}

export default VerifyEMVARQC;
