/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import { buildCdol1, formatHex, formatJson, formatAnnotatedTlv } from "../lib/EmvCdol.mjs";

/**
 * EMV Build ARQC Data operation.
 */
class BuildEMVARQCData extends Operation {

    constructor() {
        super();

        this.name = "EMV Build ARQC Data";
        this.module = "Payment";
        this.description = "Assemble the 10 standard EMVCo CDOL1 fields into the preassembled ARQC input data block used as input to <b>EMV Generate ARQC</b> and <b>EMV Verify ARQC</b>. All data comes from arguments — the input field is not used.<br><br><b>Input:</b> ignored.<br><b>Arguments:</b> one hex field per CDOL1 element plus an output format selector.<br><br><b>Network coverage:</b> the 10-field, 33-byte layout is identical across Visa, Mastercard, Amex, Discover, JCB, and UnionPay acquirer flows. Network differences (Visa/Amex Option A vs Mastercard Option B session-key derivation) occur upstream in key derivation and do not affect the CDOL1 data block structure.<br><br><b>Chaining:</b> set Output format to <b>Hex</b> and place this operation first in a recipe to supply the preimage directly into <b>EMV Generate ARQC</b> without using the input field.";
        this.inlineHelp = "<strong>Args:</strong> one hex field per CDOL1 element. Set format to <strong>Hex</strong> to chain into EMV Generate ARQC.";
        this.testDataSamples = [
            {
                name: "Standard CDOL1 — hex output (Visa $10.00 USD, USA terminal)",
                input: "",
                args: [
                    "000000001000",
                    "000000000000",
                    "0840",
                    "0000000000",
                    "0840",
                    "260521",
                    "00",
                    "A1B2C3D4",
                    "5900",
                    "0001",
                    "Hex",
                ]
            },
            {
                name: "Standard CDOL1 — annotated TLV",
                input: "",
                args: [
                    "000000001000",
                    "000000000000",
                    "0840",
                    "0000000000",
                    "0840",
                    "260521",
                    "00",
                    "A1B2C3D4",
                    "5900",
                    "0001",
                    "Annotated TLV",
                ]
            },
        ];
        this.infoURL = "https://en.wikipedia.org/wiki/EMV";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            { name: "Amount Authorised (9F02)",         type: "string", value: "000000001000", comment: "6-byte BCD minor-unit amount, e.g. 000000001000 = $10.00" },
            { name: "Amount Other (9F03)",              type: "string", value: "000000000000", comment: "6-byte BCD cashback amount; 000000000000 if none" },
            { name: "Terminal Country Code (9F1A)",     type: "string", value: "0840",         comment: "ISO 3166-1 numeric, e.g. 0840 = USA" },
            { name: "TVR (95)",                         type: "string", value: "0000000000",   comment: "5-byte Terminal Verification Results" },
            { name: "Transaction Currency Code (5F2A)", type: "string", value: "0840",         comment: "ISO 4217 numeric, e.g. 0840 = USD" },
            { name: "Transaction Date (9A)",            type: "string", value: "260521",       comment: "3-byte YYMMDD, e.g. 260521 = 2026-05-21" },
            { name: "Transaction Type (9C)",            type: "string", value: "00",           comment: "1-byte EMV type: 00 = Purchase, 01 = Cash, 09 = Cashback" },
            { name: "Unpredictable Number (9F37)",      type: "string", value: "00000000",     comment: "4-byte terminal random; use a real random value in production flows" },
            { name: "AIP (82)",                        type: "string", value: "5900",         comment: "2-byte Application Interchange Profile" },
            { name: "ATC (9F36)",                      type: "string", value: "0001",         comment: "2-byte Application Transaction Counter" },
            {
                name: "Output format",
                type: "option",
                value: ["Hex", "JSON", "Annotated TLV"],
                comment: "Hex: flat hex suitable for piping into EMV Generate ARQC. JSON/Annotated TLV: human-readable inspection.",
            },
        ];
    }

    /**
     * @param {string} input ignored
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [
            amountAuth, amountOther, countryCode, tvr, currencyCode,
            txDate, txType, unpredictable, aip, atc,
            fmt,
        ] = args;

        const parsed = buildCdol1([
            amountAuth, amountOther, countryCode, tvr, currencyCode,
            txDate, txType, unpredictable, aip, atc,
        ]);

        if (fmt === "JSON")         return formatJson(parsed);
        if (fmt === "Annotated TLV") return formatAnnotatedTlv(parsed);
        return formatHex(parsed);
    }
}

export default BuildEMVARQCData;
