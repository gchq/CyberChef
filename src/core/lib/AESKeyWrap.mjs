/**
 * AES Key Wrap/Unwrap defined in RFC 3394
 *
 * @author aosterhage [aaron.osterhage@gmail.com]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Utils from "../Utils.mjs";
import forge from "node-forge";

/**
 * AES Key Wrap algorithm defined in RFC 3394.
 *
 * @param {string} plaintext
 * @param {string} kek
 * @param {string} iv
 * @returns {string} ciphertext
 */
export function aesKeyWrap(plaintext, kek, iv) {
    const cipher = forge.cipher.createCipher("AES-ECB", kek);

    let A = iv;
    const R = [];
    for (let i = 0; i < plaintext.length; i += 8) {
        R.push(plaintext.substring(i, i + 8));
    }
    let cntLower = 1, cntUpper = 0;
    for (let j = 0; j < 6; j++) {
        for (let i = 0; i < R.length; i++) {
            cipher.start();
            cipher.update(forge.util.createBuffer(A + R[i]));
            cipher.finish();
            const B = cipher.output.getBytes();
            const msbBuffer = Utils.strToArrayBuffer(B.substring(0, 8));
            const msbView = new DataView(msbBuffer);
            msbView.setUint32(0, msbView.getUint32(0) ^ cntUpper);
            msbView.setUint32(4, msbView.getUint32(4) ^ cntLower);
            A = Utils.arrayBufferToStr(msbBuffer, false);
            R[i] = B.substring(8, 16);
            cntLower++;
            if (cntLower > 0xffffffff) {
                cntUpper++;
                cntLower = 0;
            }
        }
    }

    return A + R.join("");
}

/**
 * AES Key Unwrap algorithm defined in RFC 3394.
 *
 * @param {string} ciphertext
 * @param {string} kek
 * @returns {[string, string]} [plaintext, iv]
 */
export function aesKeyUnwrap(ciphertext, kek) {
    const cipher = forge.cipher.createCipher("AES-ECB", kek);
    cipher.start();
    cipher.update(forge.util.createBuffer(""));
    cipher.finish();
    const paddingBlock = cipher.output.getBytes();

    const decipher = forge.cipher.createDecipher("AES-ECB", kek);

    let A = ciphertext.substring(0, 8);
    const R = [];
    for (let i = 8; i < ciphertext.length; i += 8) {
        R.push(ciphertext.substring(i, i + 8));
    }
    let cntLower = R.length >>> 0;
    let cntUpper = (R.length / ((1 << 30) * 4)) >>> 0;
    cntUpper = cntUpper * 6 + ((cntLower * 6 / ((1 << 30) * 4)) >>> 0);
    cntLower = cntLower * 6 >>> 0;
    for (let j = 5; j >= 0; j--) {
        for (let i = R.length - 1; i >= 0; i--) {
            const aBuffer = Utils.strToArrayBuffer(A);
            const aView = new DataView(aBuffer);
            aView.setUint32(0, aView.getUint32(0) ^ cntUpper);
            aView.setUint32(4, aView.getUint32(4) ^ cntLower);
            A = Utils.arrayBufferToStr(aBuffer, false);
            decipher.start();
            decipher.update(forge.util.createBuffer(A + R[i] + paddingBlock));
            decipher.finish();
            const B = decipher.output.getBytes();
            A = B.substring(0, 8);
            R[i] = B.substring(8, 16);
            cntLower--;
            if (cntLower < 0) {
                cntUpper--;
                cntLower = 0xffffffff;
            }
        }
    }

    return [R.join(""), A];
}
