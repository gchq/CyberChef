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
 * Add Text To Image operation
 */
class AddTextToImage extends Operation {

    /**
     * AddTextToImage constructor
     */
    constructor() {
        super();

        this.name = "Add Text To Image";
        this.module = "Image";
        this.description = "Adds text onto an image.<br><br>Text can be horizontally or vertically aligned, or the position can be manually specified.<br>Variants of the Roboto font face are available in any size or colour.<br><br>Note: This may cause a degradation in image quality, especially when using font sizes larger than 72.";
        this.infoURL = "";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.presentType = "html";
        this.args = [
            {
                name: "Text",
                type: "string",
                value: ""
            },
            {
                name: "Horizontal align",
                type: "option",
                value: ["None", "Left", "Center", "Right"]
            },
            {
                name: "Vertical align",
                type: "option",
                value: ["None", "Top", "Middle", "Bottom"]
            },
            {
                name: "X position",
                type: "number",
                value: 0
            },
            {
                name: "Y position",
                type: "number",
                value: 0
            },
            {
                name: "Size",
                type: "number",
                value: 32,
                min: 8
            },
            {
                name: "Font face",
                type: "option",
                value: [
                    "Roboto",
                    "Roboto Black",
                    "Roboto Mono",
                    "Roboto Slab"
                ]
            },
            {
                name: "Red",
                type: "number",
                value: 255,
                min: 0,
                max: 255
            },
            {
                name: "Green",
                type: "number",
                value: 255,
                min: 0,
                max: 255
            },
            {
                name: "Blue",
                type: "number",
                value: 255,
                min: 0,
                max: 255
            },
            {
                name: "Alpha",
                type: "number",
                value: 255,
                min: 0,
                max: 255
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    async run(input, args) {
        const text = args[0],
            hAlign = args[1],
            vAlign = args[2],
            size = args[5],
            fontFace = args[6],
            red = args[7],
            green = args[8],
            blue = args[9],
            alpha = args[10];

        let xPos = args[3],
            yPos = args[4];

        if (!isImage(new Uint8Array(input))) {
            throw new OperationError("Invalid file type.");
        }

        let image;
        try {
            image = await jimp.read(input);
        } catch (err) {
            throw new OperationError(`Error loading image. (${err})`);
        }
        try {
            if (ENVIRONMENT_IS_WORKER())
                self.sendStatusMessage("Adding text to image...");

            const fontsMap = {};
            const fonts = [
                import(/* webpackMode: "eager" */ "../../web/static/fonts/bmfonts/Roboto72White.fnt"),
                import(/* webpackMode: "eager" */ "../../web/static/fonts/bmfonts/RobotoBlack72White.fnt"),
                import(/* webpackMode: "eager" */ "../../web/static/fonts/bmfonts/RobotoMono72White.fnt"),
                import(/* webpackMode: "eager" */ "../../web/static/fonts/bmfonts/RobotoSlab72White.fnt")
            ];

            await Promise.all(fonts)
                .then(fonts => {
                    fontsMap.Roboto = fonts[0];
                    fontsMap["Roboto Black"] = fonts[1];
                    fontsMap["Roboto Mono"] = fonts[2];
                    fontsMap["Roboto Slab"] = fonts[3];
                });


            // Make Webpack load the png font images
            const fontImages = [
                import(/* webpackMode: "eager" */ "../../web/static/fonts/bmfonts/Roboto72White.png"),
                import(/* webpackMode: "eager" */ "../../web/static/fonts/bmfonts/RobotoSlab72White.png"),
                import(/* webpackMode: "eager" */ "../../web/static/fonts/bmfonts/RobotoMono72White.png"),
                import(/* webpackMode: "eager" */ "../../web/static/fonts/bmfonts/RobotoBlack72White.png")
            ];

            await Promise.all(fontImages);

            const font = fontsMap[fontFace];

            // LoadFont needs an absolute url, so append the font name to self.docURL
            const jimpFont = await jimp.loadFont(self.docURL + "/" + font.default);

            jimpFont.pages.forEach(function(page) {
                if (page.bitmap) {
                    // Adjust the RGB values of the image pages to change the font colour.
                    const pageWidth = page.bitmap.width;
                    const pageHeight = page.bitmap.height;
                    for (let ix = 0; ix < pageWidth; ix++) {
                        for (let iy = 0; iy < pageHeight; iy++) {
                            const idx = (iy * pageWidth + ix) << 2;

                            const newRed = page.bitmap.data[idx] - (255 - red);
                            const newGreen = page.bitmap.data[idx + 1] - (255 - green);
                            const newBlue = page.bitmap.data[idx + 2] - (255 - blue);
                            const newAlpha = page.bitmap.data[idx + 3] - (255 - alpha);

                            // Make sure the bitmap values don't go below 0 as that makes jimp very unhappy
                            page.bitmap.data[idx] = (newRed > 0) ? newRed : 0;
                            page.bitmap.data[idx + 1] = (newGreen > 0) ? newGreen : 0;
                            page.bitmap.data[idx + 2] = (newBlue > 0) ? newBlue : 0;
                            page.bitmap.data[idx + 3] = (newAlpha > 0) ? newAlpha : 0;
                        }
                    }
                }
            });

            // Scale the image to a factor of 72, so we can print the text at any size
            const scaleFactor = 72 / size;
            if (size !== 72) {
                // Use bicubic for decreasing size
                if (size > 72) {
                    image.scale(scaleFactor, jimp.RESIZE_BICUBIC);
                } else {
                    image.scale(scaleFactor, jimp.RESIZE_BILINEAR);
                }
            }

            // If using the alignment options, calculate the pixel values AFTER the image has been scaled
            switch (hAlign) {
                case "Left":
                    xPos = 0;
                    break;
                case "Center":
                    xPos = (image.getWidth() / 2) - (jimp.measureText(jimpFont, text) / 2);
                    break;
                case "Right":
                    xPos = image.getWidth() - jimp.measureText(jimpFont, text);
                    break;
                default:
                    // Adjust x position for the scaled image
                    xPos = xPos * scaleFactor;
            }

            switch (vAlign) {
                case "Top":
                    yPos = 0;
                    break;
                case "Middle":
                    yPos = (image.getHeight() / 2) - (jimp.measureTextHeight(jimpFont, text) / 2);
                    break;
                case "Bottom":
                    yPos = image.getHeight() - jimp.measureTextHeight(jimpFont, text);
                    break;
                default:
                    // Adjust y position for the scaled image
                    yPos = yPos * scaleFactor;
            }

            image.print(jimpFont, xPos, yPos, text);

            if (size !== 72) {
                if (size > 72) {
                    image.scale(1 / scaleFactor, jimp.RESIZE_BILINEAR);
                } else {
                    image.scale(1 / scaleFactor, jimp.RESIZE_BICUBIC);
                }
            }

            let imageBuffer;
            if (image.getMIME() === "image/gif") {
                imageBuffer = await image.getBufferAsync(jimp.MIME_PNG);
            } else {
                imageBuffer = await image.getBufferAsync(jimp.AUTO);
            }
            return imageBuffer.buffer;
        } catch (err) {
            throw new OperationError(`Error adding text to image. (${err})`);
        }
    }

    /**
     * Displays the blurred image using HTML for web apps
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

export default AddTextToImage;
