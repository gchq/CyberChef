/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import {
    METHODS, METHOD1, METHOD2,
    parseMethod1, parseMethod2,
    formatJson, formatAnnotated,
} from "../lib/EmvArpc.mjs";

/**
 * EMV Parse ARPC Data operation.
 */
class ParseEMVARPCData extends Operation {

    /** @inheritdoc */
    constructor() {
        super();

        this.name = "EMV Parse ARPC Data";
        this.module = "Payment";
        this.description = "Parse a preassembled EMV authorization-response preimage and display each field by name. Inverse of <b>EMV Build ARPC Data</b>.<br><br><b>Method 1</b> (Visa, Amex, Discover, JCB): expects exactly 20 hex chars (10 bytes) — <code>ARQC || ARC</code>.<br><b>Method 2</b> (Mastercard M/Chip): expects 24–40 hex chars (12–20 bytes) — <code>ARQC || CSU || [ProprietaryAuthData]</code>.<br><br><b>Input:</b> preassembled ARPC data as hex.<br><b>Arguments:</b> method selector and output format.";
        this.inlineHelp = "<strong>Input:</strong> hex ARPC preimage. Select method to control field layout. Inverse of EMV Build ARPC Data.";
        this.testDataSamples = [
            {
                name: "Method 1 parse (ARQC + ARC)",
                input: "A1B2C3D4E5F607085931",
                args: [METHOD1, "Annotated"]
            },
            {
                name: "Method 2 parse (ARQC + CSU)",
                input: "A1B2C3D4E5F6070800000000",
                args: [METHOD2, "Annotated"]
            },
            {
                name: "Method 2 parse with Proprietary Auth Data",
                input: "A1B2C3D4E5F60708000000 00AABBCCDD",
                args: [METHOD2, "JSON"]
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
                comment: "Method 1: Visa, Amex, Discover, JCB (10 bytes). Method 2: Mastercard M/Chip (12–20 bytes).",
            },
            {
                name: "Output format",
                type: "option",
                value: ["Annotated", "JSON"],
                comment: "Annotated: one line per field with name, value, and length. JSON: key-value object.",
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [method, fmt] = args;
        const { fields } = method === METHOD2 ? parseMethod2(input) : parseMethod1(input);
        return fmt === "JSON" ? formatJson(fields, method) : formatAnnotated(fields, method);
    }
}

export default ParseEMVARPCData;
