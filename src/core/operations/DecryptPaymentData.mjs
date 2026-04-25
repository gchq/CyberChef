/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import { DUKPT_DATA_VARIANTS, PAYMENT_CIPHER_PROFILES, decryptPaymentData } from "../lib/PaymentDataCipher.mjs";

/**
 * Decrypt payment data operation.
 */
class DecryptPaymentData extends Operation {
    /**
     * DecryptPaymentData constructor.
     */
    constructor() {
        super();

        this.name = "Decrypt Payment Data";
        this.module = "Payment";
        this.description = "Paste ciphertext into the input field as hex and decrypt it using a payment-facing cipher wrapper.<br><br><b>Input:</b> ciphertext hex.<br><b>Arguments:</b> choose the cipher profile, provide a direct key or BDK, add IV where needed, and provide KSN plus DUKPT variant when using a DUKPT profile.";
        this.inlineHelp = "<strong>Input:</strong> ciphertext hex.<br><strong>Args:</strong> choose AES, TDES, or DUKPT-wrapped TDES, then provide key, IV, and optional KSN context.";
        this.testDataSamples = [
            {
                name: "AES CBC sample",
                input: "76D0627DA1D290436E21A4AF7FCA94B7177C1FC94173D442E36EE79D7CA0E461",
                args: ["AES CBC", "00112233445566778899AABBCCDDEEFF", "000102030405060708090A0B0C0D0E0F", "", "Data", false]
            }
        ];
        this.infoURL = "https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/API_DecryptData.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            { name: "Cipher profile", type: "option", value: PAYMENT_CIPHER_PROFILES, comment: "Select the payment-facing decryption profile. DUKPT profiles derive a session key first, then run TDES decryption." },
            { name: "Key / BDK", type: "string", value: "", comment: "Provide the clear AES/TDES key for static profiles, or the clear BDK for DUKPT profiles." },
            { name: "IV (hex)", type: "string", value: "", comment: "Initialization vector as hex. Leave blank for ECB. Use 16 bytes for AES CBC/CTR and 8 bytes for TDES CBC." },
            { name: "KSN (DUKPT only)", type: "string", value: "", comment: "Required only for DUKPT profiles. Provide the full 10-byte KSN as hex." },
            { name: "DUKPT variant", type: "option", value: DUKPT_DATA_VARIANTS, defaultIndex: 1, comment: "Applies only to DUKPT profiles. Use <code>Data</code> for the current data-key masking behavior in this fork." },
            { name: "Output as JSON", type: "boolean", value: false, comment: "When enabled, returns the effective cipher context and plaintext." },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [profile, keyHex, ivHex, ksn, dukptVariant, outputJson] = args;
        const result = decryptPaymentData(input, profile, keyHex, ivHex, ksn, dukptVariant);
        return outputJson ? JSON.stringify(result, null, 4) : result.plaintextHex;
    }
}

export default DecryptPaymentData;
