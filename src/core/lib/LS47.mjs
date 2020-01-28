/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";

const letters = "_abcdefghijklmnopqrstuvwxyz.0123456789,-+*/:?!'()";
const tiles = [];

/**
 *
 */
export function initTiles() {
    for (let i = 0; i < 49; i++)
        tiles.push([letters.charAt(i), [Math.floor(i/7), i % 7]]);
}

/**
 *
 */
function rotateDown(key, col, n) {
    const lines = [];
    for (let i = 0; i < 7; i++)
        lines.push(key.slice(i*7, (i + 1) * 7));
    const lefts = [];
    let mids = [];
    const rights = [];
    lines.forEach((element) => {
        lefts.push(element.slice(0, col));
        mids.push(element.charAt(col));
        rights.push(element.slice(col+1));
    });
    n = (7 - n % 7) % 7;
    mids = mids.slice(n).concat(mids.slice(0, n));
    let result = "";
    for (let i = 0; i < 7; i++)
        result += lefts[i] + mids[i] + rights[i];
    return result;
}

/**
 *
 */
function rotateRight(key, row, n) {
    const mid = key.slice(row * 7, (row + 1) * 7);
    n = (7 - n % 7) % 7;
    return key.slice(0, 7 * row) + mid.slice(n) + mid.slice(0, n) + key.slice(7 * (row + 1));
}

/**
 *
 */
function findIx(letter) {
    for (let i = 0; i < tiles.length; i++)
        if (tiles[i][0] === letter)
            return tiles[i][1];
    throw new OperationError("Letter " + letter + " is not included in LS47");
}

/**
 *
 */
export function deriveKey(password) {
    let i = 0;
    let k = letters;
    for (const c of password) {
        const [row, col] = findIx(c);
        k = rotateDown(rotateRight(k, i, col), i, row);
        i = (i + 1) % 7;
    }
    return k;
}

/**
 *
 */
function checkKey(key) {
    if (key.length !== letters.length)
        throw new OperationError("Wrong key size");
    const counts = new Array();
    for (let i = 0; i < letters.length; i++)
        counts[letters.charAt(i)] = 0;
    for (const elem of letters) {
        if (letters.indexOf(elem) === -1)
            throw new OperationError("Letter " + elem + " not in LS47!");
        counts[elem]++;
        if (counts[elem] > 1)
            throw new OperationError("Letter duplicated in the key!");
    }
}

/**
 *
 */
function findPos (key, letter) {
    const index = key.indexOf(letter);
    if (index >= 0 && index < 49)
        return [Math.floor(index/7), index%7];
    throw new OperationError("Letter " + letter + " is not in the key!");
}

/**
 *
 */
function findAtPos(key, coord) {
    return key.charAt(coord[1] + (coord[0] * 7));
}

/**
 *
 */
function addPos(a, b) {
    return [(a[0] + b[0]) % 7, (a[1] + b[1]) % 7];
}

/**
 *
 */
function subPos(a, b) {
    const asub = a[0] - b[0];
    const bsub = a[1] - b[1];
    return [asub - (Math.floor(asub/7) * 7), bsub - (Math.floor(bsub/7) * 7)];
}

/**
 *
 */
function encrypt(key, plaintext) {
    checkKey(key);
    let mp = [0, 0];
    let ciphertext = "";
    for (const p of plaintext) {
        const pp = findPos(key, p);
        const mix = findIx(findAtPos(key, mp));
        let cp = addPos(pp, mix);
        const c = findAtPos(key, cp);
        ciphertext += c;
        key = rotateRight(key, pp[0], 1);
        cp = findPos(key, c);
        key = rotateDown(key, cp[1], 1);
        mp = addPos(mp, findIx(c));
    }
    return ciphertext;
}

/**
 *
 */
function decrypt(key, ciphertext) {
    checkKey(key);
    let mp = [0, 0];
    let plaintext = "";
    for (const c of ciphertext) {
        let cp = findPos(key, c);
        const mix = findIx(findAtPos(key, mp));
        const pp = subPos(cp, mix);
        const p = findAtPos(key, pp);
        plaintext += p;
        key = rotateRight(key, pp[0], 1);
        cp = findPos(key, c);
        key = rotateDown(key, cp[1], 1);
        mp = addPos(mp, findIx(c));
    }
    return plaintext;
}

/**
 *
 */
export function encryptPad(key, plaintext, signature, paddingSize) {
    initTiles();
    checkKey(key);
    let padding = "";
    for (let i = 0; i < paddingSize; i++) {
        padding += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return encrypt(key, padding+plaintext+"---"+signature);
}

/**
 *
 */
export function decryptPad(key, ciphertext, paddingSize) {
    initTiles();
    checkKey(key);
    return decrypt(key, ciphertext).slice(paddingSize);
}
