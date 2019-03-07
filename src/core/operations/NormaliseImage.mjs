/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import Magic from "../lib/Magic";
import { toBase64 } from "../lib/Base64";
import jimp from "jimp";

/**
 * Normalise Image operation
 */
class NormaliseImage extends Operation {

    /**
     * NormaliseImage constructor
     */
    constructor() {
        super();

        this.name = "Normalise Image";
        this.module = "Image";
        this.description = "Normalise the image colours.";
        this.infoURL = "";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.presentType=  "html";
        this.args = [
            /* Example arguments. See the project wiki for full details.
            {
                name: "First arg",
                type: "string",
                value: "Don't Panic"
            },
            {
                name: "Second arg",
                type: "number",
                value: 42
            }
            */
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    async run(input, args) {
        // const [firstArg, secondArg] = args;
        const type = Magic.magicFileType(input);

        if (!type || type.mime.indexOf("image") !== 0){
            throw new OperationError("Invalid file type.");
        }

        const image = await jimp.read(Buffer.from(input));

        image.normalize();

        const imageBuffer = await image.getBufferAsync(jimp.AUTO);
        return [...imageBuffer];
    }

    /**
     * Displays the normalised image using HTML for web apps
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
            throw new OperationError("Invalid file type.");
        }
        dataURI += "base64," + toBase64(data);

        return "<img src='" + dataURI + "'>";

    }

}

export default NormaliseImage;
