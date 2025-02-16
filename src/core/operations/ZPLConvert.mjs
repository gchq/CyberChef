/**
 * @author william-davis-dev
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Convert Label ZPL Into Usable Formats
 */
class ZPLConvert extends Operation {

    /**
     * ZPLConvert constructor
     */
    constructor() {
        super();

        this.name = "ZPL Converter";
        this.module = "Default";
        this.description = [
            "Takes a ZPL (Zebra Printer Language) string and renders it into a png.",
            "<br><br>",
            "Uses the  <a href='https://labelary.com/service.html'>Labelary</a> API for full support of all ZPL instructions.",
            "<br><br>",
            "Use the 'Render Image' operation to see the final label output."
        ].join("\n");
        this.infoURL = "https://en.wikipedia.org/wiki/Zebra_Programming_Language";
        this.inputType = "string";
        this.outputType = "ArrayBuffer";
        this.manualBake = true;
        this.args = [
            {
                name: "Width",
                type: "number",
                value: 4
            },
            {
                name: "Height",
                type: "number",
                value: 6
            },
            {
                name: "Label Index",
                type: "number",
                value: 0
            },
            {
                name: "Label Resolution",
                type: "option",
                value: [
                    "6 dpmm (152 dpi)",
                    "8 dpmm (203 dpi)",
                    "12 dpmm (300 dpi)",
                    "24 dpmm (600 dpi)"
                ],
                defaultIndex: 1
            },
            {
                name: "Labelary Endpoint",
                type: "text",
                value: "https://api.labelary.com"
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        const [widthArg, heightArg, index, labelResolutionArg, labelaryApi] = args;
        // The first segment of the resolution arg is the numeric indicator of the resolution
        const labelResolution = labelResolutionArg.toString().split(" ")[0];

        const labelaryUrl = `${labelaryApi}/v1/printers/${labelResolution}dpmm/labels/${widthArg}x${heightArg}/${index}`;

        return fetch(labelaryUrl, {
            method: "POST",
            headers: {"accept": "image/png", "Content-Type": "application/x-www-form-urlencoded"},
            body: input,
        }).then(response => {
            if (!response.ok) {
                return response.text()
                    .then(text => {
                        throw new OperationError(text);
                    });
            }
            return response.blob();
        }).then(blob => {
            return blob.arrayBuffer();
        }).then(data => {
            return data;
        }).catch(e => {
            throw new OperationError(`Error making request to ${labelaryUrl} with message: ${e.toString()}`);
        });

    }
}

export default ZPLConvert;
