/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import { verifyEmvMac } from "../lib/EmvMac.mjs";

/**
 * Verify EMV MAC operation.
 */
class VerifyEMVMAC extends Operation {
    /**
     * VerifyEMVMAC constructor.
     */
    constructor() {
        super();

        this.name = "EMV Verify MAC";
        this.module = "Payment";
        this.description = "Paste the issuer-script or EMV command payload into the input field as hex and verify an EMV MAC.<br><br><b>Input:</b> message data as hex.<br><b>Arguments:</b> provide the already-derived EMV session integrity key and the expected MAC as hex.<br><br><b>Validation:</b> Partially verified. This checks the same supplied-key EMV MAC profile as the generate operation and does not claim full issuer-host or scheme-specific EMV verification semantics.<br><br><b>Key context:</b> In a full issuer implementation, the session integrity key used here corresponds to the secure-messaging integrity key (distinct from the confidentiality key used to encrypt data and the PIN encryption key used for PIN blocks). This operation accepts any key you supply and does not enforce that separation.<br><br><b>Security:</b> Clear session keys in the recipe are test-use only.";
        this.inlineHelp = "<strong>Input:</strong> issuer-script message data as hex.<br><strong>Args:</strong> provide the derived EMV session integrity key and expected MAC.<br><strong>Validation:</strong> same supplied-key EMV profile as generation.";
        this.testDataSamples = [
            {
                name: "EMV MAC verification sample",
                input: "8424000008999E57FD0F47CACE0007",
                args: ["0123456789ABCDEFFEDCBA9876543210", "22CB48394DFD1977", "Method 2", true]
            }
        ];
        this.infoURL = "https://en.wikipedia.org/wiki/EMV";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            { name: "Session integrity key (hex)", type: "string", value: "", comment: "Provide the already-derived EMV integrity session key in hex. This op does not derive EMV keys for you." },
            { name: "Expected MAC (hex)", type: "string", value: "", comment: "Issuer-script MAC to compare against, expressed as even-length hex." },
            { name: "Padding method", type: "option", value: ["Method 2", "Method 1"], comment: "Must match the method used during generation. Method 2 appends 0x80 then zero-pads (ISO 7816-4; standard for EMV issuer scripts). Method 1 zero-pads only." },
            { name: "Output as JSON", type: "boolean", value: true, comment: "When enabled, returns the recomputed MAC and validity result." },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [sessionKeyHex, expectedMac, paddingMethod, outputJson] = args;
        const result = verifyEmvMac(input, sessionKeyHex, expectedMac, paddingMethod);
        return outputJson ? JSON.stringify(result, null, 4) : String(result.valid);
    }
}

export default VerifyEMVMAC;
