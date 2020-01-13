import Poly1305 from "./Poly1305.mjs";
import Chacha20 from "./Chacha20.mjs";

// https://github.com/devi/chacha20poly1305/blob/master/chacha20poly1305.js
// Written in 2014 by Devi Mandiri. Public domain.
// Refactored by cbeuw (Andy Wang)

const Chacha20Poly1305 = function (key, nonce) {
    this.chachaKey = key;
    this.nonce = nonce;
    this.chacha20 = new Chacha20(key, nonce);
    this.polykey = this._genPolyKey(key, nonce);
    this.poly1305 = new Poly1305(this.polykey);
};

const _constructAEAD = function (data, ciphertext) {
    const dlen = data.length;
    const clen = ciphertext.length;
    const dpad = dlen % 16;
    const cpad = clen % 16;
    const m = [];
    let i;

    for (i = 0; i < dlen; i++) m.push(data[i]);

    if (dpad !== 0) {
        for (i = (16 - dpad); i--;) m.push(0);
    }

    for (i = 0; i < clen; i++) m.push(ciphertext[i]);

    if (cpad !== 0) {
        for (i = (16 - cpad); i--;) m.push(0);
    }

    const lens = new Buffer(16);
    lens.fill(0);
    lens.writeUInt32LE(dlen, 0);
    lens.writeUInt32LE(clen, 8);
    m.push(...lens);

    return m;
};

Chacha20Poly1305.prototype._genPolyKey = function() {
    const nullBlock = new Uint8Array(Array(64).fill(0));
    const keystream = this.chacha20.encrypt(nullBlock);
    return keystream.slice(0, 32);
};

Chacha20Poly1305.prototype.seal = function(plaintext, data) {
    const ciphertext = this.chacha20.encrypt(plaintext);

    this.poly1305.update(_constructAEAD(data, ciphertext));
    return [ciphertext, this.poly1305.finish()];
};

const _bufEqual = function(mac1, mac2) {
    let dif = 0;
    for (let i = 0; i < 16; i++) {
        dif |= (mac1[i] ^ mac2[i]);
    }
    dif = (dif - 1) >>> 31;
    return (dif & 1) === 1;
};

Chacha20Poly1305.prototype.open = function(ciphertext, data, mac) {
    const plaintext = this.chacha20.decrypt(ciphertext);

    this.poly1305.update(_constructAEAD(data, ciphertext));
    const tag = this.poly1305.finish();

    if (!_bufEqual(tag, mac)) return false;

    return plaintext;
};
export default Chacha20Poly1305
;
