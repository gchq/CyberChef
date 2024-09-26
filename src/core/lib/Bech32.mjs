/**
 * Bech32 Encoding and Decoding resources (BIP0173 and BIP0350)
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023, geco 2019
 * @license MIT
 */


// ################################################ BEGIN SEGWIT DECODING FUNCTIONS #################################################

/**
  * Javascript code below taken from:
  * https://github.com/geco/bech32-js/blob/master/bech32-js.js
  * Implements various segwit encoding / decoding functions.
  *
  * MIT License
  *
  * Copyright (c) 2019 geco
  * Permission is hereby granted, free of charge, to any person obtaining a copy
  * of this software and associated documentation files (the "Software"), to deal
  * in the Software without restriction, including without limitation the rights
  * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  * copies of the Software, and to permit persons to whom the Software is
  * furnished to do so, subject to the following conditions:
  *
  * The above copyright notice and this permission notice shall be included in all
  * copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  * SOFTWARE.
*/

// Segwit alphabet
const ALPHABET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

const ALPHABET_MAP = {};
for (let z = 0; z < ALPHABET.length; z++) {
    const x = ALPHABET.charAt(z);
    ALPHABET_MAP[x] = z;
}

/**
 * Polynomial multiply step.
 * Input value is viewed as 32 bit int.
 * Constants taken from the BIP0173 wiki: https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki
 * They are part of the BCH code generator polynomial.
 * @param {string} pre
 * @returns
 */
function polymodStep (pre) {
    const b = pre >> 25;
    return ((pre & 0x1FFFFFF) << 5) ^
    (-((b >> 0) & 1) & 0x3b6a57b2) ^
    (-((b >> 1) & 1) & 0x26508e6d) ^
    (-((b >> 2) & 1) & 0x1ea119fa) ^
    (-((b >> 3) & 1) & 0x3d4233dd) ^
    (-((b >> 4) & 1) & 0x2a1462b3);
}

/**
 * Checks the prefix of a string.
 * @param {*} prefix
 * @returns
 */
function prefixChk (prefix) {
    let chk = 1;
    for (let i = 0; i < prefix.length; ++i) {
        const c = prefix.charCodeAt(i);
        if (c < 33 || c > 126) return "KO";
        chk = polymodStep(chk) ^ (c >> 5);
    }
    chk = polymodStep(chk);

    for (let i = 0; i < prefix.length; ++i) {
        const v = prefix.charCodeAt(i);
        chk = polymodStep(chk) ^ (v & 0x1f);
    }
    return chk;
}

/**
 * Bech32 Checksum
 * We check the entire string to see if its segwit encoded.
 * Lengths and other constants taken from BIP 0173: https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki
 *
 * @param {*} str
 * @returns
 */
function checkbech32 (str) {
    const LIMIT = 90;
    if (str.length < 8) return "KO";
    if (str.length > LIMIT) return "KO";


    const split = str.lastIndexOf("1");
    if (split === -1) return "KO";
    if (split === 0) return "KO";

    const prefix = str.slice(0, split);
    const wordChars = str.slice(split + 1);
    if (wordChars.length < 6) return "KO";

    let chk = prefixChk(prefix);
    if (typeof chk === "string") return "KO";

    const words = [];
    for (let i = 0; i < wordChars.length; ++i) {
        const c = wordChars.charAt(i);
        const v = ALPHABET_MAP[c];
        if (v === undefined) return "KO";
        chk = polymodStep(chk) ^ v;
        if (i + 6 >= wordChars.length) continue;
        words.push(v);
    }
    // Second number is decimal representation of 0x2bc830a3
    // Useful as P2TR addresses are segwit encoded, with different final checksum.
    // Taken from https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki
    if (chk === 1 || chk === 734539939) {
        return "OK";
    } else {
        return "KO";
    }
}

// ################################################ END SEGWIT DECODING FUNCTIONS ###################################################

// ################################################ BEGIN MAIN CHECKSUM FUNCTIONS ###################################################

// Segwit Checksum
/**
 * Segwit Checksum
 * @param {*} str
 * @returns
 */
export function segwitChecksum(str) {
    return (checkbech32(str) === "OK");
}

// ################################################ END MAIN CHECKSUM FUNCTIONS #####################################################


// ################################################ BEGIN SEGWIT ENCODING FUNCTIONS #################################################

// We use this to encode values into segwit encoding.
// Taken from https://github.com/sipa/bech32/blob/master/ref/javascript/bech32.js

// Copyright (c) 2017, 2021 Pieter Wuille
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/**
 * Expands the human readable part.
 * @param {string} hrp
 * @returns
 */
function hrpExpand (hrp) {
    const ret = [];
    let p;
    for (p = 0; p < hrp.length; ++p) {
        ret.push(hrp.charCodeAt(p) >> 5);
    }
    ret.push(0);
    for (p = 0; p < hrp.length; ++p) {
        ret.push(hrp.charCodeAt(p) & 31);
    }
    return ret;
}

const encodings = {
    BECH32: "bech32",
    BECH32M: "bech32m",
};


/**
 * We get the encoding constant.
 * Differentiates between Segwit and P2TR.
 * Constants found in BIP0173: https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki
 * Also BIP0350: https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki
 * @param {string} enc
 * @returns
 */
function getEncodingConst (enc) {
    if (enc === encodings.BECH32) {
        return 1;
    } else if (enc === encodings.BECH32M) {
        return 0x2bc830a3;
    } else {
        return null;
    }
}

// Constants for the BIP0173 BCH Generator polynomial.
const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

/**
 * Separate version of the polymod step. Taken from https://github.com/sipa/bech32/blob/master/ref/javascript/bech32.js
 * Here its an array of values.
 * @param {} values
 * @returns
 */
function polymod (values) {
    let chk = 1;
    for (let p = 0; p < values.length; ++p) {
        const top = chk >> 25;
        chk = (chk & 0x1ffffff) << 5 ^ values[p];
        for (let i = 0; i < 5; ++i) {
            if ((top >> i) & 1) {
                chk ^= GENERATOR[i];
            }
        }
    }
    return chk;
}

/**
 * Creates the Segwit checksum
 * @param {string} hrp
 * @param {string} data
 * @param {string} enc
 * @returns
 */
function createChecksum (hrp, data, enc) {
    const values = hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
    const mod = polymod(values) ^ getEncodingConst(enc);
    const ret = [];
    for (let p = 0; p < 6; ++p) {
        ret.push((mod >> 5 * (5 - p)) & 31);
    }
    return ret;
}

/**
 * Converts bits from base 5 to base 8 or back again as appropriate.
 * @param {*} data
 * @param {*} frombits
 * @param {*} tobits
 * @param {*} pad
 * @returns
 */
function convertbits (data, frombits, tobits, pad) {
    let acc = 0;
    let bits = 0;
    const ret = [];
    const maxv = (1 << tobits) - 1;
    for (let p = 0; p < data.length; ++p) {
        const value = data[p];
        if (value < 0 || (value >> frombits) !== 0) {
            return null;
        }
        acc = (acc << frombits) | value;
        bits += frombits;
        while (bits >= tobits) {
            bits -= tobits;
            ret.push((acc >> bits) & maxv);
        }
    }
    if (pad) {
        if (bits > 0) {
            ret.push((acc << (tobits - bits)) & maxv);
        }
    } else if (bits >= frombits || ((acc << (tobits - bits)) & maxv)) {
        return null;
    }
    return ret;
}

/**
 * Function to encode data into a segwit address.
 * We take in the human readable part, the data, and whether its P2TR or Segwit.
 * @param {string} hrp
 * @param {string} data
 * @param {string} enc
 * @returns
 */
function segwitEncode (hrp, data, enc) {
    const combined = data.concat(createChecksum(hrp, data, enc));
    let ret = hrp + "1";
    for (let p = 0; p < combined.length; ++p) {
        ret += ALPHABET.charAt(combined[p]);
    }
    return ret;
}

/**
 * Turns the public key (as 'program') into the address.
 * @param {*} hrp
 * @param {*} version
 * @param {*} program
 * @returns
 */
export function encodeProgramToSegwit (hrp, version, program) {
    let enc;
    if (version > 0) {
        enc = encodings.BECH32M;
    } else {
        enc = encodings.BECH32;
    }
    const convertedbits = convertbits(program, 8, 5, true);
    const intermediate = [version].concat(convertedbits);
    const ret = segwitEncode(hrp, intermediate, enc);
    return ret;
}


// ################################################ END SEGWIT ENCODING FUNCTIONS ###################################################
