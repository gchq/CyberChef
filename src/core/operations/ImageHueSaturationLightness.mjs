/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import Magic from "../lib/Magic";
import { toBase64 } from "../lib/Base64.mjs";
import jimp from "jimp";

/**
 * Image Hue/Saturation/Lightness operation
 */
class ImageHueSaturationLightness extends Operation {

    /**
     * ImageHueSaturationLightness constructor
     */
    constructor() {
        super();

        this.name = "Image Hue/Saturation/Lightness";
        this.module = "Image";
        this.description = "Adjusts the hue / saturation / lightness (HSL) values of an image.";
        this.infoURL = "";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.presentType = "html";
        this.args = [
            {
                name: "Hue",
                type: "number",
                value: 0,
                min: -360,
                max: 360
            },
            {
                name: "Saturation",
                type: "number",
                value: 0,
                min: -100,
                max: 100
            },
            {
                name: "Lightness",
                type: "number",
                value: 0,
                min: -100,
                max: 100
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    async run(input, args) {
        const [hue, saturation, lightness] = args;
        const type = Magic.magicFileType(input);

        if (!type || type.mime.indexOf("image") !== 0){
            throw new OperationError("Invalid file type.");
        }

        let image;
        try {
            image = await jimp.read(Buffer.from(input));
        } catch (err) {
            throw new OperationError(`Error loading image. (${err})`);
        }
        try {
            if (hue !== 0) {
                if (ENVIRONMENT_IS_WORKER())
                    self.sendStatusMessage("Changing image hue...");
                image.colour([
                    {
                        apply: "hue",
                        params: [hue]
                    }
                ]);
            }
            if (saturation !== 0) {
                if (ENVIRONMENT_IS_WORKER())
                    self.sendStatusMessage("Changing image saturation...");
                image.colour([
                    {
                        apply: "saturate",
                        params: [saturation]
                    }
                ]);
            }
            if (lightness !== 0) {
                if (ENVIRONMENT_IS_WORKER())
                    self.sendStatusMessage("Changing image lightness...");
                image.colour([
                    {
                        apply: "lighten",
                        params: [lightness]
                    }
                ]);
            }
            const imageBuffer = await image.getBufferAsync(jimp.AUTO);
            return [...imageBuffer];
        } catch (err) {
            throw new OperationError(`Error adjusting image hue / saturation / lightness. (${err})`);
        }
    }

    /**
     * Displays the image using HTML for web apps
     * @param {byteArray} data
     * @returns {html}
     */
    present(data) {
        if (!data.length) return "";

        let dataURI = "data:";
        const type = Magic.magicFileType(data);
        if (type && type.mime.indexOf("image") === 0){
            dataURI += type.mime + ";";
        } else {
            throw new OperationError("Invalid file type");
        }
        dataURI += "base64," + toBase64(data);

        return "<img src='" + dataURI + "'>";
    }
}

export default ImageHueSaturationLightness;
