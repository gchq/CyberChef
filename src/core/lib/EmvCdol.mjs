/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import OperationError from "../errors/OperationError.mjs";

/**
 * Standard EMVCo CDOL1 field template.
 *
 * This 10-field, 33-byte layout covers Visa, Mastercard, Amex, Discover,
 * JCB, and UnionPay acquirer flows. Network differences (Option A vs
 * Option B session-key derivation) affect key derivation upstream, not
 * the structure of the CDOL1 data block itself.
 */
const CDOL1_FIELDS = [
    { tag: "9F02", name: "Amount Authorised",         bytes: 6 },
    { tag: "9F03", name: "Amount Other",              bytes: 6 },
    { tag: "9F1A", name: "Terminal Country Code",     bytes: 2 },
    { tag: "95",   name: "TVR",                       bytes: 5 },
    { tag: "5F2A", name: "Transaction Currency Code", bytes: 2 },
    { tag: "9A",   name: "Transaction Date",          bytes: 3 },
    { tag: "9C",   name: "Transaction Type",          bytes: 1 },
    { tag: "9F37", name: "Unpredictable Number",      bytes: 4 },
    { tag: "82",   name: "AIP",                       bytes: 2 },
    { tag: "9F36", name: "ATC",                       bytes: 2 },
];

const CDOL1_TOTAL_BYTES = CDOL1_FIELDS.reduce((sum, f) => sum + f.bytes, 0); // 33

/**
 * @param {string} value
 * @param {string} name
 * @param {number} bytes
 * @returns {string} uppercase hex, validated
 */
function validateFieldHex(value, name, bytes) {
    const h = (value || "").replace(/\s+/g, "").toUpperCase();
    if (!/^[0-9A-F]*$/.test(h))
        throw new OperationError(`${name}: not valid hex.`);
    if (h.length !== bytes * 2)
        throw new OperationError(`${name}: expected ${bytes * 2} hex chars (${bytes} bytes), got ${h.length}.`);
    return h;
}

/**
 * @param {string[]} values — one hex string per CDOL1 field, in template order
 * @returns {{ tag: string, name: string, bytes: number, value: string }[]}
 */
function buildCdol1(values) {
    if (values.length !== CDOL1_FIELDS.length)
        throw new OperationError(`Expected ${CDOL1_FIELDS.length} field values, got ${values.length}.`);
    return CDOL1_FIELDS.map((f, i) => ({
        ...f,
        value: validateFieldHex(values[i], f.name, f.bytes),
    }));
}

/**
 * @param {string} hex — flat 66-char (33-byte) CDOL1 preimage
 * @returns {{ tag: string, name: string, bytes: number, value: string }[]}
 */
function parseCdol1(hex) {
    const h = (hex || "").replace(/\s+/g, "").toUpperCase();
    if (!h || !/^[0-9A-F]+$/.test(h))
        throw new OperationError("Input is not valid hex.");
    if (h.length < CDOL1_TOTAL_BYTES * 2)
        throw new OperationError(
            `Standard CDOL1 requires ${CDOL1_TOTAL_BYTES * 2} hex chars (${CDOL1_TOTAL_BYTES} bytes); got ${h.length}.`
        );
    let offset = 0;
    return CDOL1_FIELDS.map(f => {
        const value = h.substring(offset, offset + f.bytes * 2);
        offset += f.bytes * 2;
        return { ...f, value };
    });
}

/**
 * @param {{ value: string }[]} parsed
 * @returns {string} flat uppercase hex
 */
function formatHex(parsed) {
    return parsed.map(f => f.value).join("");
}

/**
 * @param {{ tag: string, name: string, value: string }[]} parsed
 * @returns {string} pretty-printed JSON
 */
function formatJson(parsed) {
    const obj = {};
    for (const f of parsed) obj[`${f.name} (${f.tag})`] = f.value;
    return JSON.stringify(obj, null, 4);
}

/**
 * @param {{ tag: string, name: string, bytes: number, value: string }[]} parsed
 * @returns {string} annotated TLV lines: TAG  LEN  VALUE  [name]
 */
function formatAnnotatedTlv(parsed) {
    return parsed
        .map(f => {
            const lenHex = f.bytes.toString(16).padStart(2, "0").toUpperCase();
            return `${f.tag.padEnd(6)} ${lenHex}  ${f.value.padEnd(12)}  [${f.name}]`;
        })
        .join("\n");
}

export {
    CDOL1_FIELDS,
    CDOL1_TOTAL_BYTES,
    buildCdol1,
    parseCdol1,
    formatHex,
    formatJson,
    formatAnnotatedTlv,
};
