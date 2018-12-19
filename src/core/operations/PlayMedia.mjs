/**
 * @author anthony-arnold [anthony.arnold@uqconnect.edu.au]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import { fromBase64, toBase64 } from "../lib/Base64";
import { fromHex } from "../lib/Hex";
import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import Utils from "../Utils";
import Magic from "../lib/Magic";

/**
 * PlayMedia operation
 */
class PlayMedia extends Operation {

    /**
     * PlayMedia constructor
     */
    constructor() {
        super();

        this.name = "Play Media";
        this.module = "Media";
        this.description = "Plays the input as sound or video depending on the type.";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.presentType = "html";
        this.args = [
            {
                "name": "Input format",
                "type": "option",
                "value": ["Raw", "Base64", "Hex"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray} The multimedia data as bytes.
     */
    run(input, args) {
        const inputFormat = args[0];

        if (!input.length) return [];

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
        if (!(type && /^audio|video/.test(type.mime))) {
            throw new OperationError("Invalid file type");
        }

        return input;
    }

    /**
     * Displays an audio or video element that may be able to play the media
     * file.
     * @param data {byteArray} Data containing an audio or video file.
     * @returns {string} Markup to display a media player.
     */
    async present(data) {
        if (!data.length) return "";

        const type = Magic.magicFileType(data);
        const matches = /^audio|video/.exec(type.mime);
        if (!matches) {
            throw new OperationError("Invalid file type");
        }
        const dataURI = `data:${type.mime};base64,${toBase64(data)}`;
        const element = matches[0];

        let html = `<${element} src='${dataURI}' type='${type.mime}' controls>`;
        html += "<p>Unsupported media type.</p>";
        html += `</${element}>`;
        return html;
    }
}

export default PlayMedia;
