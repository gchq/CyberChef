// Forked from https://github.com/thesimj/js-salsa20 by cbeuw (Andy Wang)
/*
 * Copyright (c) 2017, Bubelich Mykola
 * https://www.bubelich.com
 *
 * (｡◕‿‿◕｡)
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 * General information
 * Salsa20 is a stream cipher submitted to eSTREAM by Daniel J. Bernstein.
 * It is built on a pseudorandom function based on add-rotate-xor (ARX) operations — 32-bit addition,
 * bitwise addition (XOR) and rotation operations. Salsa20 maps a 256-bit key, a 64-bit nonce,
 * and a 64-bit stream position to a 512-bit block of the key stream (a version with a 128-bit key also exists).
 * This gives Salsa20 the unusual advantage that the user can efficiently seek to any position in the key
 * stream in constant time. It offers speeds of around 4–14 cycles per byte in software on modern x86 processors,
 * and reasonable hardware performance. It is not patented, and Bernstein has written several
 * public domain implementations optimized for common architectures.
 */

/**
 * Construct SalSa20 instance with key and nonce
 * Key should be Uint8Array with 32 bytes
 * None should be Uint8Array with 8 bytes
 *
 *
 * @throws {Error}
 * @param {[number]} key
 * @param {[number]} nonce
 */
const Salsa20 = function (key, nonce) {
    if (key.length !== 16 && key.length !== 32) {
        throw new Error("Key should be a 16 or 32 byte array!");
    }

    if (nonce.length !== 8) {
        throw new Error("Nonce should be 8 byte array!");
    }

    this.rounds = 20;
    const sigma = [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574];
    const tau =   [0x61707865, 0x3120646e, 0x79622d36, 0x6b206574];

    let constant, k;
    if (key.length === 32) {
        constant = sigma;
        k = key;
    } else {
        constant = tau;
        k = key.concat(k);
    }

    this.param = [
      // Constant
        constant[0],
      // Key
        _get32(k, 0),
        _get32(k, 4),
        _get32(k, 8),
        _get32(k, 12),
        constant[1],
      // Nonce
        _get32(nonce, 0),
        _get32(nonce, 4),
      // Counter
        0,
        0,
      // Constant
        constant[2],
      // Key
        _get32(k, 16),
        _get32(k, 20),
        _get32(k, 24),
        _get32(k, 28),
      // Const
        constant[3]
    ];

  // init block 64 bytes //
    this.block = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];

  // internal byte counter //
    this.byteCounter = 0;
};

/**
 *  Encrypt or Decrypt data with key and nonce
 *
 * @param {[number]} data
 * @return {Uint8Array}
 * @private
 */
Salsa20.prototype._update = function (data) {
    /*
    if (data.length === 0) {
        throw new Error("Data should be type of bytes (Uint8Array) and not empty!");
    }
    */

    const output = new Uint8Array(data.length);

  // core function, build block and xor with input data //
    for (let i = 0; i < data.length; i++) {
        if (this.byteCounter === 0 || this.byteCounter === 64) {
            this._salsa();
            this._counterIncrement();
            this.byteCounter = 0;
        }

        output[i] = data[i] ^ this.block[this.byteCounter++];
    }

    return output;
};
/**
 *  Encrypt data with key and nonce
 *
 * @param {Uint8Array} data
 * @return {Uint8Array}
 */
Salsa20.prototype.encrypt = function (data) {
    return this._update(data);
};

/**
 *  Decrypt data with key and nonce
 *
 * @param {Uint8Array} data
 * @return {Uint8Array}
 */
Salsa20.prototype.decrypt = function (data) {
    return this._update(data);
};

Salsa20.prototype._counterIncrement = function () {
  // Max possible blocks is 2^64
    this.param[8] = (this.param[8] + 1) >>> 0;
    if (this.param[8] === 0) {
        this.param[9] = (this.param[9] + 1) >>> 0;
    }
};

Salsa20.prototype._salsa = function () {
    const mix = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let i = 0;
    let b = 0;

    const qr = function (a, b, c, d) {
        mix[b] ^= _rotl(mix[a] + mix[d], 7) >>> 0;
        mix[c] ^= _rotl(mix[b] + mix[a], 9) >>> 0;
        mix[d] ^= _rotl(mix[c] + mix[b], 13) >>> 0;
        mix[a] ^= _rotl(mix[d] + mix[c], 18) >>> 0;
    };

  // copy param array to mix //
    for (i = 0; i < 16; i++) {
        mix[i] = this.param[i];
    }

  // mix rounds //
    for (i = 0; i < this.rounds; i += 2) {
        qr(0, 4, 8, 12);
        qr(5, 9, 13, 1);
        qr(10, 14, 2, 6);
        qr(15, 3, 7, 11);
        qr(0, 1, 2, 3);
        qr(5, 6, 7, 4);
        qr(10, 11, 8, 9);
        qr(15, 12, 13, 14);
    }

    for (i = 0; i < 16; i++) {
    // add
        mix[i] += this.param[i];

    // store
        this.block[b++] = mix[i] & 0xFF;
        this.block[b++] = (mix[i] >>> 8) & 0xFF;
        this.block[b++] = (mix[i] >>> 16) & 0xFF;
        this.block[b++] = (mix[i] >>> 24) & 0xFF;
    }
};

/**
 * Little-endian to uint 32 bytes
 *
 * @param {Uint8Array|[number]} data
 * @param {number} index
 * @return {number}
 * @private
 */
const _get32 = function (data, index) {
    return data[index++] ^ (data[index++] << 8) ^ (data[index++] << 16) ^ (data[index] << 24);
};

/**
 * Cyclic left rotation
 *
 * @param {number} data
 * @param {number} shift
 * @return {number}
 * @private
 */
const _rotl = function (data, shift) {
    return ((data << shift) | (data >>> (32 - shift)));
};

export default Salsa20
;
