/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { isImage } from "../lib/FileType.mjs";
import { toBase64 } from "../lib/Base64.mjs";
import { Jimp, JimpMime, PNGFilterType } from "jimp";

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
        this.description =
            "Converts an image between different formats. Supported formats:<br><ul><li>Joint Photographic Experts Group (JPEG)</li><li>Portable Network Graphics (PNG)</li><li>Bitmap (BMP)</li><li>Tagged Image File Format (TIFF)</li></ul><br>Note: GIF files are supported for input, but cannot be outputted.";
        this.infoURL = "https://wikipedia.org/wiki/Image_file_formats";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.presentType = "html";
        this.args = [
            {
                name: "Output Format",
                type: "option",
                value: ["JPEG", "PNG", "BMP", "TIFF"],
            },
            {
                name: "JPEG Quality",
                type: "number",
                value: 80,
                min: 1,
                max: 100,
            },
            {
                name: "PNG Filter Type",
                type: "option",
                value: ["Auto", "None", "Sub", "Up", "Average", "Paeth"],
            },
            {
                name: "PNG Deflate Level",
                type: "number",
                value: 9,
                min: 0,
                max: 9,
            },
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    async run(input, args) {
        const [format, jpegQuality, pngFilterType, pngDeflateLevel] = args;
        const formatMap = {
            JPEG: JimpMime.jpeg,
            PNG: JimpMime.png,
            BMP: JimpMime.bmp,
            TIFF: JimpMime.tiff,
        };

        const pngFilterMap = {
            Auto: PNGFilterType.AUTO,
            None: PNGFilterType.NONE,
            Sub: PNGFilterType.SUB,
            Up: PNGFilterType.UP,
            Average: PNGFilterType.AVERAGE,
            Paeth: PNGFilterType.PATH,
        };

        const mime = formatMap[format];

        if (!isImage(input)) {
            throw new OperationError("Invalid file format.");
        }
        let image;
        try {
            image = await Jimp.read(input);
        } catch (err) {
            throw new OperationError(`Error opening image file. (${err})`);
        }
        try {
            let buffer;
            switch (mime) {
                case JimpMime.jpeg:
                    buffer = await image.getBuffer(mime, {
                        quality: jpegQuality,
                    });
                    break;
                case JimpMime.png:
                    buffer = await image.getBuffer(mime, {
                        filterType: pngFilterMap[pngFilterType],
                        deflateLevel: pngDeflateLevel,
                    });
                    break;
                default:
                    buffer = await image.getBuffer(mime);
                    break;
            }

            return buffer.buffer;
        } catch (err) {
            throw new OperationError(`Error converting image format. (${err})`);
        }
    }

    /**
     * Displays the converted image using HTML for web apps
     *
     * @param {ArrayBuffer} data
     * @returns {html}
     */
    present(data) {
        if (!data.byteLength) return "";
        const dataArray = new Uint8Array(data);

        const type = isImage(dataArray);
        if (!type) {
            throw new OperationError("Invalid file type.");
        }

        return `<img src="data:${type};base64,${toBase64(dataArray)}">`;
    }
}

export default ConvertImageFormat;
