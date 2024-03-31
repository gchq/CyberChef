/**
 * QR code resources
 *
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";
import jsQR from "jsqr";
import qr from "qr-image";
import Utils from "../Utils.mjs";
import jimp from "jimp";

/**
 * Parses a QR code image from an image
 *
 * @param {ArrayBuffer} input
 * @param {boolean} normalise
 * @returns {string}
 */
export async function parseQrCode(input, normalise) {
    let image;
    try {
        image = await jimp.read(input);
    } catch (err) {
        throw new OperationError(`Error opening image. (${err})`);
    }

    try {
        if (normalise) {
            image.rgba(false);
            image.background(0xFFFFFFFF);
            image.normalize();
            image.greyscale();
            image = await image.getBufferAsync(jimp.MIME_JPEG);
            image = await jimp.read(image);
        }
    } catch (err) {
        throw new OperationError(`Error normalising image. (${err})`);
    }

    const qrData = jsQR(image.bitmap.data, image.getWidth(), image.getHeight());
    if (qrData) {
        return qrData.data;
    } else {
        throw new OperationError("Could not read a QR code from the image.");
    }
}

/**
 * Generates a QR code from the input string
 *
 * @param {string} input
 * @param {string} format
 * @param {number} moduleSize
 * @param {number} margin
 * @param {string} errorCorrection
 * @returns {ArrayBuffer}
 */
export function generateQrCode(input, format, moduleSize, margin, errorCorrection) {
    const formats = ["SVG", "EPS", "PDF", "PNG"];
    if (!formats.includes(format.toUpperCase())) {
        throw new OperationError("Unsupported QR code format.");
    }

    let qrImage;
    try {
        qrImage = qr.imageSync(input, {
            type: format,
            size: moduleSize,
            margin: margin,
            "ec_level": errorCorrection.charAt(0).toUpperCase()
        });
    } catch (err) {
        throw new OperationError(`Error generating QR code. (${err})`);
    }

    if (!qrImage) {
        throw new OperationError("Error generating QR code.");
    }

    switch (format) {
        case "SVG":
        case "EPS":
        case "PDF":
            return Utils.strToArrayBuffer(qrImage);
        case "PNG":
            return qrImage.buffer;
        default:
            throw new OperationError("Unsupported QR code format.");
    }
}
