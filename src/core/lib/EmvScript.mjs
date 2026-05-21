/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import OperationError from "../errors/OperationError.mjs";

/** Issuer script command display names mapped to INS byte values. */
const COMMAND_TO_INS = {
    "PUT DATA": "DA",
    "PUT DATA (ODD)": "DB",
    "UPDATE RECORD": "DC",
    "WRITE BINARY": "D6",
    "CHANGE REFERENCE DATA": "24",
    "DISABLE VERIFICATION REQUIREMENT": "26",
    "ENABLE VERIFICATION REQUIREMENT": "28",
    "EXTERNAL AUTHENTICATE": "82",
};

/** Ordered option list for the Command selector arg. */
const SCRIPT_COMMANDS = Object.keys(COMMAND_TO_INS);

/** PIN change mode display names mapped to P1 byte values. */
const CHANGE_MODE_TO_P1 = {
    "Change with current PIN verification": "00",
    "Change without verification": "01",
};

/** Ordered option list for the Change mode selector arg. */
const PIN_CHANGE_MODES = Object.keys(CHANGE_MODE_TO_P1);

/**
 * Validates and normalises a 1-byte hex string.
 *
 * @param {string} hex
 * @param {string} name
 * @returns {string} Upper-case 2-char hex
 */
function normByte(hex, name) {
    const s = (hex || "").replace(/\s+/g, "").toUpperCase();
    if (!/^[0-9A-F]{2}$/.test(s)) {
        throw new OperationError(`${name} must be exactly 1 byte (2 hex chars).`);
    }
    return s;
}

/**
 * Validates and normalises an arbitrary hex data string (may be empty).
 *
 * @param {string} hex
 * @returns {string} Upper-case hex, possibly empty
 */
function normData(hex) {
    const s = (hex || "").replace(/\s+/g, "").toUpperCase();
    if (s && !/^[0-9A-F]+$/.test(s)) {
        throw new OperationError("Data must be hex.");
    }
    if (s.length % 2 !== 0) {
        throw new OperationError("Data must be even-length hex.");
    }
    return s;
}

/**
 * Builds an issuer script command APDU from its component fields.
 * The Lc byte is computed from the length of the supplied data.
 *
 * @param {string} claHex
 * @param {string} commandName - key from SCRIPT_COMMANDS
 * @param {string} p1Hex
 * @param {string} p2Hex
 * @param {string} dataHex
 * @returns {Object} fields including the full apdu hex
 */
function buildScriptApdu(claHex, commandName, p1Hex, p2Hex, dataHex) {
    const cla = normByte(claHex, "CLA");
    const ins = COMMAND_TO_INS[commandName] || normByte(commandName, "INS");
    const p1 = normByte(p1Hex, "P1");
    const p2 = normByte(p2Hex, "P2");
    const data = normData(dataHex);
    const lcDec = data.length / 2;
    const lc = lcDec.toString(16).padStart(2, "0").toUpperCase();
    const apdu = `${cla}${ins}${p1}${p2}${lc}${data}`;
    return { cla, ins, commandName, p1, p2, lc, lcDec, data, apdu };
}

/**
 * Builds the 5-byte CHANGE REFERENCE DATA command header for PIN change.
 * The caller supplies Lc explicitly because it must account for the
 * encrypted PIN block and MAC bytes that follow in the final APDU.
 *
 * @param {string} claHex
 * @param {string} changeMode - key from PIN_CHANGE_MODES
 * @param {string} p2Hex
 * @param {string} lcHex
 * @returns {Object} fields including the 5-byte header hex
 */
function buildPinChangeHeader(claHex, changeMode, p2Hex, lcHex) {
    const cla = normByte(claHex, "CLA");
    const p1 = CHANGE_MODE_TO_P1[changeMode];
    if (!p1) {
        throw new OperationError(`Unknown change mode: ${changeMode}`);
    }
    const p2 = normByte(p2Hex, "P2");
    const lc = normByte(lcHex, "Lc");
    const lcDec = parseInt(lc, 16);
    const header = `${cla}24${p1}${p2}${lc}`;
    return { cla, ins: "24", p1, changeMode, p2, lc, lcDec, header };
}

/**
 * Formats APDU fields as an annotated line-by-line breakdown.
 *
 * @param {Object} f - result of buildScriptApdu
 * @returns {string}
 */
function formatAnnotatedApdu(f) {
    const insName = COMMAND_TO_INS[f.commandName] ? f.commandName : (f.commandName || "Custom instruction");
    const pad = 24;
    const lines = [
        `CLA    ${f.cla.padEnd(pad)}[Class byte]`,
        `INS    ${f.ins.padEnd(pad)}[${insName}]`,
        `P1     ${f.p1.padEnd(pad)}[Parameter 1]`,
        `P2     ${f.p2.padEnd(pad)}[Parameter 2]`,
        `Lc     ${f.lc.padEnd(pad)}[${f.lcDec} byte${f.lcDec === 1 ? "" : "s"} of data]`,
    ];
    if (f.data) {
        lines.push(`Data   ${f.data.padEnd(pad)}[Command data]`);
    }
    lines.push("─".repeat(40));
    lines.push(`APDU   ${f.apdu}`);
    return lines.join("\n");
}

/**
 * Formats PIN change header fields as an annotated breakdown.
 *
 * @param {Object} f - result of buildPinChangeHeader
 * @returns {string}
 */
function formatAnnotatedPinChangeHeader(f) {
    const pad = 24;
    const lines = [
        `CLA    ${f.cla.padEnd(pad)}[Class byte]`,
        `INS    ${"24".padEnd(pad)}[CHANGE REFERENCE DATA]`,
        `P1     ${f.p1.padEnd(pad)}[${f.changeMode}]`,
        `P2     ${f.p2.padEnd(pad)}[PIN reference]`,
        `Lc     ${f.lc.padEnd(pad)}[${f.lcDec} bytes total: PIN block + MAC]`,
        "─".repeat(40),
        `Header ${f.header}  [Feed as message into EMV Generate MAC (PIN Change)]`,
    ];
    return lines.join("\n");
}

export {
    SCRIPT_COMMANDS,
    PIN_CHANGE_MODES,
    buildScriptApdu,
    buildPinChangeHeader,
    formatAnnotatedApdu,
    formatAnnotatedPinChangeHeader,
};
