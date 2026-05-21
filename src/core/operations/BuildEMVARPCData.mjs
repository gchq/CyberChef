/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import {
    METHODS, METHOD1, METHOD2,
    buildMethod1, buildMethod2,
    formatJson, formatAnnotated,
} from "../lib/EmvArpc.mjs";

/**
 * EMV Build ARPC Data operation.
 */
class BuildEMVARPCData extends Operation {

    constructor() {
        super();

        this.name = "EMV Build ARPC Data";
        this.module = "Payment";
        this.description = "Assemble the EMV authorization-response preimage from named fields and output it as hex for use with <b>EMV Generate ARPC</b>. All data comes from arguments — the input field is not used.<br><br><b>Method 1</b> (Visa, Amex, Discover, JCB): <code>ARQC (8 bytes) || ARC (2 bytes)</code> — 10 bytes total.<br><b>Method 2</b> (Mastercard M/Chip): <code>ARQC (8 bytes) || CSU (4 bytes) || ProprietaryAuthData (0–8 bytes)</code> — 12–20 bytes total.<br><br><b>Input:</b> ignored.<br><b>Arguments:</b> method selector plus one field per preimage element. Fields irrelevant to the selected method are ignored.<br><br><b>Chaining:</b> set Output format to <b>Hex</b> and place this operation first in a recipe to supply the preimage directly into <b>EMV Generate ARPC</b>.";
        this.inlineHelp = "<strong>Args:</strong> select method (1 = Visa/Amex, 2 = Mastercard) and fill the relevant fields. Set format to <strong>Hex</strong> to chain into EMV Generate ARPC.";
        this.testDataSamples = [
            {
                name: "Method 1 (Visa/Amex) — hex output",
                input: "",
                args: [METHOD1, "A1B2C3D4E5F60708", "5931", "00000000", "", "Hex"]
            },
            {
                name: "Method 2 (Mastercard) — hex output",
                input: "",
                args: [METHOD2, "A1B2C3D4E5F60708", "5931", "00000000", "", "Hex"]
            },
            {
                name: "Method 2 with Proprietary Auth Data — annotated",
                input: "",
                args: [METHOD2, "A1B2C3D4E5F60708", "5931", "00000000", "AABBCCDD", "Annotated"]
            },
        ];
        this.infoURL = "https://en.wikipedia.org/wiki/EMV";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "ARPC method",
                type: "option",
                value: METHODS,
                comment: "Method 1: Visa, Amex, Discover, JCB. Method 2: Mastercard M/Chip.",
            },
            {
                name: "ARQC (hex, 8 bytes)",
                type: "string",
                value: "",
                comment: "Authorization Request Cryptogram — output of EMV Generate ARQC.",
            },
            {
                name: "ARC (hex, 2 bytes) — Method 1",
                type: "string",
                value: "3030",
                comment: "Authorization Response Code. Common values: 3030=00, 5931=Y1 (approve), 5933=Y3, 5A31=Z1 (decline). Used only for Method 1.",
            },
            {
                name: "Card Status Update / CSU (hex, 4 bytes) — Method 2",
                type: "string",
                value: "00000000",
                comment: "Issuer response flags for PIN change/unblock and go-online. Used only for Method 2.",
            },
            {
                name: "Proprietary Auth Data (hex, 0–8 bytes) — Method 2",
                type: "string",
                value: "",
                comment: "Optional scheme-specific data appended after CSU. Leave empty if not used. Used only for Method 2.",
            },
            {
                name: "Output format",
                type: "option",
                value: ["Hex", "JSON", "Annotated"],
                comment: "Hex: flat hex for piping into EMV Generate ARPC. JSON/Annotated: human-readable inspection.",
            },
        ];
    }

    /**
     * @param {string} input ignored
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [method, arqc, arc, csu, pad, fmt] = args;

        const { fields, hex } = method === METHOD2
            ? buildMethod2(arqc, csu, pad)
            : buildMethod1(arqc, arc);

        if (fmt === "JSON")      return formatJson(fields, method);
        if (fmt === "Annotated") return formatAnnotated(fields, method);
        return hex;
    }
}

export default BuildEMVARPCData;
