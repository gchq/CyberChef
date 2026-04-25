/**
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { generateEmvMac } from "../lib/EmvMac.mjs";

/**
 * Generate EMV MAC operation.
 */
class GenerateEMVMAC extends Operation {
    /**
     * GenerateEMVMAC constructor.
     */
    constructor() {
        super();

        this.name = "Generate EMV MAC";
        this.module = "Payment";
        this.description = "Paste the issuer-script or EMV command payload into the input field as hex and generate an EMV MAC.<br><br><b>Input:</b> message data as hex.<br><b>Arguments:</b> provide the already-derived EMV session integrity key and choose how many leftmost MAC bytes to return.<br><br>Assumption: this operation expects the EMV session key to have been derived outside the operation and applies ISO9797-3 retail MAC with ISO9797 padding method 2.";
        this.inlineHelp = "<strong>Input:</strong> issuer-script message data as hex.<br><strong>Args:</strong> provide the derived EMV session integrity key.";
        this.testDataSamples = [
            {
                name: "EMV MAC sample",
                input: "8424000008999E57FD0F47CACE0007",
                args: ["0123456789ABCDEFFEDCBA9876543210", 8, false]
            }
        ];
        this.infoURL = "https://docs.aws.amazon.com/payment-cryptography/latest/userguide/use-cases-issuers.generalfunctions.emvmac.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            { name: "Session integrity key (hex)", type: "string", value: "", comment: "Provide the already-derived EMV integrity session key in hex. This op does not derive EMV keys for you." },
            { name: "Output bytes", type: "number", value: 8, min: 1, max: 8, comment: "Number of leftmost MAC bytes to return. EMV issuer scripts commonly use 8 bytes." },
            { name: "Output as JSON", type: "boolean", value: false, comment: "When enabled, returns the issuer-script input and full retail-MAC details." },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [sessionKeyHex, outputBytes, outputJson] = args;
        const result = generateEmvMac(input, sessionKeyHex, outputBytes);
        return outputJson ? JSON.stringify(result, null, 4) : result.macHex;
    }
}

export default GenerateEMVMAC;
