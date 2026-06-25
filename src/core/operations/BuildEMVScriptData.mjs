/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import { SCRIPT_COMMANDS, buildScriptApdu, formatAnnotatedApdu } from "../lib/EmvScript.mjs";

/**
 * Build EMV Script Data operation.
 */
class BuildEMVScriptData extends Operation {
    /**
     * BuildEMVScriptData constructor.
     */
    constructor() {
        super();

        this.name = "EMV Build Script Data";
        this.module = "Payment";
        this.description = "Assembles an issuer-script command APDU from named fields. Use this as the first step in a recipe chain — the hex output feeds directly into the <b>EMV Generate MAC</b> input field.<br><br><b>Output:</b> <code>CLA | INS | P1 | P2 | Lc | Data</code> — Lc is computed automatically from the data length.<br><br><b>Common INS values:</b> DA=PUT DATA, DB=PUT DATA (ODD), DC=UPDATE RECORD, D6=WRITE BINARY, 26=DISABLE VERIFICATION, 28=ENABLE VERIFICATION, 82=EXTERNAL AUTHENTICATE.<br><br><b>Security:</b> Software emulation for testing only.";
        this.inlineHelp = "<strong>Output:</strong> CLA INS P1 P2 Lc Data APDU hex. Feed into EMV Generate MAC as input.";
        this.testDataSamples = [
            {
                name: "PUT DATA sample",
                input: "",
                args: ["84", "PUT DATA", "00", "42", "0102030405060708090A", "Hex"]
            }
        ];
        this.infoURL = "https://en.wikipedia.org/wiki/EMV";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            { name: "CLA (hex)", type: "string", value: "84", comment: "Class byte. 84 = secure messaging with key from current DF (standard for issuer scripts)." },
            { name: "Command", type: "option", value: SCRIPT_COMMANDS, comment: "Selects the INS byte. Common issuer script commands: PUT DATA (DA/DB), UPDATE RECORD (DC), WRITE BINARY (D6)." },
            { name: "P1 (hex)", type: "string", value: "00", comment: "Parameter 1. Meaning depends on command: record number for UPDATE RECORD, data reference for PUT DATA." },
            { name: "P2 (hex)", type: "string", value: "00", comment: "Parameter 2. Meaning depends on command: SFI+record selector for UPDATE RECORD, data object tag low byte for PUT DATA." },
            { name: "Data (hex)", type: "string", value: "", comment: "Command data payload. Lc is computed automatically from the length." },
            { name: "Output format", type: "option", value: ["Hex", "JSON", "Annotated"], comment: "Hex: APDU ready to chain. JSON: named fields. Annotated: field-by-field breakdown." },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [claHex, commandName, p1Hex, p2Hex, dataHex, outputFormat] = args;
        const f = buildScriptApdu(claHex, commandName, p1Hex, p2Hex, dataHex);
        if (outputFormat === "JSON") {
            return JSON.stringify({ cla: f.cla, ins: f.ins, p1: f.p1, p2: f.p2, lc: f.lc, data: f.data, apdu: f.apdu }, null, 4);
        }
        if (outputFormat === "Annotated") {
            return formatAnnotatedApdu(f);
        }
        return f.apdu;
    }
}

export default BuildEMVScriptData;
