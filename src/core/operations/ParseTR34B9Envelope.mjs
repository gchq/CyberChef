/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

// ── TR-34 message type table ──────────────────────────────────────────────────

const TR34_MESSAGE_TYPES = {
    B0: "GetCredential — KRD requests KDH credentials",
    B1: "KeyCertificate — KDH distributes its certificate",
    B2: "GetData — KDH requests data from KRD",
    B3: "ReceiveCert — KRD acknowledges certificate receipt",
    B4: "BindBegin — KDH initiates key transport binding",
    B5: "BindRequest — KRD sends public key / OWHF to KDH",
    B6: "BindResponse — KDH sends certificate binding confirmation",
    B8: "KeyToken — encrypted key transport object (CMS EnvelopedData)",
    B9: "BindResponse — final key delivery; contains CMS EnvelopedData + signature",
};

const TR34_ERROR_CODES = {
    "00": "Success",
    "01": "General failure",
    "02": "Invalid message format",
    "03": "Unsupported message type",
    "04": "Certificate not found",
    "05": "Invalid signature",
    "06": "Decryption failure",
    "07": "Invalid key usage",
    "08": "KDH not authorized",
    "09": "KRD not authorized",
    "10": "Message replay detected",
    "11": "Key already loaded",
    "12": "Invalid random number",
    "FF": "Unspecified error",
};

// ── ASN.1 helpers ─────────────────────────────────────────────────────────────

function parseAsnLength(bytes, offset) {
    if (offset + 2 > bytes.length)
        throw new OperationError("Insufficient ASN.1 data.");

    const first = bytes[offset + 1];
    if ((first & 0x80) === 0)
        return { headerLength: 2, valueLength: first };

    const lengthOfLength = first & 0x7f;
    if (offset + 2 + lengthOfLength > bytes.length)
        throw new OperationError("Invalid ASN.1 length field.");

    let valueLength = 0;
    for (let i = 0; i < lengthOfLength; i++)
        valueLength = (valueLength << 8) | bytes[offset + 2 + i];

    return { headerLength: 2 + lengthOfLength, valueLength };
}

/** Best-effort parse of the outermost ASN.1 SEQUENCE tag in a byte array. */
function peekAsnSequence(bytes) {
    if (!bytes || bytes.length < 2) return null;
    if (bytes[0] !== 0x30) return null; // not SEQUENCE
    try {
        const meta = parseAsnLength(bytes, 0);
        return {
            tag:           "0x30 (SEQUENCE)",
            headerBytes:   meta.headerLength,
            valueLength:   meta.valueLength,
            totalExpected: meta.headerLength + meta.valueLength,
            complete:      (meta.headerLength + meta.valueLength) === bytes.length,
        };
    } catch (_) {
        return null;
    }
}

function hexStr(bytes) {
    return Array.from(bytes, b => b.toString(16).padStart(2, "0").toUpperCase()).join("");
}

// ── Operation ─────────────────────────────────────────────────────────────────

/**
 * Parse TR-34 Key Transport message operation.
 */
class ParseTR34B9Envelope extends Operation {

    constructor() {
        super();

        this.name = "Parse TR-34 Key Transport";
        this.module = "Payment";
        this.description = [
            "Parses a <b>TR-34</b> key transport message frame (hex input) and decodes each section.",
            "<br><br>",
            "<b>Input:</b> Complete TR-34 message frame encoded as hex, including the 2-byte length prefix.",
            "<br><br>",
            "TR-34 defines a family of messages (B0–B9) for transporting symmetric keys using RSA.",
            " This operation auto-detects the message type and labels each field accordingly.",
            " The <b>Envelope Data</b> section is a CMS <code>EnvelopedData</code> (ASN.1 SEQUENCE) —",
            " the outer tag and length are shown; full CMS parsing is not performed here.",
            "<br><br>",
            "<b>Key transport flow:</b> KDH (Key Distribution Host) wraps a symmetric key under the",
            " KRD's RSA public key and signs the result. KRD verifies the signature, then decrypts.",
            "<br><br>",
            "<b>References:</b> ANS X9.143, ANSI TR-34, PCI PIN v3.1 Req 18-4.",
        ].join("");

        this.inlineHelp = "<strong>Input:</strong> full TR-34 message frame as hex, including the 2-byte length prefix.";

        this.testDataSamples = [
            {
                name: "Synthetic B9 parser sample",
                input: "001730303030423930303100112233300030303034AABBCCDD",
                args: [],
            },
        ];

        this.infoURL = "https://en.wikipedia.org/wiki/Key_block";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @returns {string}
     */
    run(input) {
        const hex = (input || "").replace(/\s+/g, "");

        if (!hex.length) throw new OperationError("No input.");
        if (hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex))
            throw new OperationError("Input must be hex.");

        const bytes = new Uint8Array(hex.match(/.{2}/g).map(h => parseInt(h, 16)));
        if (bytes.length < 12) throw new OperationError("Input too short for a TR-34 frame.");

        const notes = [];

        // ── Outer frame ─────────────────────────────────────────────────────
        const declaredLength = (bytes[0] << 8) | bytes[1];
        let offset = 2;

        const header       = String.fromCharCode(...bytes.slice(offset, offset + 4)); offset += 4;
        const responseType = String.fromCharCode(...bytes.slice(offset, offset + 2)); offset += 2;
        const errorCode    = String.fromCharCode(...bytes.slice(offset, offset + 2)); offset += 2;

        const msgDesc      = TR34_MESSAGE_TYPES[responseType] || "Unknown message type";
        const errDesc      = TR34_ERROR_CODES[errorCode] || "Unknown error code";

        if (errorCode !== "00") {
            notes.push(`Non-zero error code: ${errorCode} — ${errDesc}`);
        }

        // ── Authentication data (ASN.1 variable length) ──────────────────────
        const authLenMeta  = parseAsnLength(bytes, offset);
        const authTotalLen = authLenMeta.headerLength + authLenMeta.valueLength;
        const authData     = bytes.slice(offset, offset + authTotalLen);
        const authAsn      = peekAsnSequence(authData);
        offset += authTotalLen;

        // ── KCV (3 bytes) ────────────────────────────────────────────────────
        const kcv = bytes.slice(offset, offset + 3); offset += 3;

        // ── Envelope data (CMS EnvelopedData, ASN.1 variable length) ─────────
        const envLenMeta   = parseAsnLength(bytes, offset);
        const envTotalLen  = envLenMeta.headerLength + envLenMeta.valueLength;
        const envelopeData = bytes.slice(offset, offset + envTotalLen);
        const envAsn       = peekAsnSequence(envelopeData);
        offset += envTotalLen;

        // ── Signature length (4-byte ASCII decimal) ──────────────────────────
        const sigLenAscii  = String.fromCharCode(...bytes.slice(offset, offset + 4)); offset += 4;
        const sigLength    = parseInt(sigLenAscii, 10);
        const signature    = Number.isFinite(sigLength) ? bytes.slice(offset, offset + sigLength) : new Uint8Array();
        if (Number.isFinite(sigLength)) offset += sigLength;

        // ── Build output ─────────────────────────────────────────────────────
        const out = {
            declaredLength,
            actualLengthExcludingLengthField: bytes.length - 2,
            header,
            messageType:        responseType,
            messageDescription: msgDesc,
            errorCode,
            errorDescription:   errDesc,
            authData: {
                hex:       hexStr(authData),
                byteCount: authData.length,
                asnOuter:  authAsn,
            },
            kcvHex: hexStr(kcv),
            envelopeData: {
                hex:       hexStr(envelopeData),
                byteCount: envelopeData.length,
                description: "CMS EnvelopedData — wrapped symmetric key (decrypt with KRD private RSA key)",
                asnOuter:  envAsn,
            },
            signatureLengthAscii: sigLenAscii,
            signatureLength:      Number.isFinite(sigLength) ? sigLength : null,
            signatureHex:         hexStr(signature),
            trailingHex:          hexStr(bytes.slice(offset)),
            notes,
        };

        if (out.declaredLength !== bytes.length - 2) {
            out.notes.push(
                `Declared length ${out.declaredLength} does not match ` +
                `actual payload length ${bytes.length - 2}.`
            );
        }

        return JSON.stringify(out, null, 4);
    }
}

export default ParseTR34B9Envelope;
