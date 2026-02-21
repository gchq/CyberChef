/**
 * @author brun0ne [brunonblok@gmail.com]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

import Utils from "../Utils.mjs";
import { isType, detectFileType } from "../lib/FileType.mjs";

import Jimp from "jimp/es/index.js";

import {isWorkerEnvironment} from "../Utils.mjs";
import { toBase64 } from "../lib/Base64.mjs";

import * as wavefile from "wavefile";
import { RFFT } from "dsp.js";

/**
 * Generate Spectrogram operation
 */
class GenerateSpectrogram extends Operation {

    /**
     * GenerateSpectrogram constructor
     */
    constructor() {
        super();

        this.name = "Generate Spectrogram";
        this.module = "Default";
        this.description = "Generates a spectrogram from a wave file.<br /><br /><code>Frame size</code> - the number of samples process at once by FFT.<br /><code>Overlap</code> - the number of samples to overlap between frames.<br /><code>Color scheme</code> - the color scheme to use.<br /><code>Gain (dB)</code> - gain in decibels.<br /><code>Channel</code> - the channel to use.<br /><code>Include axes</code> - whether to include axes and labels on the rendered image.";
        this.infoURL = "https://en.wikipedia.org/wiki/Spectrogram";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.presentType = "html";
        this.args = [
            {
                "name": "Frame size",
                "type": "option",
                "value": [
                    "256",
                    "64",
                    "128",
                    "512",
                    "1024",
                    "2048"
                ]
            },
            {
                "name": "Overlap",
                "type": "option",
                "value": [
                    "0%",
                    "50%"
                ]
            },
            {
                "name": "Color scheme",
                "type": "option",
                "value": [
                    "Green-Black",
                    "Yellow-Blue",
                    "Greyscale",
                    "Neon"
                ]
            },
            {
                "name": "Gain (dB)",
                "type": "number",
                "value": 0,
                "min": -100,
                "max": 100
            },
            {
                "name": "Channel",
                "type": "number",
                "value": 0,
                "min": 0
            },
            {
                "name": "Include axes",
                "type": "boolean",
                "value": true
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray} the sound file as bytes
     */
    run(input, args) {
        input = Utils.strToByteArray(input);

        // Determine file type
        if (!isType(/^(audio)/, input)) {
            throw new OperationError("Invalid or unrecognised file type");
        }

        return input;
    }

    /**
     * Returns the spectrogram html
     * @param {array} array of arrays of samples
     * @param {number} sampleRate
     * @param {Object[]} args
     * @returns {string} HTML
     */
    async getSpectrogram(sampleChannels, sampleRate, args) {
        /* args */
        const frameSize = parseInt(args[0], 10);
        const overlap = (parseInt(args[1], 10) / 100) * frameSize;
        const colorScheme = args[2];
        const gain = args[3];
        const channelNum = args[4];
        const includeAxes = args[5];

        if (sampleChannels[channelNum] == null) {
            throw new OperationError(`Invalid channel number: ${channelNum}`);
        }

        const channel = sampleChannels[channelNum];
        const MAX_FREQ = sampleRate / 2;

        /* positions and sizes */
        let paddingLeft = 0;
        let paddingRight = 0;
        let paddingBottom = 0;
        if (includeAxes) {
            paddingLeft = Math.log10(MAX_FREQ) * 10 + 10 * 3; // space for the frequency labels (10px per digit)
            paddingRight = 50;
            paddingBottom = 20;
        }

        const width = channel.length / (frameSize - overlap);
        const height = frameSize / 2;

        const imageWidth = width + paddingLeft + paddingRight;
        const imageHeight = height + paddingBottom;

        /* create an image */
        const image = new Jimp(imageWidth, imageHeight, (err, image) => {});
        if (isWorkerEnvironment())
            self.sendStatusMessage("Generating a spectrogram from data...");

        /**
         * Returns a function filling a pixel with given color
         * @param {array<number>} rgba
         * @returns function
         */
        function fill(rgba) {
            return function(x, y, idx) {
                this.bitmap.data[idx + 0] = rgba[0];
                this.bitmap.data[idx + 1] = rgba[1];
                this.bitmap.data[idx + 2] = rgba[2];
                this.bitmap.data[idx + 3] = rgba[3];
            };
        }

        /* fill with black */
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, fill([0, 0, 0, 255]).bind(image));

        if (includeAxes) {
            /* draw border */
            image.scan(paddingLeft - 1, height + 1, width + 2, 1, fill([255, 255, 255, 255]).bind(image)); // horizontal
            image.scan(paddingLeft - 1, 0, 1, height + 1, fill([255, 255, 255, 255]).bind(image)); // vertical (left)
            image.scan(paddingLeft + width + 1, 0, 1, height + 1, fill([255, 255, 255, 255]).bind(image)); // vertical (right)

            /* set font */
            const font = await import(/* webpackMode: "eager" */ "../../web/static/fonts/bmfonts/Roboto72White.fnt");
            await import(/* webpackMode: "eager" */ "../../web/static/fonts/bmfonts/Roboto72White.png");

            /* LoadFont needs an absolute url, so append the font name to self.docURL */
            const jimpFont = await Jimp.loadFont(self.docURL + "/" + font.default);

            /* create a temporary scaled image */
            const textScale = 72 / 10;
            const textImage = new Jimp(image.bitmap.width * textScale, image.bitmap.height * textScale, (err, image) => {});

            /* write min and max frequency */
            textImage.print(jimpFont, /* align to right */ (paddingLeft - 30) * textScale, (height - 10) * textScale, "0 Hz");
            textImage.print(jimpFont, /* align to right */ (paddingLeft - (Math.log10(MAX_FREQ) + 1) * 10) * textScale, 5 * textScale, `${(MAX_FREQ).toFixed(0)} Hz`);

            /* write min and max time */
            textImage.print(jimpFont, (paddingLeft - 5) * textScale, (height + 5) * textScale, "0 s");
            textImage.print(jimpFont, (paddingLeft + width) * textScale, (height + 5) * textScale, `${(channel.length / sampleRate).toFixed(0)} s`);

            /* draw the scaled image on the original image */
            textImage.scaleToFit(image.bitmap.width, image.bitmap.height);
            image.blit(textImage, 0, 0);
        }

        const rfft = new RFFT(frameSize, sampleRate);

        const frames = [];
        for (let start = 0; start < channel.length; start += (frameSize - overlap)) {
            let chunk = channel.slice(start, start+frameSize);

            if (chunk.length < frameSize) {
                /* pad with zeros */
                const pad = new Float64Array(frameSize - chunk.length).fill(0);
                chunk = Float64Array.from([...chunk, ...pad]);
            }

            /* get frequency spectrum */
            const freq = rfft.forward(chunk);
            const frame = [];
            for (let i = 0; i < freq.length; i++) {
                /* convert to decibels */
                let strength = 10 * Math.log10(Math.abs(freq[i])) + gain;

                if (freq[i] === 0) // avoid -Infinity
                    strength = 0;

                if (strength < 0)
                    strength = 0;

                frame.push(strength);
            }
            frames.push(frame);
        }

        /* normalize */
        let max = 0;
        for (let i = 0; i < frames.length; i++) {
            for (let j = 0; j < frames[i].length; j++) {
                if (frames[i][j] > max)
                    max = frames[i][j];
            }
        }

        /* draw */
        let posX = paddingLeft;
        for (let i = 0; i < frames.length; i++) {
            for (let j = 0; j < frames[i].length; j++) {
                const colorStrength = (frames[i][j] / max) * 255;
                let color;

                switch (colorScheme) {
                    case "Green-Black":
                        color = [0, colorStrength, 0, 255];
                        break;
                    case "Greyscale":
                        color = [colorStrength, colorStrength, colorStrength, 255];
                        break;
                    case "Yellow-Blue":
                        color = [colorStrength, colorStrength, Math.abs(50 - colorStrength), 255];
                        break;
                    case "Neon":
                        color = [Math.sin(colorStrength/255) * 255, 0, Math.tanh(colorStrength) * 255, 255];
                        break;
                    default:
                        throw new OperationError(`Unknown color scheme: ${colorScheme}`);
                }

                image.scan(posX, height - j, 1, 1, fill(color).bind(image));
            }
            posX++;
        }

        /* get image data */
        let imageBuffer;
        try {
            imageBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
        } catch (err) {
            throw new OperationError(`Error generating image. (${err})`);
        }

        return `<img src="data:image/png;base64,${toBase64(imageBuffer)}" />`;
    }

    /**
     * Displays a spectrogram
     *
     * @param {byteArray} data containing the audio file
     * @returns {string} HTML
     */
    async present(data, args) {
        if (!data.length) return "";

        // check file type
        const types = detectFileType(data);
        if (types[0].mime !== "audio/wav" && types[0].mime !== "audio/x-wav") {
            throw new OperationError("Only WAV files are supported");
        }

        // parse wave
        let wave;
        try {
            wave = new wavefile.WaveFile(data);
        } catch (err) {
            throw new OperationError("Invalid WAV file");
        }

        // get properties
        const numChannels = wave.fmt.numChannels;
        const sampleRate = wave.fmt.sampleRate;

        // get samples
        let sampleChannels = [];
        if (numChannels > 1) {
            sampleChannels = wave.getSamples(); // returns an array of arrays
        } else {
            sampleChannels.push(wave.getSamples()); // returns an array
        }

        // get the spectrogram html
        return this.getSpectrogram(sampleChannels, sampleRate, args);
    }
}

export default GenerateSpectrogram;
