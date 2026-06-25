/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
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

        this.name = "EMV Verify ARQC";
        this.module = "Payment";
        this.description = "Paste the stored ARQC into the input field and verify it against an AES-CMAC recomputed from the preimage data.<br><br><b>Input:</b> stored ARQC cryptogram as hex (typically 8 bytes = 16 hex chars).<br><b>Arguments:</b> provide the EMV session key, cryptogram length, the preassembled ARQC input data, and choose output format.<br><br>This operation recomputes the ARQC from the supplied preimage and key, then compares it to the input ARQC. Use this directly after <b>EMV Generate ARQC</b> in a recipe — the ARQC output flows naturally into this input.<br><br><b>Validation:</b> Partially verified. This checks the same supplied-key AES-CMAC EMV profile as generation and does not claim full scheme-level ARQC validation semantics.<br><br><b>Session key derivation:</b> In a full EMV flow the session key is derived from the issuer master key using the Application Transaction Counter (ATC) and PAN sequence number. Visa and Amex use EMV Common Session Key Derivation (Option A); Mastercard uses a different derivation (Option B). This operation expects you to supply the already-derived session key.<br><br><b>Security:</b> Clear session keys are test-use only.";
        this.inlineHelp = "<strong>Input:</strong> stored ARQC cryptogram as hex.<br><strong>Args:</strong> provide the AES session key, preimage data, and cryptogram length.<br><strong>Validation:</strong> same supplied-key EMV profile as generation.";
        this.testDataSamples = [
            {
                name: "AES-CMAC ARQC verification sample",
                input: "C1F732B52FB20CAA",
                args: ["00112233445566778899AABBCCDDEEFF", 8, "000102030405060708090A0B0C0D0E0F", true]
            }
        ];
        this.infoURL = "https://en.wikipedia.org/wiki/EMV";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            { name: "Session key (hex)", type: "string", value: "", comment: "Provide the already-derived EMV session key as hex. This wrapper does not derive EMV session keys." },
            { name: "Cryptogram bytes", type: "number", value: 8, min: 1, max: 16, comment: "Number of leftmost CMAC bytes to compare." },
            { name: "Preimage data (hex)", type: "string", value: "", comment: "Preassembled ARQC input data as hex — the same data used by EMV Generate ARQC to produce the ARQC." },
            { name: "Output as JSON", type: "boolean", value: true, comment: "When enabled, returns the recomputed ARQC and validity result." },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [sessionKeyHex, cryptogramBytes, preimage, outputJson] = args;
        const generated = generateEmvAesCmacCryptogram(preimage, sessionKeyHex, cryptogramBytes);
        const normalizedInput = (input || "").replace(/\s+/g, "").toUpperCase();
        const result = {
            ...generated,
            expectedArqcHex: normalizedInput,
            valid: generated.cryptogramHex === normalizedInput
        };
        return outputJson ? JSON.stringify(result, null, 4) : String(result.valid);
    }
}

export default VerifyEMVARQC;
