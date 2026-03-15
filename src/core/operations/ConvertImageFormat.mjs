/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { isImage } from "../lib/FileType.mjs";
import { toBase64 } from "../lib/Base64.mjs";
import { Jimp, JimpMime, PNGFilterType } from "../lib/Jimp.mjs";

function canTranscodeViaCanvas() {
    return (
        typeof globalThis !== "undefined" &&
        typeof globalThis.Blob !== "undefined" &&
        typeof globalThis.createImageBitmap === "function" &&
        (typeof globalThis.OffscreenCanvas !== "undefined" ||
            (typeof globalThis.document !== "undefined" &&
                typeof globalThis.document.createElement === "function"))
    );
}

async function transcodeViaCanvas(input, inputMime, outputMime, quality) {
    const { Blob: BlobCtor, createImageBitmap: createImageBitmapFn, OffscreenCanvas: OffscreenCanvasCtor, document } =
        globalThis;

    const inputBytes = input instanceof ArrayBuffer ? new Uint8Array(input) : input;
    const inputBlob = new BlobCtor([inputBytes], { type: inputMime });

    const bitmap = await createImageBitmapFn(inputBlob);
    try {
        let canvas;
        if (typeof OffscreenCanvasCtor !== "undefined") {
            canvas = new OffscreenCanvasCtor(bitmap.width, bitmap.height);
        } else {
            if (!document) throw new Error("Canvas API not available");
            canvas = document.createElement("canvas");
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Unable to initialise canvas context");

        if (outputMime === "image/jpeg" || outputMime === "image/webp") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, bitmap.width, bitmap.height);
        }

        ctx.drawImage(bitmap, 0, 0);

        let outputBlob;
        if (typeof canvas.convertToBlob === "function") {
            outputBlob = await canvas.convertToBlob({
                type: outputMime,
                quality: quality ? quality / 100 : undefined,
            });
        } else if (typeof canvas.toBlob === "function") {
            outputBlob = await new Promise((resolve, reject) => {
                canvas.toBlob(
                    blob => (blob ? resolve(blob) : reject(new Error("Canvas encode failed"))),
                    outputMime,
                    quality ? quality / 100 : undefined
                );
            });
        } else {
            throw new Error("Canvas encoding not supported");
        }

        return await outputBlob.arrayBuffer();
    } finally {
        if (bitmap && typeof bitmap.close === "function") {
            bitmap.close();
        }
    }
}

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
            "Converts an image between different formats. Supported output formats:<br><ul><li>Joint Photographic Experts Group (JPEG)</li><li>Portable Network Graphics (PNG)</li><li>Bitmap (BMP)</li><li>Tagged Image File Format (TIFF)</li><li>WebP</li></ul><br>Note: GIF files are supported for input, but cannot be outputted.";
        this.infoURL = "https://wikipedia.org/wiki/Image_file_formats";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.presentType = "html";
        this.args = [
            {
                name: "Output Format",
                type: "option",
                value: ["JPEG", "PNG", "BMP", "TIFF", "WEBP"],
            },
            {
                name: "Quality (JPEG/WebP)",
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
        const [format, quality, pngFilterType, pngDeflateLevel] = args;
        const formatMap = {
            JPEG: JimpMime.jpeg,
            PNG: JimpMime.png,
            BMP: JimpMime.bmp,
            TIFF: JimpMime.tiff,
            WEBP: "image/webp",
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

        const inputMime = isImage(input);
        if (!inputMime) {
            throw new OperationError("Invalid file format.");
        }

        if (
            inputMime === "image/webp" &&
            (mime === JimpMime.jpeg || mime === JimpMime.png) &&
            canTranscodeViaCanvas()
        ) {
            try {
                let outputMime;
                if (mime === JimpMime.jpeg) outputMime = "image/jpeg";
                else if (mime === "image/webp") outputMime = "image/webp";
                else outputMime = "image/png";

                return await transcodeViaCanvas(input, inputMime, outputMime, quality);
            } catch (err) {
                // If canvas fails, we can fall back to Jimp
            }
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
                case "image/webp":
                    buffer = await image.getBuffer(mime, {
                        quality: quality,
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
