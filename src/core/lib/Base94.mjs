/**
 * Base94 functions.
 *
 * @author sganson@trustedsecurity.com]
 * @license Apache-2.0
 */

import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Base94's the input byte array, returning a string.
 * Every four bytes of input are converted to five bytes of
 * Base94 encoded output.
 *
 * @param {ArrayBuffer} data
 * @param {boolean} [strictLength="true"]
 * @returns {string}
 *
 * @example
 * // returns "@Z<[+/- >5$@3z&T!Qh*|F.q+ZWIz&#J<[+][[4+trr# "
 * // toBase94([48, 65, 6c, 6c, 6f, 20, 57, 6f, 72, 6c, 64, 21]);
 * // e.g. toBase94(ToHex("Hello World!"))
 */
export function toBase94(data, strictLength=true) {

    if (!data) return "";

    if (data instanceof ArrayBuffer) {
        data = new Uint8Array(data);
    } else {
        throw new OperationError(`Invalid - Input not instanceof ArrayBuffer.`);
    }

    const dataModLen = data.length % 4;

    if (dataModLen > 0 && strictLength) {
        throw new OperationError(`Invalid - Input byte length must be a multiple of 4.`);
    }

    let output = "", i = 0, j = 0, acc = 0;

    const dataPad = new Uint8Array(data.length + (dataModLen > 0 ? (4 - dataModLen) : 0));

    dataPad.set(data, 0);

    while (i < dataPad.length) {

        acc = 0;

        for (j = 0; j < 4; j++) {

            acc *= 256;

            acc += dataPad[i + (3 - j)];

        }

        for (j = 0; j < 5; j++) {

            output += String.fromCharCode((acc % 94)+32);

            acc  = Math.floor(acc / 94);

        }

        i += 4;

    }

    return output;

}


/**
 * Un-Base94's the input string, returning a byte array.
 * Every five bytes of Base94 encoded input are converted to
 * four bytes of output.
 *
 * @param {string} data  // Base94 encoded string
 * @param {boolean} [strictLength="true"]
 * @param {boolean} [removeInvalidChars="false"]
 * @returns {byteArray}
 *
 * @example
 * // returns [48, 65, 6c, 6c, 6f, 20, 57, 6f, 72, 6c, 64, 21]
 * // fromBase94("@Z<[+/- >5$@3z&T!Qh*|F.q+ZWIz&#J<[+][[4+trr# ", true, true);
 * // e.g. fromHex(fromBase94(....)); -> Hello World!
 */
export function fromBase94(data, strictLength=true, removeInvalidChars=false) {

    if (!data) {
        return [];
    }

    if (typeof data == "string") {

        data = Utils.strToByteArray(data);

    } else {

        throw new OperationError(`Invalid - typeof base94 input is not a string.`);

    }

    const re = new RegExp("[^\x20-\x7e]", "g");

    if (re.test(data)) {
        if (removeInvalidChars) {
            data = data.replace(re, "");
        } else {
            throw new OperationError(`Invalid content in Base94 string.`);
        }
    }

    let stringModLen = data.length % 5;

    if (stringModLen > 0) {

        if (strictLength) {
            throw new OperationError(`Invalid - Input string length must be a multiple of 5.`);
        }

        stringModLen = 5 - stringModLen;

        while (stringModLen > 0) {

            data.push(32);

            stringModLen -= 1;

        }

    }

    const output = [];
    let i = 0, j = 0, acc = 0;

    while (i < data.length) {

        acc = 0;

        for (j = 0; j < 5; j++) {

            acc = (acc * 94) + data[i + 4 - j] - 32;

        }

        for (j = 0; j < 4; j++) {

            output.push(acc % 256);

            acc = Math.floor(acc / 256);

        }

        i += 5;

    }

    return output;

}
