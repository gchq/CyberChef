/**
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Parses an ASN.1 TLV length field at the given offset.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {{headerLength: number, valueLength: number}}
 */
function parseAsnLength(bytes, offset) {
    if (offset + 2 > bytes.length) {
        throw new OperationError("Insufficient ASN.1 data.");
    }

    const first = bytes[offset + 1];
    if ((first & 0x80) === 0) {
        return { headerLength: 2, valueLength: first };
    }

    const lengthOfLength = first & 0x7f;
    if (offset + 2 + lengthOfLength > bytes.length) {
        throw new OperationError("Invalid ASN.1 length field.");
    }

    let valueLength = 0;
    for (let i = 0; i < lengthOfLength; i++) {
        valueLength = (valueLength << 8) | bytes[offset + 2 + i];
    }

    return { headerLength: 2 + lengthOfLength, valueLength };
}

/**
 * Parse TR-34 B9 envelope operation
 */
class ParseTR34B9Envelope extends Operation {

    /**
     * ParseTR34B9Envelope constructor
     */
    constructor() {
        super();

        this.name = "Parse TR-34 B9 envelope";
        this.module = "Payment";
        this.description = "Paste the full B9 response frame into the input field as hex.<br><br><b>Input:</b> complete TR-34 B9 response encoded as hex, including the leading length field.<br><br>This operation splits the response into header, response code, authentication data, KCV, envelope data, signature length, signature, and any trailing bytes.";
        this.inlineHelp = "<strong>Input:</strong> full B9 response frame as hex, including the 2-byte length field.<br><strong>Args:</strong> none.";
        this.testDataSamples = [
            {
                name: "Synthetic B9 parser sample",
                input: "001730303030423930303100112233300030303034AABBCCDD",
                args: []
            }
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
        if (!hex.length) {
            throw new OperationError("No input.");
        }
        if (hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) {
            throw new OperationError("Input must be hex.");
        }

        const bytes = new Uint8Array(hex.match(/.{2}/g).map(h => parseInt(h, 16)));
        if (bytes.length < 12) {
            throw new OperationError("Input too short.");
        }

        const declaredLength = (bytes[0] << 8) | bytes[1];
        let offset = 2;

        const header = String.fromCharCode(...bytes.slice(offset, offset + 4));
        offset += 4;

        const responseType = String.fromCharCode(...bytes.slice(offset, offset + 2));
        offset += 2;

        const errorCode = String.fromCharCode(...bytes.slice(offset, offset + 2));
        offset += 2;

        const authLenMeta = parseAsnLength(bytes, offset);
        const authTotalLen = authLenMeta.headerLength + authLenMeta.valueLength;
        const authData = bytes.slice(offset, offset + authTotalLen);
        offset += authTotalLen;

        const kcv = bytes.slice(offset, offset + 3);
        offset += 3;

        const envLenMeta = parseAsnLength(bytes, offset);
        const envTotalLen = envLenMeta.headerLength + envLenMeta.valueLength;
        const envelopeData = bytes.slice(offset, offset + envTotalLen);
        offset += envTotalLen;

        const signatureLengthAscii = String.fromCharCode(...bytes.slice(offset, offset + 4));
        offset += 4;
        const signatureLength = parseInt(signatureLengthAscii, 10);
        const signature = Number.isFinite(signatureLength) ? bytes.slice(offset, offset + signatureLength) : new Uint8Array();
        if (Number.isFinite(signatureLength)) {
            offset += signatureLength;
        }

        const out = {
            declaredLength,
            actualLengthExcludingLengthField: bytes.length - 2,
            header,
            responseType,
            errorCode,
            authDataHex: Buffer.from(authData).toString("hex").toUpperCase(),
            kcvHex: Buffer.from(kcv).toString("hex").toUpperCase(),
            envelopeDataHex: Buffer.from(envelopeData).toString("hex").toUpperCase(),
            signatureLengthAscii,
            signatureLength: Number.isFinite(signatureLength) ? signatureLength : null,
            signatureHex: Buffer.from(signature).toString("hex").toUpperCase(),
            trailingHex: Buffer.from(bytes.slice(offset)).toString("hex").toUpperCase()
        };

        return JSON.stringify(out, null, 4);
    }

}

export default ParseTR34B9Envelope;
