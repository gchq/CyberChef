/**
 * yEnc functions.
 *
 * @author skyswordw
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";

const OFFSET = 42,
    ESCAPE_OFFSET = 64,
    ESCAPE_BYTE = 0x3d,
    CRITICAL_BYTES = new Set([0x00, 0x0a, 0x0d, ESCAPE_BYTE]);

/**
 * Encode the input byte array as a single-part yEnc block.
 *
 * @param {ArrayBuffer|Uint8Array|byteArray} input
 * @param {number} lineLength
 * @param {string} filename
 * @returns {string}
 */
export function toYEnc(input, lineLength=128, filename="file.bin") {
    const data = input instanceof Uint8Array ? input : new Uint8Array(input),
        name = sanitiseFilename(filename);
    lineLength = validateLineLength(lineLength);

    const lines = [];
    let line = "",
        lineBytes = 0;

    for (let i = 0; i < data.length; i++) {
        if (lineBytes >= lineLength) {
            lines.push(line);
            line = "";
            lineBytes = 0;
        }

        line += encodeByte(data[i]);
        lineBytes++;
    }

    if (line.length > 0 || data.length === 0) {
        lines.push(line);
    }

    return [
        `=ybegin line=${lineLength} size=${data.length} name=${name}`,
        ...lines,
        `=yend size=${data.length}`
    ].join("\r\n");
}

/**
 * Decode a single yEnc block.
 *
 * @param {string} input
 * @returns {byteArray}
 */
export function fromYEnc(input) {
    const lines = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n"),
        headerIndex = lines.findIndex(line => line.startsWith("=ybegin "));

    if (headerIndex < 0) {
        throw new OperationError("Could not find yEnc header.");
    }

    const header = parseHeader(lines[headerIndex]),
        dataStart = lines[headerIndex + 1]?.startsWith("=ypart ") ? headerIndex + 2 : headerIndex + 1,
        endIndex = lines.findIndex((line, index) => index >= dataStart && line.startsWith("=yend "));

    if (endIndex < 0) {
        throw new OperationError("Could not find yEnc trailer.");
    }

    const trailer = parseTrailer(lines[endIndex]),
        output = decodeData(lines.slice(dataStart, endIndex).join(""));

    if (!header.multipart && header.size !== output.length) {
        throw new OperationError(`Decoded size ${output.length} does not match yEnc header size ${header.size}.`);
    }

    if (trailer.size !== output.length) {
        throw new OperationError(`Decoded size ${output.length} does not match yEnc trailer size ${trailer.size}.`);
    }

    return output;
}

/**
 * @param {number} byte
 * @returns {string}
 */
function encodeByte(byte) {
    let encodedByte = (byte + OFFSET) & 0xff;

    if (CRITICAL_BYTES.has(encodedByte)) {
        encodedByte = (encodedByte + ESCAPE_OFFSET) & 0xff;
        return "=" + String.fromCharCode(encodedByte);
    }

    return String.fromCharCode(encodedByte);
}

/**
 * @param {string} data
 * @returns {byteArray}
 */
function decodeData(data) {
    const output = [];

    for (let i = 0; i < data.length; i++) {
        let encodedByte = data.charCodeAt(i) & 0xff;

        if (encodedByte === ESCAPE_BYTE) {
            i++;
            if (i >= data.length) {
                throw new OperationError("Invalid yEnc escape sequence.");
            }
            encodedByte = ((data.charCodeAt(i) & 0xff) - ESCAPE_OFFSET) & 0xff;
        }

        output.push((encodedByte - OFFSET) & 0xff);
    }

    return output;
}

/**
 * @param {string} line
 * @returns {{size: number, multipart: boolean}}
 */
function parseHeader(line) {
    const lineSize = matchInteger(line, "line"),
        size = matchInteger(line, "size");

    if (lineSize < 1 || lineSize > 998) {
        throw new OperationError("Invalid yEnc line length.");
    }

    if (!/\sname=.+$/.test(line)) {
        throw new OperationError("Invalid yEnc header: missing name.");
    }

    return {
        size,
        multipart: /\spart=\d+\b/.test(line)
    };
}

/**
 * @param {string} line
 * @returns {{size: number}}
 */
function parseTrailer(line) {
    return {
        size: matchInteger(line, "size")
    };
}

/**
 * @param {string} line
 * @param {string} parameter
 * @returns {number}
 */
function matchInteger(line, parameter) {
    const match = line.match(new RegExp(`(?:^|\\s)${parameter}=(\\d+)(?:\\s|$)`));
    if (!match) {
        throw new OperationError(`Invalid yEnc block: missing ${parameter}.`);
    }

    const value = Number(match[1]);
    if (!Number.isSafeInteger(value)) {
        throw new OperationError(`Invalid yEnc ${parameter} value.`);
    }

    return value;
}

/**
 * @param {number} lineLength
 * @returns {number}
 */
function validateLineLength(lineLength) {
    lineLength = Number(lineLength);
    if (!Number.isInteger(lineLength) || lineLength < 1 || lineLength > 998) {
        throw new OperationError("Line length must be an integer between 1 and 998.");
    }
    return lineLength;
}

/**
 * @param {string} filename
 * @returns {string}
 */
function sanitiseFilename(filename) {
    filename = (filename || "file.bin").replace(/[\r\n]/g, " ").trim();
    return filename || "file.bin";
}
