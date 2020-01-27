/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";

let letters = "_abcdefghijklmnopqrstuvwxyz.0123456789,-+*/:?!'()";
let tiles = [];

export function init_tiles() {
    for (let i = 0; i < 49; i++)
        tiles.push([letters.charAt(i), [Math.floor(i/7), i % 7]]);
}

function rotate_down(key, col, n) {
    let lines = [];
    for (let i = 0; i < 7; i++) 
        lines.push(key.slice(i*7, (i + 1) * 7));
    let lefts = [];
    let mids = [];
    let rights = [];
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

function rotate_right(key, row, n) {
    let mid = key.slice(row * 7, (row + 1) * 7);
    n = (7 - n % 7) % 7;
    return key.slice(0, 7 * row) + mid.slice(n) + mid.slice(0, n) + key.slice(7 * (row + 1));
}

function find_ix(letter) {
    for (let i = 0; i < tiles.length; i++)
        if (tiles[i][0] === letter)
            return tiles[i][1];
    throw new OperationError("Letter " + letter + " is not included in LS47");
}

export function derive_key(password) {
    let i = 0;
    let k = letters;
    for (const c of password) {
        let [row, col] = find_ix(c);
        k = rotate_down(rotate_right(k, i, col), i, row);
        i = (i + 1) % 7;
    }
    return k;
}

function check_key(key) {
    if (key.length !== letters.length)
        throw new OperationError("Wrong key size");
    let counts = new Array();
    for (let i = 0; i < letters.length; i++)
        counts[letters.charAt(i)] = 0;
    for (const elem of letters){
        if (letters.indexOf(elem) === -1)
            throw new OperationError("Letter " + elem + " not in LS47!");
        counts[elem]++;
        if (counts[elem] > 1)
            throw new OperationError("Letter duplicated in the key!");
    }
}

function find_pos (key, letter) {
    let index = key.indexOf(letter);
    if (index >= 0 && index < 49)
        return [Math.floor(index/7), index%7];
    throw new OperationError("Letter " + letter + " is not in the key!");
}

function find_at_pos(key, coord) {
    return key.charAt(coord[1] + (coord[0] * 7));
}

function add_pos(a, b) {
    return [(a[0] + b[0]) % 7, (a[1] + b[1]) % 7];
}

function sub_pos(a, b) {
    let asub = a[0] - b[0];
    let bsub = a[1] - b[1];
    return [asub - (Math.floor(asub/7) * 7), bsub - (Math.floor(bsub/7) * 7)];
}

function encrypt(key, plaintext) {
    check_key(key);
    let mp = [0, 0];
    let ciphertext = '';
    for (const p of plaintext) {
        let pp = find_pos(key, p);
        let mix = find_ix(find_at_pos(key, mp));
        let cp = add_pos(pp, mix);
        let c = find_at_pos(key, cp);
        ciphertext += c;
        key = rotate_right(key, pp[0], 1);
        cp = find_pos(key, c);
        key = rotate_down(key, cp[1], 1);
        mp = add_pos(mp, find_ix(c));
    }
    return ciphertext;
}

function decrypt(key, ciphertext) {
    check_key(key);
    let mp = [0,0];
    let plaintext = '';
    for (const c of ciphertext) {
        let cp = find_pos(key, c);
        let mix = find_ix(find_at_pos(key, mp));
        let pp = sub_pos(cp, mix);
        let p = find_at_pos(key, pp);

        plaintext += p;
        key = rotate_right(key, pp[0], 1);
        cp = find_pos(key, c);
        key = rotate_down(key, cp[1], 1);
        mp = add_pos(mp, find_ix(c));
    }
    return plaintext;
}

export function encrypt_pad(key, plaintext, signature, padding_size) {
    init_tiles();
    check_key(key);
    let padding = "";
    for (let i = 0; i < padding_size; i++) {
        padding += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return encrypt(key, padding+plaintext+'---'+signature);
}

export function decrypt_pad(key, ciphertext, padding_size) {
    init_tiles();
    check_key(key);
    return decrypt(key, ciphertext).slice(padding_size);
}