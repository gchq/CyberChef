/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import { generateEmvAesCmacCryptogram } from "../lib/EmvCryptogram.mjs";

/**
 * Generate EMV ARPC operation.
 */
class GenerateEMVARPC extends Operation {

    /**
     * GenerateEMVARPC constructor.
     */
    constructor() {
        super();

        this.name = "Generate EMV ARPC";
        this.module = "Payment";
        this.description = "Paste the already-assembled EMV authorization-response input into the input field as hex and generate an AES-CMAC-based ARPC.<br><br><b>Input:</b> preassembled ARPC input data as hex.<br><b>Arguments:</b> provide the issuer session key in hex and choose how many bytes of the CMAC should be returned.<br><br><b>Validation:</b> Partially verified. This intentionally covers only supplied-key AES-CMAC-style EMV response profiles and does not derive issuer session keys or assemble response fields for you.<br><br><b>Security:</b> Clear session keys are test-use only.";
        this.inlineHelp = "<strong>Input:</strong> preassembled ARPC data as hex.<br><strong>Args:</strong> provide the issuer AES session key and choose the truncated cryptogram length.<br><strong>Validation:</strong> supplied-key AES-CMAC response profile only.";
        this.testDataSamples = [
            {
                name: "AES-CMAC ARPC sample",
                input: "11223344556677889900AABBCCDDEEFF",
                args: ["00112233445566778899AABBCCDDEEFF", 8, false]
            }
        ];
        this.infoURL = "https://docs.aws.amazon.com/payment-cryptography/latest/userguide/crypto-ops-carddata.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Issuer session key (hex)",
                type: "string",
                value: "",
                comment: "Provide the already-derived issuer session key as hex. Assumption: this op does not derive EMV issuer session keys."
            },
            {
                name: "Cryptogram bytes",
                type: "number",
                value: 8,
                min: 1,
                max: 16,
                comment: "Number of leftmost CMAC bytes to return. Common ARPC length is <code>8</code> bytes."
            },
            {
                name: "Output as JSON",
                type: "boolean",
                value: false,
                comment: "When enabled, returns the full AES-CMAC and the truncated ARPC value."
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [issuerSessionKeyHex, cryptogramBytes, outputJson] = args;
        const result = generateEmvAesCmacCryptogram(input, issuerSessionKeyHex, cryptogramBytes);
        return outputJson ? JSON.stringify(result, null, 4) : result.cryptogramHex;
    }
}

export default GenerateEMVARPC;
