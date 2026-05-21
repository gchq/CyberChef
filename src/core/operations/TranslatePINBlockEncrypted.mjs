/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import forge from "node-forge";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { PIN_BLOCK_FORMATS, buildPinBlock, parsePinBlock } from "../lib/PinBlock.mjs";

// ── Crypto helpers ────────────────────────────────────────────────────────────

/**
 * Validates and normalises a TDES key hex string.
 * Accepts 16-byte (2-key) or 24-byte (3-key) TDES.
 *
 * @param {string} hex
 * @param {string} label
 * @returns {string} normalised uppercase hex, always 24 bytes (48 hex chars)
 */
function normaliseTdesKey(hex, label) {
    const h = (hex || "").replace(/\s+/g, "").toUpperCase();
    if (!/^[0-9A-F]+$/.test(h)) throw new OperationError(`${label} must be hex.`);
    if (h.length === 32) return h + h.slice(0, 16); // expand 2-key to 3-key
    if (h.length === 48) return h;
    throw new OperationError(`${label} must be 16 bytes (32 hex chars) or 24 bytes (48 hex chars).`);
}

/**
 * Converts a hex string to a forge binary string.
 *
 * @param {string} hex
 * @returns {string}
 */
function hexToForgeBin(hex) {
    return forge.util.hexToBytes(hex.toLowerCase());
}

/**
 * Encrypts one 8-byte block with 3DES-ECB.
 *
 * @param {string} key48hex  24-byte key as 48 uppercase hex chars
 * @param {string} block16hex  8-byte block as 16 uppercase hex chars
 * @returns {string} 16 uppercase hex chars
 */
function tdesEcbEncrypt(key48hex, block16hex) {
    const cipher = forge.cipher.createCipher("3DES-ECB", hexToForgeBin(key48hex));
    cipher.mode.pad = () => true;
    cipher.start();
    cipher.update(forge.util.createBuffer(hexToForgeBin(block16hex)));
    cipher.finish();
    return forge.util.bytesToHex(cipher.output.getBytes()).toUpperCase().slice(0, 16);
}

/**
 * Decrypts one 8-byte block with 3DES-ECB.
 *
 * @param {string} key48hex
 * @param {string} block16hex
 * @returns {string} 16 uppercase hex chars
 */
function tdesEcbDecrypt(key48hex, block16hex) {
    const decipher = forge.cipher.createDecipher("3DES-ECB", hexToForgeBin(key48hex));
    decipher.mode.pad = () => true;
    decipher.start();
    decipher.update(forge.util.createBuffer(hexToForgeBin(block16hex)));
    decipher.finish();
    return forge.util.bytesToHex(decipher.output.getBytes()).toUpperCase().slice(0, 16);
}

// ── Operation ─────────────────────────────────────────────────────────────────

/**
 * PIN Block Translate Encrypted operation
 */
class TranslatePINBlockEncrypted extends Operation {

    /**
     * TranslatePINBlockEncrypted constructor
     */
    constructor() {
        super();

        this.name = "PIN Block Translate Encrypted";
        this.module = "Payment";
        this.description = [
            "Decrypt an encrypted PIN block under an incoming zone key (ZPK / PEK),",
            " optionally change the PIN block format, and re-encrypt under an outgoing zone key.",
            " The clear PIN is never present in the output — only the re-encrypted block is returned.",
            "<br><br>",
            "This is the acquirer's core PIN routing operation.",
            " It corresponds to <code>TranslatePinData</code> in AWS Payment Cryptography and to the",
            " <code>CA</code> / <code>CC</code> command family on Thales payShield.",
            "<br><br>",
            "<b>Input:</b> encrypted PIN block as hex (8 bytes / 16 hex chars).",
            "<br>",
            "<b>Key algorithm:</b> TDES — key must be 16 bytes (2-key TDES, 32 hex chars) or",
            " 24 bytes (3-key TDES, 48 hex chars).",
            " 2-key input is automatically expanded to 3-key (K3 = K1).",
            "<br><br>",
            "Supported formats: ISO Format 0, ISO Format 1, ISO Format 3.",
            " ISO Format 4 (AES, 16-byte block) is not yet supported.",
            "<br><br>",
            "<b>PCI PIN requirement:</b> the cardholder PAN must not change between incoming and",
            " outgoing formats (PCI PIN Security Req 3-3).",
            " Supplying a different PAN for the target format is permitted only when the target",
            " format does not use PAN binding (Format 1).",
        ].join("");
        this.inlineHelp = [
            "<strong>Input:</strong> encrypted PIN block hex.",
            "<strong>Args:</strong> incoming ZPK/PEK, incoming format and PAN;",
            " outgoing ZPK/PEK, outgoing format and PAN.",
        ].join(" ");
        this.testDataSamples = [
            {
                name: "TDES ZPK-to-ZPK, same format",
                input: "7F381DBF9F6906C4",
                args: ["DDDDEEEEFFFFAAAABBBBCCCCDDDDEEEE", "ISO Format 0", "5432101234567890",
                       "0123456789ABCDEFFEDCBA9876543210", "ISO Format 0", "5432101234567890", false]
            }
        ];
        this.infoURL = "https://wikipedia.org/wiki/ISO_9564";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Incoming key (TDES hex)",
                type: "string",
                value: "",
                comment: "Zone PIN Key (ZPK) or PIN Encryption Key (PEK) used to decrypt the incoming block. 16 bytes (32 hex) for 2-key TDES or 24 bytes (48 hex) for 3-key TDES."
            },
            {
                name: "Incoming format",
                type: "option",
                value: PIN_BLOCK_FORMATS,
                comment: "ISO 9564 format of the incoming encrypted block."
            },
            {
                name: "Incoming PAN",
                type: "string",
                value: "",
                comment: "Primary account number — required when the incoming format is 0 or 3. The implementation uses the rightmost 12 digits excluding the check digit."
            },
            {
                name: "Outgoing key (TDES hex)",
                type: "string",
                value: "",
                comment: "Zone PIN Key (ZPK) or PIN Encryption Key (PEK) used to encrypt the outgoing block. Same key-length rules as the incoming key."
            },
            {
                name: "Outgoing format",
                type: "option",
                value: PIN_BLOCK_FORMATS,
                comment: "ISO 9564 format of the outgoing encrypted block."
            },
            {
                name: "Outgoing PAN",
                type: "string",
                value: "",
                comment: "Required when the outgoing format is 0 or 3. Per PCI PIN Req 3-3, this must equal the incoming PAN when both formats use PAN binding."
            },
            {
                name: "Output as JSON",
                type: "boolean",
                value: false,
                comment: "When enabled, returns the intermediate values (incoming clear block, outgoing clear block) along with the final encrypted block. Use for debugging only — do not expose clear PIN block values in production."
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [inKeyHex, inFormat, inPan, outKeyHex, outFormat, outPan, outputJson] = args;

        const encIn = (input || "").replace(/\s+/g, "").toUpperCase();
        if (!/^[0-9A-F]{16}$/.test(encIn)) {
            throw new OperationError("Encrypted PIN block must be 16 hex characters (8 bytes).");
        }

        const inKey  = normaliseTdesKey(inKeyHex,  "Incoming key");
        const outKey = normaliseTdesKey(outKeyHex, "Outgoing key");

        // Decrypt incoming encrypted block → clear PIN block
        const clearIn = tdesEcbDecrypt(inKey, encIn);

        // Parse the clear block to recover the PIN
        const parsed = parsePinBlock(inFormat, clearIn, inPan);

        // Re-encode in the target format
        const clearOut = buildPinBlock(outFormat, parsed.pin, outPan, false);

        // Re-encrypt under the outgoing key
        const encOut = tdesEcbEncrypt(outKey, clearOut);

        if (outputJson) {
            return JSON.stringify({
                incoming: {
                    format: inFormat,
                    pan: inPan || null,
                    encryptedBlockHex: encIn,
                    clearBlockHex: clearIn,
                },
                pin: parsed.pin,
                outgoing: {
                    format: outFormat,
                    pan: outPan || null,
                    clearBlockHex: clearOut,
                    encryptedBlockHex: encOut,
                },
            }, null, 4);
        }

        return encOut;
    }

}

export default TranslatePINBlockEncrypted;
