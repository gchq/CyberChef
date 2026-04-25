/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import { DUKPT_DATA_VARIANTS, PAYMENT_CIPHER_PROFILES, reEncryptPaymentData } from "../lib/PaymentDataCipher.mjs";

/**
 * Re-encrypt payment data operation.
 */
class ReEncryptPaymentData extends Operation {
    /**
     * ReEncryptPaymentData constructor.
     */
    constructor() {
        super();

        this.name = "Re-Encrypt Payment Data";
        this.module = "Payment";
        this.description = "Paste ciphertext into the input field as hex, decrypt it under the source key context, then re-encrypt it under the target key context.<br><br><b>Input:</b> source ciphertext hex.<br><b>Arguments:</b> choose source and target profiles, provide the corresponding key or BDK material, add IVs, and supply KSN plus DUKPT variant when using DUKPT profiles.";
        this.inlineHelp = "<strong>Input:</strong> source ciphertext hex.<br><strong>Args:</strong> define the source decrypt context, then the target encrypt context.";
        this.testDataSamples = [
            {
                name: "AES CBC to TDES CBC sample",
                input: "76D0627DA1D290436E21A4AF7FCA94B7177C1FC94173D442E36EE79D7CA0E461",
                args: ["AES CBC", "00112233445566778899AABBCCDDEEFF", "000102030405060708090A0B0C0D0E0F", "", "Data", "TDES CBC", "0123456789ABCDEFFEDCBA9876543210", "1234567890ABCDEF", "", "Data", false]
            }
        ];
        this.infoURL = "https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/API_ReEncryptData.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            { name: "Source profile", type: "option", value: PAYMENT_CIPHER_PROFILES, comment: "How to decrypt the input ciphertext." },
            { name: "Source key / BDK", type: "string", value: "", comment: "Source clear AES/TDES key or DUKPT BDK." },
            { name: "Source IV (hex)", type: "string", value: "", comment: "Source IV as hex. Leave blank for ECB." },
            { name: "Source KSN (DUKPT only)", type: "string", value: "", comment: "Required only for DUKPT source profiles." },
            { name: "Source DUKPT variant", type: "option", value: DUKPT_DATA_VARIANTS, defaultIndex: 1, comment: "Applies only to DUKPT source profiles." },
            { name: "Target profile", type: "option", value: PAYMENT_CIPHER_PROFILES, comment: "How to encrypt the recovered plaintext." },
            { name: "Target key / BDK", type: "string", value: "", comment: "Target clear AES/TDES key or DUKPT BDK." },
            { name: "Target IV (hex)", type: "string", value: "", comment: "Target IV as hex. Leave blank for ECB." },
            { name: "Target KSN (DUKPT only)", type: "string", value: "", comment: "Required only for DUKPT target profiles." },
            { name: "Target DUKPT variant", type: "option", value: DUKPT_DATA_VARIANTS, defaultIndex: 1, comment: "Applies only to DUKPT target profiles." },
            { name: "Output as JSON", type: "boolean", value: false, comment: "When enabled, returns both the source decrypt and target encrypt contexts." },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [sourceProfile, sourceKeyHex, sourceIvHex, sourceKsn, sourceDukptVariant, targetProfile, targetKeyHex, targetIvHex, targetKsn, targetDukptVariant, outputJson] = args;
        const result = reEncryptPaymentData(input, {
            sourceProfile,
            sourceKeyHex,
            sourceIvHex,
            sourceKsn,
            sourceDukptVariant,
            targetProfile,
            targetKeyHex,
            targetIvHex,
            targetKsn,
            targetDukptVariant,
        });
        return outputJson ? JSON.stringify(result, null, 4) : result.target.ciphertextHex;
    }
}

export default ReEncryptPaymentData;
