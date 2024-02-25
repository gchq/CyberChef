/**
 * Image manipulation resources
 *
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";

/**
 * Gaussian blurs an image.
 *
 * @param {jimp} input
 * @param {number} radius
 * @param {boolean} fast
 * @returns {jimp}
 */
export function gaussianBlur(input, radius) {
    try {
        // From http://blog.ivank.net/fastest-gaussian-blur.html
        const boxes = boxesForGauss(radius, 3);
        for (let i = 0; i < 3; i++) {
            input = boxBlur(input, (boxes[i] - 1) / 2);
        }
    } catch (err) {
        throw new OperationError(`Error blurring image. (${err})`);
    }

    return input;
}

/**
 *
 * @param {number} radius
 * @param {number} numBoxes
 * @returns {Array}
 */
function boxesForGauss(radius, numBoxes) {
    const idealWidth = Math.sqrt((12 * radius * radius) / numBoxes + 1);

    let wl = Math.floor(idealWidth);

    if (wl % 2 === 0) {
        wl--;
    }

    const wu = wl + 2;

    const mIdeal = (12 * radius * radius - numBoxes * wl * wl - 4 * numBoxes * wl - 3 * numBoxes) / (-4 * wl - 4);
    const m = Math.round(mIdeal);

    const sizes = [];
    for (let i = 0; i < numBoxes; i++) {
        sizes.push(i < m ? wl : wu);
    }
    return sizes;
}

/**
 * Applies a box blur effect to the image
 *
 * @param {jimp} source
 * @param {number} radius
 * @returns {jimp}
 */
function boxBlur(source, radius) {
    const width = source.bitmap.width;
    const height = source.bitmap.height;
    let output = source.clone();
    output = boxBlurH(source, output, width, height, radius);
    source = boxBlurV(output, source, width, height, radius);

    return source;
}

/**
 * Applies the horizontal blur
 *
 * @param {jimp} source
 * @param {jimp} output
 * @param {number} width
 * @param {number} height
 * @param {number} radius
 * @returns {jimp}
 */
function boxBlurH(source, output, width, height, radius) {
    const iarr = 1 / (radius + radius + 1);
    for (let i = 0; i < height; i++) {
        let ti = 0,
            li = ti,
            ri = ti + radius;
        const idx = source.getPixelIndex(ti, i);
        const firstValRed = source.bitmap.data[idx],
            firstValGreen = source.bitmap.data[idx + 1],
            firstValBlue = source.bitmap.data[idx + 2],
            firstValAlpha = source.bitmap.data[idx + 3];

        const lastIdx = source.getPixelIndex(width - 1, i),
            lastValRed = source.bitmap.data[lastIdx],
            lastValGreen = source.bitmap.data[lastIdx + 1],
            lastValBlue = source.bitmap.data[lastIdx + 2],
            lastValAlpha = source.bitmap.data[lastIdx + 3];

        let red = (radius + 1) * firstValRed;
        let green = (radius + 1) * firstValGreen;
        let blue = (radius + 1) * firstValBlue;
        let alpha = (radius + 1) * firstValAlpha;

        for (let j = 0; j < radius; j++) {
            const jIdx = source.getPixelIndex(ti + j, i);
            red += source.bitmap.data[jIdx];
            green += source.bitmap.data[jIdx + 1];
            blue += source.bitmap.data[jIdx + 2];
            alpha += source.bitmap.data[jIdx + 3];
        }

        for (let j = 0; j <= radius; j++) {
            const jIdx = source.getPixelIndex(ri++, i);
            red += source.bitmap.data[jIdx] - firstValRed;
            green += source.bitmap.data[jIdx + 1] - firstValGreen;
            blue += source.bitmap.data[jIdx + 2] - firstValBlue;
            alpha += source.bitmap.data[jIdx + 3] - firstValAlpha;

            const tiIdx = source.getPixelIndex(ti++, i);
            output.bitmap.data[tiIdx] = Math.round(red * iarr);
            output.bitmap.data[tiIdx + 1] = Math.round(green * iarr);
            output.bitmap.data[tiIdx + 2] = Math.round(blue * iarr);
            output.bitmap.data[tiIdx + 3] = Math.round(alpha * iarr);
        }

        for (let j = radius + 1; j < width - radius; j++) {
            const riIdx = source.getPixelIndex(ri++, i);
            const liIdx = source.getPixelIndex(li++, i);
            red += source.bitmap.data[riIdx] - source.bitmap.data[liIdx];
            green += source.bitmap.data[riIdx + 1] - source.bitmap.data[liIdx + 1];
            blue += source.bitmap.data[riIdx + 2] - source.bitmap.data[liIdx + 2];
            alpha += source.bitmap.data[riIdx + 3] - source.bitmap.data[liIdx + 3];

            const tiIdx = source.getPixelIndex(ti++, i);
            output.bitmap.data[tiIdx] = Math.round(red * iarr);
            output.bitmap.data[tiIdx + 1] = Math.round(green * iarr);
            output.bitmap.data[tiIdx + 2] = Math.round(blue * iarr);
            output.bitmap.data[tiIdx + 3] = Math.round(alpha * iarr);
        }

        for (let j = width - radius; j < width; j++) {
            const liIdx = source.getPixelIndex(li++, i);
            red += lastValRed - source.bitmap.data[liIdx];
            green += lastValGreen - source.bitmap.data[liIdx + 1];
            blue += lastValBlue - source.bitmap.data[liIdx + 2];
            alpha += lastValAlpha - source.bitmap.data[liIdx + 3];

            const tiIdx = source.getPixelIndex(ti++, i);
            output.bitmap.data[tiIdx] = Math.round(red * iarr);
            output.bitmap.data[tiIdx + 1] = Math.round(green * iarr);
            output.bitmap.data[tiIdx + 2] = Math.round(blue * iarr);
            output.bitmap.data[tiIdx + 3] = Math.round(alpha * iarr);
        }
    }
    return output;
}

/**
 * Applies the vertical blur
 *
 * @param {jimp} source
 * @param {jimp} output
 * @param {number} width
 * @param {number} height
 * @param {number} radius
 * @returns {jimp}
 */
function boxBlurV(source, output, width, height, radius) {
    const iarr = 1 / (radius + radius + 1);
    for (let i = 0; i < width; i++) {
        let ti = 0,
            li = ti,
            ri = ti + radius;

        const idx = source.getPixelIndex(i, ti);

        const firstValRed = source.bitmap.data[idx],
            firstValGreen = source.bitmap.data[idx + 1],
            firstValBlue = source.bitmap.data[idx + 2],
            firstValAlpha = source.bitmap.data[idx + 3];

        const lastIdx = source.getPixelIndex(i, height - 1),
            lastValRed = source.bitmap.data[lastIdx],
            lastValGreen = source.bitmap.data[lastIdx + 1],
            lastValBlue = source.bitmap.data[lastIdx + 2],
            lastValAlpha = source.bitmap.data[lastIdx + 3];

        let red = (radius + 1) * firstValRed;
        let green = (radius + 1) * firstValGreen;
        let blue = (radius + 1) * firstValBlue;
        let alpha = (radius + 1) * firstValAlpha;

        for (let j = 0; j < radius; j++) {
            const jIdx = source.getPixelIndex(i, ti + j);
            red += source.bitmap.data[jIdx];
            green += source.bitmap.data[jIdx + 1];
            blue += source.bitmap.data[jIdx + 2];
            alpha += source.bitmap.data[jIdx + 3];
        }

        for (let j = 0; j <= radius; j++) {
            const riIdx = source.getPixelIndex(i, ri++);
            red += source.bitmap.data[riIdx] - firstValRed;
            green += source.bitmap.data[riIdx + 1] - firstValGreen;
            blue += source.bitmap.data[riIdx + 2] - firstValBlue;
            alpha += source.bitmap.data[riIdx + 3] - firstValAlpha;

            const tiIdx = source.getPixelIndex(i, ti++);
            output.bitmap.data[tiIdx] = Math.round(red * iarr);
            output.bitmap.data[tiIdx + 1] = Math.round(green * iarr);
            output.bitmap.data[tiIdx + 2] = Math.round(blue * iarr);
            output.bitmap.data[tiIdx + 3] = Math.round(alpha * iarr);
        }

        for (let j = radius + 1; j < height - radius; j++) {
            const riIdx = source.getPixelIndex(i, ri++);
            const liIdx = source.getPixelIndex(i, li++);
            red += source.bitmap.data[riIdx] - source.bitmap.data[liIdx];
            green += source.bitmap.data[riIdx + 1] - source.bitmap.data[liIdx + 1];
            blue += source.bitmap.data[riIdx + 2] - source.bitmap.data[liIdx + 2];
            alpha += source.bitmap.data[riIdx + 3] - source.bitmap.data[liIdx + 3];

            const tiIdx = source.getPixelIndex(i, ti++);
            output.bitmap.data[tiIdx] = Math.round(red * iarr);
            output.bitmap.data[tiIdx + 1] = Math.round(green * iarr);
            output.bitmap.data[tiIdx + 2] = Math.round(blue * iarr);
            output.bitmap.data[tiIdx + 3] = Math.round(alpha * iarr);
        }

        for (let j = height - radius; j < height; j++) {
            const liIdx = source.getPixelIndex(i, li++);
            red += lastValRed - source.bitmap.data[liIdx];
            green += lastValGreen - source.bitmap.data[liIdx + 1];
            blue += lastValBlue - source.bitmap.data[liIdx + 2];
            alpha += lastValAlpha - source.bitmap.data[liIdx + 3];

            const tiIdx = source.getPixelIndex(i, ti++);
            output.bitmap.data[tiIdx] = Math.round(red * iarr);
            output.bitmap.data[tiIdx + 1] = Math.round(green * iarr);
            output.bitmap.data[tiIdx + 2] = Math.round(blue * iarr);
            output.bitmap.data[tiIdx + 3] = Math.round(alpha * iarr);
        }
    }
    return output;
}
