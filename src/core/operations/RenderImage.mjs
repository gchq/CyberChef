/**
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import { fromBase64, toBase64 } from "../lib/Base64";
import { fromHex } from "../lib/Hex";
import Operation from "../Operation";
import Utils from "../Utils";
import Magic from "../lib/Magic";

/**
 * Render Image operation
 */
class RenderImage extends Operation {

    /**
     * RenderImage constructor
     */
    constructor() {
        super();

        this.name = "Render Image";
        this.module = "Image";
        this.description = "Displays the input as an image. Supports the following formats:<br><br><ul><li>jpg/jpeg</li><li>png</li><li>gif</li><li>webp</li><li>bmp</li><li>ico</li></ul>";
        this.inputType = "string";
        this.outputType = "html";
        this.args = [
            {
                "name": "Input format",
                "type": "option",
                "value": ["Raw", "Base64", "Hex"]
            }
        ];
        this.patterns = [
            {
                "match": "^(?:\\xff\\xd8\\xff|\\x89\\x50\\x4e\\x47|\\x47\\x49\\x46|.{8}\\x57\\x45\\x42\\x50|\\x42\\x4d)",
                "flags": "",
                "args": [
                    "Raw"
                ],
                "useful": true
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {
        const inputFormat = args[0];
        let dataURI = "data:";

        if (!input.length) return "";

        // Convert input to raw bytes
        switch (inputFormat) {
            case "Hex":
                input = fromHex(input);
                break;
            case "Base64":
                // Don't trust the Base64 entered by the user.
                // Unwrap it first, then re-encode later.
                input = fromBase64(input, undefined, "byteArray");
                break;
            case "Raw":
            default:
                input = Utils.strToByteArray(input);
                break;
        }

        // Determine file type
        const type = Magic.magicFileType(input);
        if (type && type.mime.indexOf("image") === 0) {
            dataURI += type.mime + ";";
        } else {
            throw "Invalid file type";
        }

        // Add image data to URI
        dataURI += "base64," + toBase64(input);

        return "<img src='" + dataURI + "'>";
    }

}

export default RenderImage;
