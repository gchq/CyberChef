/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import { parseEmvTlv, EMV_TAG_DICTIONARY } from "../lib/EmvTlv.mjs";

/**
 * EMV Parse TLV operation.
 */
class ParseEMVTLV extends Operation {

    /** @inheritdoc */
    constructor() {
        super();

        this.name = "EMV Parse TLV";
        this.module = "Payment";
        this.description = "Parse hex-encoded BER-TLV data (e.g., DE 55 field, ICC response, terminal data, ARQC preimage in TLV form) and annotate each tag using the built-in EMV tag dictionary.<br><br><b>Input:</b> hex-encoded BER-TLV data.<br><b>Output:</b> JSON tree. Each record includes the tag hex value, name from the EMV tag dictionary, source (ICC / Terminal / Host / Both), value format, length, value in hex, and — for constructed tags — a <code>children</code> array with the recursively parsed inner TLVs.<br><br><b>Tag dictionary:</b> covers EMV Books 1–4, EMVCo contactless Book C, and common Nexo/acquirer tags (~90 entries). Unknown tags are decoded structurally but marked with name <code>Unknown</code>.<br><br><b>Constructed tags:</b> tags with the constructed bit set (e.g., <code>70</code>, <code>77</code>, <code>6F</code>, <code>A5</code>, <code>BF0C</code>) are recursively parsed into child arrays.<br><br><b>Note:</b> indefinite-length BER encoding is not supported; this covers the definite short- and long-form lengths used by all standard EMV cards.";
        this.inlineHelp = "<strong>Input:</strong> hex-encoded BER-TLV (DE 55, ICC response, GPO reply, etc.). Outputs annotated JSON with EMV tag names and nested children.";
        this.testDataSamples = [
            {
                name: "GPO response (Format 2): AIP=5900 + AFL",
                input: "770A82025900940408010401",
                args: [false]
            },
            {
                name: "DE 55 fragment: ARQC cryptogram tags",
                input: "9F2608A1B2C3D4E5F607089F2701809F360200019F10120110A0000F040000000000000000000000FF",
                args: [false]
            },
            {
                name: "Tag dictionary listing",
                input: "",
                args: [true]
            }
        ];
        this.infoURL = "https://en.wikipedia.org/wiki/EMV";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Show tag dictionary only",
                type: "boolean",
                value: false,
                comment: "When enabled, ignores input and prints the full EMV tag dictionary as JSON.",
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [dictionaryMode] = args;

        if (dictionaryMode) {
            const dict = {};
            for (const [tag, meta] of Object.entries(EMV_TAG_DICTIONARY)) {
                dict[tag] = { name: meta.name, constructed: meta.constructed, source: meta.source, format: meta.format, class: meta.class };
            }
            return JSON.stringify(dict, null, 4);
        }

        const parsed = parseEmvTlv(input);
        return JSON.stringify(parsed, null, 4);
    }
}

export default ParseEMVTLV;
