/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import { isImage } from "../lib/FileType";
import { toBase64 } from "../lib/Base64";
import jimp from "jimp";

/**
 * Convert Image Format operation
 */
class ConvertImageFormat extends Operation {

    /**
     * ConvertImageFormat constructor
     */
    constructor() {
        super();

        this.name = "Convert Image Format";
        this.module = "Image";
        this.description = "Converts an image between different formats. Supported formats:<br><ul><li>Joint Photographic Experts Group (JPEG)</li><li>Portable Network Graphics (PNG)</li><li>Bitmap (BMP)</li><li>Tagged Image File Format (TIFF)</li></ul><br>Note: GIF files are supported for input, but cannot be outputted.";
        this.infoURL = "https://wikipedia.org/wiki/Image_file_formats";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.presentType = "html";
        this.args = [
            {
                name: "Output Format",
                type: "option",
                value: [
                    "JPEG",
                    "PNG",
                    "BMP",
                    "TIFF"
                ]
            },
            {
                name: "JPEG Quality",
                type: "number",
                value: 80,
                min: 1,
                max: 100
            },
            {
                name: "PNG Filter Type",
                type: "option",
                value: [
                    "Auto",
                    "None",
                    "Sub",
                    "Up",
                    "Average",
                    "Paeth"
                ]
            },
            {
                name: "PNG Deflate Level",
                type: "number",
                value: 9,
                min: 0,
                max: 9
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    async run(input, args) {
        const [format, jpegQuality, pngFilterType, pngDeflateLevel] = args;
        const formatMap = {
            "JPEG": jimp.MIME_JPEG,
            "PNG": jimp.MIME_PNG,
            "BMP": jimp.MIME_BMP,
            "TIFF": jimp.MIME_TIFF
        };

        const pngFilterMap = {
            "Auto": jimp.PNG_FILTER_AUTO,
            "None": jimp.PNG_FILTER_NONE,
            "Sub": jimp.PNG_FILTER_SUB,
            "Up": jimp.PNG_FILTER_UP,
            "Average": jimp.PNG_FILTER_AVERAGE,
            "Paeth": jimp.PNG_FILTER_PATH // Incorrect spelling in Jimp library
        };

        const mime = formatMap[format];

        if (!isImage(input)) {
            throw new OperationError("Invalid file format.");
        }
        let image;
        try {
            image = await jimp.read(Buffer.from(input));
        } catch (err) {
            throw new OperationError(`Error opening image file. (${err})`);
        }
        try {
            switch (format) {
                case "JPEG":
                    image.quality(jpegQuality);
                    break;
                case "PNG":
                    image.filterType(pngFilterMap[pngFilterType]);
                    image.deflateLevel(pngDeflateLevel);
                    break;
            }

            const imageBuffer = await image.getBufferAsync(mime);
            return [...imageBuffer];
        } catch (err) {
            throw new OperationError(`Error converting image format. (${err})`);
        }
    }

    /**
     * Displays the converted image using HTML for web apps
     *
     * @param {byteArray} data
     * @returns {html}
     */
    present(data) {
        if (!data.length) return "";

        const type = isImage(data);
        if (!type) {
            throw new OperationError("Invalid image type.");
        }

        return `<img src="data:${type};base64,${toBase64(data)}">`;
    }

}

export default ConvertImageFormat;
