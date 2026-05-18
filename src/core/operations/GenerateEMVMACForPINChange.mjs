/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import { generateEmvPinChangeMac } from "../lib/EmvMac.mjs";

/**
 * Generate EMV MAC for PIN change operation.
 */
class GenerateEMVMACForPINChange extends Operation {
    /**
     * GenerateEMVMACForPINChange constructor.
     */
    constructor() {
        super();

        this.name = "EMV Generate MAC (PIN Change)";
        this.module = "Payment";
        this.description = "Paste the issuer-script APDU command into the input field as hex and generate the MAC for an offline EMV PIN-change script.<br><br><b>Input:</b> issuer-script message data as hex.<br><b>Arguments:</b> provide the already-encrypted target PIN block in hex and the already-derived EMV session integrity key.<br><br><b>Validation:</b> Test helper. The new PIN block must already be encrypted, and this op appends it to the supplied message before applying the same supplied-key EMV MAC profile used elsewhere in this fork.<br><br><b>Key context:</b> In a full issuer implementation, a PIN-change script involves three distinct keys: a secure-messaging integrity key (for the MAC), a secure-messaging confidentiality key (for encrypting the script data), and a PIN encryption key (for the new PIN block). This operation accepts a single session integrity key and a pre-encrypted PIN block — it does not model the full three-key separation.<br><br><b>Security:</b> Test-only issuer-script assembly with clear session keys in the recipe.";
        this.inlineHelp = "<strong>Input:</strong> issuer-script APDU message as hex.<br><strong>Args:</strong> provide the encrypted target PIN block and derived EMV integrity key.<br><strong>Validation:</strong> test helper for PIN-change script MAC assembly.";
        this.testDataSamples = [
            {
                name: "EMV PIN change MAC sample",
                input: "00A4040008A000000004101080D80500000001010A04000000000000",
                args: ["67FB27C75580EFE7", "0123456789ABCDEFFEDCBA9876543210", 8, false]
            }
        ];
        this.infoURL = "https://en.wikipedia.org/wiki/EMV";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            { name: "New encrypted PIN block (hex)", type: "string", value: "", comment: "Provide the already-encrypted new PIN block that will be appended to the issuer-script message." },
            { name: "Session integrity key (hex)", type: "string", value: "", comment: "Provide the already-derived EMV session integrity key in hex. This operation does not derive EMV keys or encrypt the PIN block for you." },
            { name: "Output bytes", type: "number", value: 8, min: 1, max: 8, comment: "Number of leftmost MAC bytes to return. EMV issuer scripts commonly use 8 bytes." },
            { name: "Output as JSON", type: "boolean", value: false, comment: "When enabled, returns the composed issuer-script message and the computed MAC." },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [encryptedPinBlockHex, sessionKeyHex, outputBytes, outputJson] = args;
        const result = generateEmvPinChangeMac(input, encryptedPinBlockHex, sessionKeyHex, outputBytes);
        return outputJson ? JSON.stringify(result, null, 4) : result.macHex;
    }
}

export default GenerateEMVMACForPINChange;
