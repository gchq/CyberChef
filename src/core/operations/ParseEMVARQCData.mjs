/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import { parseCdol1, formatJson, formatAnnotatedTlv } from "../lib/EmvCdol.mjs";

/**
 * EMV Parse ARQC Data operation.
 */
class ParseEMVARQCData extends Operation {

    /** @inheritdoc */
    constructor() {
        super();

        this.name = "EMV Parse ARQC Data";
        this.module = "Payment";
        this.description = "Parse a preassembled EMV ARQC input data block (standard 10-field CDOL1, 33 bytes) and display each field by name and tag.<br><br><b>Input:</b> preassembled ARQC data as hex (66 hex chars / 33 bytes).<br><b>Arguments:</b> output format.<br><br><b>Network coverage:</b> the 10-field layout is identical across Visa, Mastercard, Amex, Discover, JCB, and UnionPay acquirer flows. Use this as the inverse of <b>EMV Build ARQC Data</b>.";
        this.inlineHelp = "<strong>Input:</strong> 33-byte CDOL1 hex block. Inverse of EMV Build ARQC Data.";
        this.testDataSamples = [
            {
                name: "Standard CDOL1 parse — annotated TLV",
                input: "000000001000000000000000084000000000000840260521 00A1B2C3D459000001",
                args: ["Annotated TLV"]
            },
            {
                name: "Standard CDOL1 parse — JSON",
                input: "000000001000000000000000084000000000000840260521 00A1B2C3D459000001",
                args: ["JSON"]
            },
        ];
        this.infoURL = "https://en.wikipedia.org/wiki/EMV";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Output format",
                type: "option",
                value: ["Annotated TLV", "JSON"],
                comment: "Annotated TLV: one line per field with tag, length, value, and name. JSON: key-value object.",
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [fmt] = args;
        const parsed = parseCdol1(input);
        return fmt === "JSON" ? formatJson(parsed) : formatAnnotatedTlv(parsed);
    }
}

export default ParseEMVARQCData;
