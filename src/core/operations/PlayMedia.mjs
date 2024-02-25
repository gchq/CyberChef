/**
 * @author anthony-arnold [anthony.arnold@uqconnect.edu.au]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import { fromBase64, toBase64 } from "../lib/Base64.mjs";
import { fromHex } from "../lib/Hex.mjs";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import { isType, detectFileType } from "../lib/FileType.mjs";

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
        this.module = "Default";
        this.description
            = "Plays the input as audio or video depending on the type.<br><br>Tags: sound, movie, mp3, mp4, mov, webm, wav, ogg";
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
        const [inputFormat] = args;

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
        if (!isType(/^(audio|video)/, input)) {
            throw new OperationError("Invalid or unrecognised file type");
        }

        return input;
    }

    /**
     * Displays an audio or video element that may be able to play the media
     * file.
     *
     * @param {byteArray} data Data containing an audio or video file.
     * @returns {string} Markup to display a media player.
     */
    async present(data) {
        if (!data.length) return "";

        const types = detectFileType(data);
        const matches = /^audio|video/.exec(types[0].mime);
        if (!matches) {
            throw new OperationError("Invalid file type");
        }
        const dataURI = `data:${types[0].mime};base64,${toBase64(data)}`;
        const element = matches[0];

        let html = `<${element} src='${dataURI}' type='${types[0].mime}' controls>`;
        html += "<p>Unsupported media type.</p>";
        html += `</${element}>`;
        return html;
    }
}

export default PlayMedia;
