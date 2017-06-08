import * as ExifParser from "exif-parser";
import removeEXIF from "../lib/remove-exif.js";
import Utils from "../Utils.js";
import FileType from "./FileType.js";


/**
 * Image operations.
 *
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 *
 * @namespace
 */
const Image = {

    /**
     * Extract EXIF operation.
     *
     * Extracts EXIF data from a byteArray, representing a JPG or a TIFF image.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runEXIF(input, args) {
        try {
            const bytes = Uint8Array.from(input);
            const parser = ExifParser.create(bytes.buffer);
            const result = parser.parse();

            let lines = [];
            for (let tagName in result.tags) {
                let value = result.tags[tagName];
                lines.push(`${tagName}: ${value}`);
            }

            const numTags = lines.length;
            lines.unshift(`Found ${numTags} tags.\n`);
            return lines.join("\n");
        } catch (err) {
            throw "Could not extract EXIF data from image: " + err;
        }
    },

    /**
     * Remove EXIF operation.
     *
     * Removes EXIF data from a byteArray, representing a JPG.
     *
     * @author David Moodie [davidmoodie12@gmail.com]
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    removeEXIF(input, args) {
        // Do nothing if input is empty
        if (input.length === 0) return input;

        try {
            return removeEXIF(input);
        } catch (err) {
            // Simply return input if no EXIF data is found
            if (err === "Exif not found.") return input;
            throw "Could not remove EXIF data from image: " + err;
        }
    },

    /**
     * @constant
     * @default
     */
    INPUT_FORMAT: ["Raw", "Base64", "Hex"],

    /**
     * Render Image operation.
     *
     * @author n1474335 [n1474335@gmail.com]
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    runRenderImage(input, args) {
        const inputFormat = args[0];
        let dataURI = "data:";

        if (!input.length) return "";

        // Convert input to raw bytes
        switch (inputFormat) {
            case "Hex":
                input = Utils.fromHex(input);
                break;
            case "Base64":
                // Don't trust the Base64 entered by the user.
                // Unwrap it first, then re-encode later.
                input = Utils.fromBase64(input, null, "byteArray");
                break;
            case "Raw":
            default:
                input = Utils.strToByteArray(input);
                break;
        }

        // Determine file type
        const type = FileType.magicType(input);
        if (type && type.mime.indexOf("image") === 0) {
            dataURI += type.mime + ";";
        } else {
            throw "Invalid file type";
        }

        // Add image data to URI
        dataURI += "base64," + Utils.toBase64(input);

        return "<img src='" + dataURI + "'>";
    },

};

export default Image;
