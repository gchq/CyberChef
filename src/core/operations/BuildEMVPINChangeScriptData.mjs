/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import { PIN_CHANGE_MODES, buildPinChangeHeader, formatAnnotatedPinChangeHeader } from "../lib/EmvScript.mjs";

/**
 * Build EMV PIN Change Script Data operation.
 */
class BuildEMVPINChangeScriptData extends Operation {
    /**
     * BuildEMVPINChangeScriptData constructor.
     */
    constructor() {
        super();

        this.name = "EMV Build PIN Change Script Data";
        this.module = "Payment";
        this.description = "Assembles the 5-byte CHANGE REFERENCE DATA (INS=24) command header for a PIN-change issuer script. Use this as the first step in a recipe — the hex output feeds into the <b>EMV Generate MAC (PIN Change)</b> input field, which appends the encrypted PIN block before computing the MAC.<br><br><b>Output:</b> <code>CLA 24 P1 P2 Lc</code> (5 bytes). The Lc field must cover all data bytes that follow in the final APDU: typically 8 bytes for the encrypted PIN block plus 8 bytes for the MAC = 0x10.<br><br><b>P1:</b> 00 = change requires current PIN verification; 01 = change without verification.<br><b>P2:</b> PIN reference — 80 is the global PIN reference used by most EMV cards.<br><br><b>Security:</b> Software emulation for testing only.";
        this.inlineHelp = "<strong>Output:</strong> 5-byte CHANGE REFERENCE DATA header. Feed into EMV Generate MAC (PIN Change) as input.";
        this.testDataSamples = [
            {
                name: "PIN change header sample",
                input: "",
                args: ["84", "Change with current PIN verification", "80", "10", "Hex"]
            }
        ];
        this.infoURL = "https://en.wikipedia.org/wiki/EMV";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            { name: "CLA (hex)", type: "string", value: "84", comment: "Class byte. 84 = secure messaging with key from current DF (standard for issuer scripts)." },
            { name: "Change mode (P1)", type: "option", value: PIN_CHANGE_MODES, comment: "P1=00: change requires verification with the current PIN. P1=01: change without current PIN verification." },
            { name: "PIN reference (P2, hex)", type: "string", value: "80", comment: "PIN reference data qualifier. 80 = global PIN reference (most EMV cards). Check card spec for other values." },
            { name: "Lc (hex)", type: "string", value: "10", comment: "Total data length in the final APDU. Default 10 (hex) = 16 bytes: 8-byte encrypted PIN block + 8-byte MAC." },
            { name: "Output format", type: "option", value: ["Hex", "JSON", "Annotated"], comment: "Hex: header ready to chain. JSON: named fields. Annotated: field-by-field breakdown." },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [claHex, changeMode, p2Hex, lcHex, outputFormat] = args;
        const f = buildPinChangeHeader(claHex, changeMode, p2Hex, lcHex);
        if (outputFormat === "JSON") {
            return JSON.stringify({ cla: f.cla, ins: f.ins, p1: f.p1, p2: f.p2, lc: f.lc, header: f.header }, null, 4);
        }
        if (outputFormat === "Annotated") {
            return formatAnnotatedPinChangeHeader(f);
        }
        return f.header;
    }
}

export default BuildEMVPINChangeScriptData;
