/**
 * @author Shailendra [singhshailendra.in]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import { fromBase64, toBase64 } from "../lib/Base64.mjs";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";

/**
 * Render PDF operation
 */
class RenderPDF extends Operation {

    /**
     * RenderPDF constructor
     */
    constructor() {
        super();

        this.name = "Render PDF";
        this.module = "File";
        this.description = "Displays the input as a PDF preview. Supports Raw and Base64 input formats.";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.presentType = "html";
        this.args = [
            {
                "name": "Input format",
                "type": "option",
                "value": ["Base64", "Raw"],
            }
        ];
        this.checks = [
            {
                pattern: "^%PDF-",
                flags: "",
                args: ["Raw"],
                useful: true,
                output: {
                    mime: "application/pdf"
                }
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const inputFormat = args[0];

        if (!input.length) return [];

        // Convert input to raw bytes
        switch (inputFormat) {
            case "Base64":
                input = fromBase64(input, undefined, "byteArray");
                break;
            case "Raw":
            default:
                input = Utils.strToByteArray(input);
                break;
        }

        // Check PDF signature
        if (
            input[0] !== 0x25 || // %
            input[1] !== 0x50 || // P
            input[2] !== 0x44 || // D
            input[3] !== 0x46    // F
        ) {
            throw new OperationError("Input does not appear to be a PDF file.");
        }

        return input;
    }

    /**
     * Displays the PDF using HTML for web apps.
     *
     * @param {byteArray} data
     * @returns {html}
     */
    async present(data) {
        if (!data.length) return "";

        const base64 = toBase64(data);
        const dataURI = "data:application/pdf;base64," + base64;

        return `<iframe src="${dataURI}" style="width:100%;height:100%;border:1px solid #ccc;"></iframe>`;
    }

}

export default RenderPDF;
