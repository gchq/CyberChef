/**
 * Coding algorithms: Base64, Hex, Int16, Chars, BER and PEM
 * version 1.76
 * 2014-2016, Rudolf Nickolaev. All rights reserved.
 *
 * Exported for CyberChef by mshwed [m@ttshwed.com]
 */

/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * THIS SOfTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES Of MERCHANTABILITY AND fITNESS fOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * fOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT Of SUBSTITUTE GOODS OR
 * SERVICES; LOSS Of USE, DATA, OR PROfITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY Of LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT Of THE USE
 * Of THIS SOfTWARE, EVEN If ADVISED Of THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

import gostCrypto from './gostCrypto.mjs';

/**
 * The Coding interface provides string converting methods: Base64, Hex,
 * Int16, Chars, BER and PEM
 * @class GostCoding
 *
 */ // <editor-fold defaultstate="collapsed">
var root = {};
var DataError = Error;
var CryptoOperationData = ArrayBuffer;
var Date = Date;

function buffer(d) {
    if (d instanceof CryptoOperationData)
        return d;
    else if (d && d?.buffer instanceof CryptoOperationData)
        return d.byteOffset === 0 && d.byteLength === d.buffer.byteLength ?
                d.buffer : new Uint8Array(new Uint8Array(d, d.byteOffset, d.byteLength)).buffer;
    else
        throw new DataError('CryptoOperationData required');
} // </editor-fold>

function GostCoding() {
}

/**
 * BASE64 conversion
 *
 * @class GostCoding.Base64
 */
var Base64 = {// <editor-fold defaultstate="collapsed">
    /**
     * Base64.decode convert BASE64 string s to CryptoOperationData
     *
     * @memberOf GostCoding.Base64
     * @param {String} s BASE64 encoded string value
     * @returns {CryptoOperationData} Binary decoded data
     */
    decode: function (s) {
        s = s.replace(/[^A-Za-z0-9\+\/]/g, '');
        var n = s.length,
                k = n * 3 + 1 >> 2, r = new Uint8Array(k);

        for (var m3, m4, u24 = 0, j = 0, i = 0; i < n; i++) {
            m4 = i & 3;
            var c = s.charCodeAt(i);

            c = c > 64 && c < 91 ?
                    c - 65 : c > 96 && c < 123 ?
                    c - 71 : c > 47 && c < 58 ?
                    c + 4 : c === 43 ?
                    62 : c === 47 ?
                    63 : 0;

            u24 |= c << 18 - 6 * m4;
            if (m4 === 3 || n - i === 1) {
                for (m3 = 0; m3 < 3 && j < k; m3++, j++) {
                    r[j] = u24 >>> (16 >>> m3 & 24) & 255;
                }
                u24 = 0;

            }
        }
        return r.buffer;
    },
    /**
     * Base64.encode(data) convert CryptoOperationData data to BASE64 string
     *
     * @memberOf GostCoding.Base64
     * @param {CryptoOperationData} data Bynary data for encoding
     * @returns {String} BASE64 encoded data
     */
    encode: function (data) {
        var slen = 8, d = new Uint8Array(buffer(data));
        var m3 = 2, s = '';
        for (var n = d.length, u24 = 0, i = 0; i < n; i++) {
            m3 = i % 3;
            if (i > 0 && (i * 4 / 3) % (12 * slen) === 0)
                s += '\r\n';
            u24 |= d[i] << (16 >>> m3 & 24);
            if (m3 === 2 || n - i === 1) {
                for (var j = 18; j >= 0; j -= 6) {
                    var c = u24 >>> j & 63;
                    c = c < 26 ? c + 65 : c < 52 ? c + 71 : c < 62 ? c - 4 :
                            c === 62 ? 43 : c === 63 ? 47 : 65;
                    s += String.fromCharCode(c);
                }
                u24 = 0;
            }
        }
        return s.substr(0, s.length - 2 + m3) + (m3 === 2 ? '' : m3 === 1 ? '=' : '==');
    } // </editor-fold>
};

/**
 * BASE64 conversion
 *
 * @memberOf GostCoding
 * @insnance
 * @type GostCoding.Base64
 */
GostCoding.prototype.Base64 = Base64;

/**
 * Text string conversion <br>
 * Methods support charsets: ascii, win1251, utf8, utf16 (ucs2, unicode), utf32 (ucs4)
 *
 * @class GostCoding.Chars
 */
var Chars = (function () { // <editor-fold defaultstate="collapsed">

    var _win1251_ = {
        0x402: 0x80, 0x403: 0x81, 0x201A: 0x82, 0x453: 0x83, 0x201E: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87,
        0x20AC: 0x88, 0x2030: 0x89, 0x409: 0x8A, 0x2039: 0x8B, 0x40A: 0x8C, 0x40C: 0x8D, 0x40B: 0x8E, 0x40f: 0x8f,
        0x452: 0x90, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
        0x2122: 0x99, 0x459: 0x9A, 0x203A: 0x9B, 0x45A: 0x9C, 0x45C: 0x9D, 0x45B: 0x9E, 0x45f: 0x9f,
        0xA0: 0xA0, 0x40E: 0xA1, 0x45E: 0xA2, 0x408: 0xA3, 0xA4: 0xA4, 0x490: 0xA5, 0xA6: 0xA6, 0xA7: 0xA7,
        0x401: 0xA8, 0xA9: 0xA9, 0x404: 0xAA, 0xAB: 0xAB, 0xAC: 0xAC, 0xAD: 0xAD, 0xAE: 0xAE, 0x407: 0xAf,
        0xB0: 0xB0, 0xB1: 0xB1, 0x406: 0xB2, 0x456: 0xB3, 0x491: 0xB4, 0xB5: 0xB5, 0xB6: 0xB6, 0xB7: 0xB7,
        0x451: 0xB8, 0x2116: 0xB9, 0x454: 0xBA, 0xBB: 0xBB, 0x458: 0xBC, 0x405: 0xBD, 0x455: 0xBE, 0x457: 0xBf
    };
    var _win1251back_ = {};
    for (var from in _win1251_) {
        var to = _win1251_[from];
        _win1251back_[to] = from;
    }

    return {
        /**
         * Chars.decode(s, charset) convert string s with defined charset to CryptoOperationData
         *
         * @memberOf GostCoding.Chars
         * @param {string} s Javascript string
         * @param {string} charset Charset, default 'win1251'
         * @returns {CryptoOperationData} Decoded binary data
         */
        decode: function (s, charset) {
            charset = (charset || 'win1251').toLowerCase().replace('-', '');
            var r = [];
            for (var i = 0, j = s.length; i < j; i++) {
                var c = s.charCodeAt(i);
                if (charset === 'utf8') {
                    if (c < 0x80) {
                        r.push(c);
                    } else if (c < 0x800) {
                        r.push(0xc0 + (c >>> 6));
                        r.push(0x80 + (c & 63));
                    } else if (c < 0x10000) {
                        r.push(0xe0 + (c >>> 12));
                        r.push(0x80 + (c >>> 6 & 63));
                        r.push(0x80 + (c & 63));
                    } else if (c < 0x200000) {
                        r.push(0xf0 + (c >>> 18));
                        r.push(0x80 + (c >>> 12 & 63));
                        r.push(0x80 + (c >>> 6 & 63));
                        r.push(0x80 + (c & 63));
                    } else if (c < 0x4000000) {
                        r.push(0xf8 + (c >>> 24));
                        r.push(0x80 + (c >>> 18 & 63));
                        r.push(0x80 + (c >>> 12 & 63));
                        r.push(0x80 + (c >>> 6 & 63));
                        r.push(0x80 + (c & 63));
                    } else {
                        r.push(0xfc + (c >>> 30));
                        r.push(0x80 + (c >>> 24 & 63));
                        r.push(0x80 + (c >>> 18 & 63));
                        r.push(0x80 + (c >>> 12 & 63));
                        r.push(0x80 + (c >>> 6 & 63));
                        r.push(0x80 + (c & 63));
                    }
                } else if (charset === 'unicode' || charset === 'ucs2' || charset === 'utf16') {
                    if (c < 0xD800 || (c >= 0xE000 && c <= 0x10000)) {
                        r.push(c >>> 8);
                        r.push(c & 0xff);
                    } else if (c >= 0x10000 && c < 0x110000) {
                        c -= 0x10000;
                        var first = ((0xffc00 & c) >> 10) + 0xD800;
                        var second = (0x3ff & c) + 0xDC00;
                        r.push(first >>> 8);
                        r.push(first & 0xff);
                        r.push(second >>> 8);
                        r.push(second & 0xff);
                    }
                } else if (charset === 'utf32' || charset === 'ucs4') {
                    r.push(c >>> 24 & 0xff);
                    r.push(c >>> 16 & 0xff);
                    r.push(c >>> 8 & 0xff);
                    r.push(c & 0xff);
                } else if (charset === 'win1251') {
                    if (c >= 0x80) {
                        if (c >= 0x410 && c < 0x450) // А..Яа..я
                            c -= 0x350;
                        else
                            c = _win1251_[c] || 0;
                    }
                    r.push(c);
                } else
                    r.push(c & 0xff);
            }
            return new Uint8Array(r).buffer;
        },
        /**
         * Chars.encode(data, charset) convert CryptoOperationData data to string with defined charset
         *
         * @memberOf GostCoding.Chars
         * @param {CryptoOperationData} data Binary data
         * @param {string} charset Charset, default win1251
         * @returns {string} Encoded javascript string
         */
        encode: function (data, charset) {
            charset = (charset || 'win1251').toLowerCase().replace('-', '');
            var r = [], d = new Uint8Array(buffer(data));
            for (var i = 0, n = d.length; i < n; i++) {
                var c = d[i];
                if (charset === 'utf8') {
                    c = c >= 0xfc && c < 0xfe && i + 5 < n ? // six bytes
                            (c - 0xfc) * 1073741824 + (d[++i] - 0x80 << 24) + (d[++i] - 0x80 << 18) + (d[++i] - 0x80 << 12) + (d[++i] - 0x80 << 6) + d[++i] - 0x80
                            : c >> 0xf8 && c < 0xfc && i + 4 < n ? // five bytes
                            (c - 0xf8 << 24) + (d[++i] - 0x80 << 18) + (d[++i] - 0x80 << 12) + (d[++i] - 0x80 << 6) + d[++i] - 0x80
                            : c >> 0xf0 && c < 0xf8 && i + 3 < n ? // four bytes
                            (c - 0xf0 << 18) + (d[++i] - 0x80 << 12) + (d[++i] - 0x80 << 6) + d[++i] - 0x80
                            : c >= 0xe0 && c < 0xf0 && i + 2 < n ? // three bytes
                            (c - 0xe0 << 12) + (d[++i] - 0x80 << 6) + d[++i] - 0x80
                            : c >= 0xc0 && c < 0xe0 && i + 1 < n ? // two bytes
                            (c - 0xc0 << 6) + d[++i] - 0x80
                            : c; // one byte
                } else if (charset === 'unicode' || charset === 'ucs2' || charset === 'utf16') {
                    c = (c << 8) + d[++i];
                    if (c >= 0xD800 && c < 0xE000) {
                        var first = (c - 0xD800) << 10;
                        c = d[++i];
                        c = (c << 8) + d[++i];
                        var second = c - 0xDC00;
                        c = first + second + 0x10000;
                    }
                } else if (charset === 'utf32' || charset === 'ucs4') {
                    c = (c << 8) + d[++i];
                    c = (c << 8) + d[++i];
                    c = (c << 8) + d[++i];
                } else if (charset === 'win1251') {
                    if (c >= 0x80) {
                        if (c >= 0xC0 && c < 0x100)
                            c += 0x350; // А..Яа..я
                        else
                            c = _win1251back_[c] || 0;
                    }
                }
                r.push(String.fromCharCode(c));
            }
            return r.join('');
        }
    }; // </editor-fold>
})();

/**
 * Text string conversion
 *
 * @memberOf GostCoding
 * @insnance
 * @type GostCoding.Chars
 */
GostCoding.prototype.Chars = Chars;

/**
 * HEX conversion
 *
 * @class GostCoding.Hex
 */
var Hex = {// <editor-fold defaultstate="collapsed">
    /**
     * Hex.decode(s, endean) convert HEX string s to CryptoOperationData in endean mode
     *
     * @memberOf GostCoding.Hex
     * @param {string} s Hex encoded string
     * @param {boolean} endean Little or Big Endean, default Little
     * @returns {CryptoOperationData} Decoded binary data
     */
    decode: function (s, endean) {
        s = s.replace(/[^A-Fa-f0-9]/g, '');
        var n = Math.ceil(s.length / 2), r = new Uint8Array(n);
        s = (s.length % 2 > 0 ? '0' : '') + s;
        if (endean && ((typeof endean !== 'string') ||
                (endean.toLowerCase().indexOf('little') < 0)))
            for (var i = 0; i < n; i++)
                r[i] = parseInt(s.substr((n - i - 1) * 2, 2), 16);
        else
            for (var i = 0; i < n; i++)
                r[i] = parseInt(s.substr(i * 2, 2), 16);
        return r.buffer;
    },
    /**
     * Hex.encode(data, endean) convert CryptoOperationData data to HEX string in endean mode
     *
     * @memberOf GostCoding.Hex
     * @param {CryptoOperationData} data Binary data
     * @param {boolean} endean Little/Big Endean, default Little
     * @returns {string} Hex decoded string
     */
    encode: function (data, endean) {
        var s = [], d = new Uint8Array(buffer(data)), n = d.length;
        if (endean && ((typeof endean !== 'string') ||
                (endean.toLowerCase().indexOf('little') < 0)))
            for (var i = 0; i < n; i++) {
                var j = n - i - 1;
                s[j] = (j > 0 && j % 32 === 0 ? '\r\n' : '') +
                        ('00' + d[i].toString(16)).slice(-2);
            }
        else
            for (var i = 0; i < n; i++)
                s[i] = (i > 0 && i % 32 === 0 ? '\r\n' : '') +
                        ('00' + d[i].toString(16)).slice(-2);
        return s.join('');
    } // </editor-fold>
};

/**
 *  HEX conversion
 * @memberOf GostCoding
 * @insnance
 * @type GostCoding.Hex
 */
GostCoding.prototype.Hex = Hex;

/**
 * String hex-encoded integer conversion
 *
 * @class GostCoding.Int16
 */
var Int16 = {// <editor-fold defaultstate="collapsed">
    /**
     * Int16.decode(s) convert hex big insteger s to CryptoOperationData
     *
     * @memberOf GostCoding.Int16
     * @param {string} s Int16 string
     * @returns {CryptoOperationData} Decoded binary data
     */
    decode: function (s) {
        s = (s || '').replace(/[^\-A-Fa-f0-9]/g, '');
        if (s.length === 0)
            s = '0';
        // Signature
        var neg = false;
        if (s.charAt(0) === '-') {
            neg = true;
            s = s.substring(1);
        }
        // Align 2 chars
        while (s.charAt(0) === '0' && s.length > 1)
            s = s.substring(1);
        s = (s.length % 2 > 0 ? '0' : '') + s;
        // Padding for singanuture
        // '800000' - 'ffffff' - for positive
        // '800001' - 'ffffff' - for negative
        if ((!neg && !/^[0-7]/.test(s)) ||
                (neg && !/^[0-7]|8[0]+$/.test(s)))
            s = '00' + s;
        // Convert hex
        var n = s.length / 2, r = new Uint8Array(n), t = 0;
        for (var i = n - 1; i >= 0; --i) {
            var c = parseInt(s.substr(i * 2, 2), 16);
            if (neg && (c + t > 0)) {
                c = 256 - c - t;
                t = 1;
            }
            r[i] = c;
        }
        return r.buffer;
    },
    /**
     * Int16.encode(data) convert CryptoOperationData data to big integer hex string
     *
     * @memberOf GostCoding.Int16
     * @param {CryptoOperationData} data Binary data
     * @returns {string} Int16 encoded string
     */
    encode: function (data) {
        var d = new Uint8Array(buffer(data)), n = d.length;
        if (d.length === 0)
            return '0x00';
        var s = [], neg = d[0] > 0x7f, t = 0;
        for (var i = n - 1; i >= 0; --i) {
            var v = d[i];
            if (neg && (v + t > 0)) {
                v = 256 - v - t;
                t = 1;
            }
            s[i] = ('00' + v.toString(16)).slice(-2);
        }
        s = s.join('');
        while (s.charAt(0) === '0')
            s = s.substring(1);
        return (neg ? '-' : '') + '0x' + s;
    } // </editor-fold>
};

/**
 * String hex-encoded integer conversion
 * @memberOf GostCoding
 * @insnance
 * @type GostCoding.Int16
 */
GostCoding.prototype.Int16 = Int16;

/**
 * BER, DER, CER conversion
 *
 * @class GostCoding.BER
 */
var BER = (function () { // <editor-fold defaultstate="collapsed">

    // Predefenition block
    function encodeBER(source, format, onlyContent) {
        // Correct primitive type
        var object = source.object;
        if (object === undefined)
            object = source;

        // Determinate tagClass
        var tagClass = source.tagClass = source.tagClass || 0; // Universial default

        // Determinate tagNumber. Use only for Universal class
        if (tagClass === 0) {
            var tagNumber = source.tagNumber;
            if (typeof tagNumber === 'undefined') {
                if (typeof object === 'string') {
                    if (object === '')   // NULL
                        tagNumber = 0x05;
                    else if (/^\-?0x[0-9a-fA-F]+$/.test(object)) // INTEGER
                        tagNumber = 0x02;
                    else if (/^(\d+\.)+\d+$/.test(object)) // OID
                        tagNumber = 0x06;
                    else if (/^[01]+$/.test(object)) // BIT STRING
                        tagNumber = 0x03;
                    else if (/^(true|false)$/.test(object)) // BOOLEAN
                        tagNumber = 0x01;
                    else if (/^[0-9a-fA-F]+$/.test(object)) // OCTET STRING
                        tagNumber = 0x04;
                    else
                        tagNumber = 0x13; // Printable string (later can be changed to UTF8String)
                } else if (typeof object === 'number') { // INTEGER
                    tagNumber = 0x02;
                } else if (typeof object === 'boolean') { // BOOLEAN
                    tagNumber = 0x01;
                } else if (object instanceof Array) { // SEQUENCE
                    tagNumber = 0x10;
                } else if (object instanceof Date) { // GeneralizedTime
                    tagNumber = 0x18;
                } else if (object instanceof CryptoOperationData || (object && object.buffer instanceof CryptoOperationData)) {
                    tagNumber = 0x04;
                } else
                    throw new DataError('Unrecognized type for ' + object);
            }
        }

        // Determinate constructed
        var tagConstructed = source.tagConstructed;
        if (typeof tagConstructed === 'undefined')
            tagConstructed = source.tagConstructed = object instanceof Array;

        // Create content
        var content;
        if (object instanceof CryptoOperationData || (object && object.buffer instanceof CryptoOperationData)) { // Direct
            content = new Uint8Array(buffer(object));
            if (tagNumber === 0x03) { // BITSTRING
                // Set unused bits
                var a = new Uint8Array(buffer(content));
                content = new Uint8Array(a.length + 1);
                content[0] = 0; // No unused bits
                content.set(a, 1);
            }
        } else if (tagConstructed) { // Sub items coding
            if (object instanceof Array) {
                var bytelen = 0, ba = [], offset = 0;
                for (var i = 0, n = object.length; i < n; i++) {
                    ba[i] = encodeBER(object[i], format);
                    bytelen += ba[i].length;
                }
                if (tagNumber === 0x11)
                    ba.sort(function (a, b) { // Sort order for SET components
                        for (var i = 0, n = Math.min(a.length, b.length); i < n; i++) {
                            var r = a[i] - b[i];
                            if (r !== 0)
                                return r;
                        }
                        return a.length - b.length;
                    });
                if (format === 'CER') { // final for CER 00 00
                    ba[n] = new Uint8Array(2);
                    bytelen += 2;
                }
                content = new Uint8Array(bytelen);
                for (var i = 0, n = ba.length; i < n; i++) {
                    content.set(ba[i], offset);
                    offset = offset + ba[i].length;
                }
            } else
                throw new DataError('Constracted block can\'t be primitive');
        } else {
            switch (tagNumber) {
                // 0x00: // EOC
                case 0x01: // BOOLEAN
                    content = new Uint8Array(1);
                    content[0] = object ? 0xff : 0;
                    break;
                case 0x02: // INTEGER
                case 0x0a: // ENUMIRATED
                    content = Int16.decode(
                            typeof object === 'number' ? object.toString(16) : object);
                    break;
                case 0x03: // BIT STRING
                    if (typeof object === 'string') {
                        var unusedBits = 7 - (object.length + 7) % 8;
                        var n = Math.ceil(object.length / 8);
                        content = new Uint8Array(n + 1);
                        content[0] = unusedBits;
                        for (var i = 0; i < n; i++) {
                            var c = 0;
                            for (var j = 0; j < 8; j++) {
                                var k = i * 8 + j;
                                c = (c << 1) + (k < object.length ? (object.charAt(k) === '1' ? 1 : 0) : 0);
                            }
                            content[i + 1] = c;
                        }
                    }
                    break;
                case 0x04:
                    content = Hex.decode(
                            typeof object === 'number' ? object.toString(16) : object);
                    break;
                    // case 0x05: // NULL
                case 0x06: // OBJECT IDENTIFIER
                    var a = object.match(/\d+/g), r = [];
                    for (var i = 1; i < a.length; i++) {
                        var n = +a[i], r1 = [];
                        if (i === 1)
                            n = n + a[0] * 40;
                        do {
                            r1.push(n & 0x7F);
                            n = n >>> 7;
                        } while (n);
                        // reverse order
                        for (j = r1.length - 1; j >= 0; --j)
                            r.push(r1[j] + (j === 0 ? 0x00 : 0x80));
                    }
                    content = new Uint8Array(r);
                    break;
                    // case 0x07: // ObjectDescriptor
                    // case 0x08: // EXTERNAL
                    // case 0x09: // REAL
                    // case 0x0A: // ENUMERATED
                    // case 0x0B: // EMBEDDED PDV
                case 0x0C: // UTF8String
                    content = Chars.decode(object, 'utf8');
                    break;
                    // case 0x10: // SEQUENCE
                    // case 0x11: // SET
                case 0x12: // NumericString
                case 0x16: // IA5String // ASCII
                case 0x13: // PrintableString // ASCII subset
                case 0x14: // TeletexString // aka T61String
                case 0x15: // VideotexString
                case 0x19: // GraphicString
                case 0x1A: // VisibleString // ASCII subset
                case 0x1B: // GeneralString
                    // Reflect on character encoding
                    for (var i = 0, n = object.length; i < n; i++)
                        if (object.charCodeAt(i) > 255)
                            tagNumber = 0x0C;
                    if (tagNumber === 0x0C)
                        content = Chars.decode(object, 'utf8');
                    else
                        content = Chars.decode(object, 'ascii');
                    break;
                case 0x17: // UTCTime
                case 0x18: // GeneralizedTime
                    var result = object.original;
                    if (!result) {
                        var date = new Date(object);
                        date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // to UTC
                        var ms = tagNumber === 0x18 ? date.getMilliseconds().toString() : ''; // Milliseconds, remove trailing zeros
                        while (ms.length > 0 && ms.charAt(ms.length - 1) === '0')
                            ms = ms.substring(0, ms.length - 1);
                        if (ms.length > 0)
                            ms = '.' + ms;
                        result = (tagNumber === 0x17 ? date.getYear().toString().slice(-2) : date.getFullYear().toString()) +
                                ('00' + (date.getMonth() + 1)).slice(-2) +
                                ('00' + date.getDate()).slice(-2) +
                                ('00' + date.getHours()).slice(-2) +
                                ('00' + date.getMinutes()).slice(-2) +
                                ('00' + date.getSeconds()).slice(-2) + ms + 'Z';
                    }
                    content = Chars.decode(result, 'ascii');
                    break;
                case 0x1C: // UniversalString
                    content = Chars.decode(object, 'utf32');
                    break;
                case 0x1E: // BMPString
                    content = Chars.decode(object, 'utf16');
                    break;
            }
        }

        if (!content)
            content = new Uint8Array(0);
        if (content instanceof CryptoOperationData)
            content = new Uint8Array(content);

        if (!tagConstructed && format === 'CER') {
            // Encoding CER-form for string types
            var k;
            switch (tagNumber) {
                case 0x03: // BIT_STRING
                    k = 1; // ingnore unused bit for bit string
                case 0x04: // OCTET_STRING
                case 0x0C: // UTF8String
                case 0x12: // NumericString
                case 0x13: // PrintableString
                case 0x14: // TeletexString
                case 0x15: // VideotexString
                case 0x16: // IA5String
                case 0x19: // GraphicString
                case 0x1A: // VisibleString
                case 0x1B: // GeneralString
                case 0x1C: // UniversalString
                case 0x1E: // BMPString
                    k = k || 0;
                    // Split content on 1000 octet len parts
                    var size = 1000;
                    var bytelen = 0, ba = [], offset = 0;
                    for (var i = k, n = content.length; i < n; i += size - k) {
                        ba[i] = encodeBER({
                            object: new Unit8Array(content.buffer, i, Math.min(size - k, n - i)),
                            tagNumber: tagNumber,
                            tagClass: 0,
                            tagConstructed: false
                        }, format);
                        bytelen += ba[i].length;
                    }
                    ba[n] = new Uint8Array(2); // final for CER 00 00
                    bytelen += 2;
                    content = new Uint8Array(bytelen);
                    for (var i = 0, n = ba.length; i < n; i++) {
                        content.set(ba[i], offset);
                        offset = offset + ba[i].length;
                    }
            }
        }

        // Restore tagNumber for all classes
        if (tagClass === 0)
            source.tagNumber = tagNumber;
        else
            source.tagNumber = tagNumber = source.tagNumber || 0;
        source.content = content;

        if (onlyContent)
            return content;

        // Create header
        // tagNumber
        var ha = [], first = tagClass === 3 ? 0xC0 : tagClass === 2 ? 0x80 :
                tagClass === 1 ? 0x40 : 0x00;
        if (tagConstructed)
            first |= 0x20;
        if (tagNumber < 0x1F) {
            first |= tagNumber & 0x1F;
            ha.push(first);
        } else {
            first |= 0x1F;
            ha.push(first);
            var n = tagNumber, ha1 = [];
            do {
                ha1.push(n & 0x7F);
                n = n >>> 7;
            } while (n)
            // reverse order
            for (var j = ha1.length - 1; j >= 0; --j)
                ha.push(ha1[j] + (j === 0 ? 0x00 : 0x80));
        }
        // Length
        if (tagConstructed && format === 'CER') {
            ha.push(0x80);
        } else {
            var len = content.length;
            if (len > 0x7F) {
                var l2 = len, ha2 = [];
                do {
                    ha2.push(l2 & 0xff);
                    l2 = l2 >>> 8;
                } while (l2);
                ha.push(ha2.length + 0x80); // reverse order
                for (var j = ha2.length - 1; j >= 0; --j)
                    ha.push(ha2[j]);
            } else {
                // simple len
                ha.push(len);
            }
        }
        var header = source.header = new Uint8Array(ha);

        // Result - complete buffer
        var block = new Uint8Array(header.length + content.length);
        block.set(header, 0);
        block.set(content, header.length);
        return block;
    }

    function decodeBER(source, offset) {

        // start pos
        var pos = offset || 0, start = pos;
        var tagNumber, tagClass, tagConstructed,
                content, header, buffer, sub, len;

        if (source.object) {
            // Ready from source
            tagNumber = source.tagNumber;
            tagClass = source.tagClass;
            tagConstructed = source.tagConstructed;
            content = source.content;
            header = source.header;
            buffer = source.object instanceof CryptoOperationData ?
                    new Uint8Array(source.object) : null;
            sub = source.object instanceof Array ? source.object : null;
            len = buffer && buffer.length || null;
        } else {
            // Decode header
            var d = source;

            // Read tag
            var buf = d[pos++];
            tagNumber = buf & 0x1f;
            tagClass = buf >> 6;
            tagConstructed = (buf & 0x20) !== 0;
            if (tagNumber === 0x1f) { // long tag
                tagNumber = 0;
                do {
                    if (tagNumber > 0x1fffffffffff80)
                        throw new DataError('Convertor not supported tag number more then (2^53 - 1) at position ' + offset);
                    buf = d[pos++];
                    tagNumber = (tagNumber << 7) + (buf & 0x7f);
                } while (buf & 0x80);
            }

            // Read len
            buf = d[pos++];
            len = buf & 0x7f;
            if (len !== buf) {
                if (len > 6) // no reason to use Int10, as it would be a huge buffer anyways
                    throw new DataError('Length over 48 bits not supported at position ' + offset);
                if (len === 0)
                    len = null; // undefined
                else {
                    buf = 0;
                    for (var i = 0; i < len; ++i)
                        buf = (buf << 8) + d[pos++];
                    len = buf;
                }
            }

            start = pos;
            sub = null;

            if (tagConstructed) {
                // must have valid content
                sub = [];
                if (len !== null) {
                    // definite length
                    var end = start + len;
                    while (pos < end) {
                        var s = decodeBER(d, pos);
                        sub.push(s);
                        pos += s.header.length + s.content.length;
                    }
                    if (pos !== end)
                        throw new DataError('Content size is not correct for container starting at offset ' + start);
                } else {
                    // undefined length
                    try {
                        for (; ; ) {
                            var s = decodeBER(d, pos);
                            pos += s.header.length + s.content.length;
                            if (s.tagClass === 0x00 && s.tagNumber === 0x00)
                                break;
                            sub.push(s);
                        }
                        len = pos - start;
                    } catch (e) {
                        throw new DataError('Exception ' + e + ' while decoding undefined length content at offset ' + start);
                    }
                }
            }

            // Header and content
            header = new Uint8Array(d.buffer, offset, start - offset);
            content = new Uint8Array(d.buffer, start, len);
            buffer = content;
        }

        // Constructed types - check for string concationation
        if (sub !== null && tagClass === 0) {
            var k;
            switch (tagNumber) {
                case 0x03: // BIT_STRING
                    k = 1; // ingnore unused bit for bit string
                case 0x04: // OCTET_STRING
                case 0x0C: // UTF8String
                case 0x12: // NumericString
                case 0x13: // PrintableString
                case 0x14: // TeletexString
                case 0x15: // VideotexString
                case 0x16: // IA5String
                case 0x19: // GraphicString
                case 0x1A: // VisibleString
                case 0x1B: // GeneralString
                case 0x1C: // UniversalString
                case 0x1E: // BMPString
                    k = k || 0;
                    // Concatination
                    if (sub.length === 0)
                        throw new DataError('No constructed encoding content of string type at offset ' + start);
                    len = k;
                    for (var i = 0, n = sub.length; i < n; i++) {
                        var s = sub[i];
                        if (s.tagClass !== tagClass || s.tagNumber !== tagNumber || s.tagConstructed)
                            throw new DataError('Invalid constructed encoding of string type at offset ' + start);
                        len += s.content.length - k;
                    }
                    buffer = new Uint8Array(len);
                    for (var i = 0, n = sub.length, j = k; i < n; i++) {
                        var s = sub[i];
                        if (k > 0)
                            buffer.set(s.content.subarray(1), j);
                        else
                            buffer.set(s.content, j);
                        j += s.content.length - k;
                    }
                    tagConstructed = false; // follow not required
                    sub = null;
                    break;
            }
        }
        // Primitive types
        var object = '';
        if (sub === null) {
            if (len === null)
                throw new DataError('Invalid tag with undefined length at offset ' + start);

            if (tagClass === 0) {
                switch (tagNumber) {
                    case 0x01: // BOOLEAN
                        object = buffer[0] !== 0;
                        break;
                    case 0x02: // INTEGER
                    case 0x0a: // ENUMIRATED
                        if (len > 6) {
                            object = Int16.encode(buffer);
                        } else {
                            var v = buffer[0];
                            if (buffer[0] > 0x7f)
                                v = v - 256;
                            for (var i = 1; i < len; i++)
                                v = v * 256 + buffer[i];
                            object = v;
                        }
                        break;
                    case 0x03: // BIT_STRING
                        if (len > 5) { // Content buffer
                            object = new Uint8Array(buffer.subarray(1)).buffer;
                        } else { // Max bit mask only for 32 bit
                            var unusedBit = buffer[0],
                                    skip = unusedBit, s = [];
                            for (var i = len - 1; i >= 1; --i) {
                                var b = buffer[i];
                                for (var j = skip; j < 8; ++j)
                                    s.push((b >> j) & 1 ? '1' : '0');
                                skip = 0;
                            }
                            object = s.reverse().join('');
                        }
                        break;
                    case 0x04: // OCTET_STRING
                        object = new Uint8Array(buffer).buffer;
                        break;
                        //  case 0x05: // NULL
                    case 0x06: // OBJECT_IDENTIFIER
                        var s = '',
                                n = 0,
                                bits = 0;
                        for (var i = 0; i < len; ++i) {
                            var v = buffer[i];
                            n = (n << 7) + (v & 0x7F);
                            bits += 7;
                            if (!(v & 0x80)) { // finished
                                if (s === '') {
                                    var m = n < 80 ? n < 40 ? 0 : 1 : 2;
                                    s = m + "." + (n - m * 40);
                                } else
                                    s += "." + n.toString();
                                n = 0;
                                bits = 0;
                            }
                        }
                        if (bits > 0)
                            throw new DataError('Incompleted OID at offset ' + start);
                        object = s;
                        break;
                        //case 0x07: // ObjectDescriptor
                        //case 0x08: // EXTERNAL
                        //case 0x09: // REAL
                        //case 0x0A: // ENUMERATED
                        //case 0x0B: // EMBEDDED_PDV
                    case 0x10: // SEQUENCE
                    case 0x11: // SET
                        object = [];
                        break;
                    case 0x0C: // UTF8String
                        object = Chars.encode(buffer, 'utf8');
                        break;
                    case 0x12: // NumericString
                    case 0x13: // PrintableString
                    case 0x14: // TeletexString
                    case 0x15: // VideotexString
                    case 0x16: // IA5String
                    case 0x19: // GraphicString
                    case 0x1A: // VisibleString
                    case 0x1B: // GeneralString
                        object = Chars.encode(buffer, 'ascii');
                        break;
                    case 0x1C: // UniversalString
                        object = Chars.encode(buffer, 'utf32');
                        break;
                    case 0x1E: // BMPString
                        object = Chars.encode(buffer, 'utf16');
                        break;
                    case 0x17: // UTCTime
                    case 0x18: // GeneralizedTime
                        var shortYear = tagNumber === 0x17;
                        var s = Chars.encode(buffer, 'ascii'),
                                m = (shortYear ?
                                        /^(\d\d)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([01]\d|2[0-3])(?:([0-5]\d)(?:([0-5]\d)(?:[.,](\d{1,3}))?)?)?(Z|[-+](?:[0]\d|1[0-2])([0-5]\d)?)?$/ :
                                        /^(\d\d\d\d)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([01]\d|2[0-3])(?:([0-5]\d)(?:([0-5]\d)(?:[.,](\d{1,3}))?)?)?(Z|[-+](?:[0]\d|1[0-2])([0-5]\d)?)?$/).exec(s);
                        if (!m)
                            throw new DataError('Unrecognized time format "' + s + '" at offset ' + start);
                        if (shortYear) {
                            // Where YY is greater than or equal to 50, the year SHALL be interpreted as 19YY; and
                            // Where YY is less than 50, the year SHALL be interpreted as 20YY
                            m[1] = +m[1];
                            m[1] += (m[1] < 50) ? 2000 : 1900;
                        }
                        var dt = new Date(m[1], +m[2] - 1, +m[3], +(m[4] || '0'), +(m[5] || '0'), +(m[6] || '0'), +(m[7] || '0')),
                                tz = dt.getTimezoneOffset();
                        if (m[8] || tagNumber === 0x17) {
                            if (m[8].toUpperCase() !== 'Z' && m[9]) {
                                tz = tz + parseInt(m[9]);
                            }
                            dt.setMinutes(dt.getMinutes() - tz);
                        }
                        dt.original = s;
                        object = dt;
                        break;
                }
            } else // OCTET_STRING
                object = new Uint8Array(buffer).buffer;
        } else
            object = sub;

        // result
        return {
            tagConstructed: tagConstructed,
            tagClass: tagClass,
            tagNumber: tagNumber,
            header: header,
            content: content,
            object: object
        };
    }

    return {
        /**
         * BER.decode(object, format) convert javascript object to ASN.1 format CryptoOperationData<br><br>
         * If object has members tagNumber, tagClass and tagConstructed
         * it is clear define encoding rules. Else method use defaul rules:
         * <ul>
         *   <li>Empty string or null - NULL</li>
         *   <li>String starts with '0x' and has 0-9 and a-f characters - INTEGER</li>
         *   <li>String like d.d.d.d (d - set of digits) - OBJECT IDENTIFIER</li>
         *   <li>String with characters 0 and 1 - BIT STRING</li>
         *   <li>Strings 'true' or 'false' - BOOLEAN</li>
         *   <li>String has only 0-9 and a-f characters - OCTET STRING</li>
         *   <li>String has only characters with code 0-255 - PrintableString</li>
         *   <li>Other strings - UTF8String</li>
         *   <li>Number - INTEGER</li>
         *   <li>Date - GeneralizedTime</li>
         *   <li>Boolean - SEQUENCE</li>
         *   <li>CryptoOperationData - OCTET STRING</li>
         * </ul>
         * SEQUENCE or SET arrays recursively encoded for each item.<br>
         * OCTET STRING and BIT STRING can presents as array with one item.
         * It means encapsulates encoding for child element.<br>
         *
         * If CONTEXT or APPLICATION classes item presents as array with one
         * item we use EXPLICIT encoding for element, else IMPLICIT encoding.<br>
         *
         * @memberOf GostCoding.BER
         * @param {Object} object Object to encoding
         * @param {string} format Encoding rule: 'DER' or 'CER', default 'DER'
         * @param {boolean} onlyContent Encode content only, without header
         * @returns {CryptoOperationData} BER encoded data
         */
        encode: function (object, format, onlyContent) {
            return encodeBER(object, format, onlyContent).buffer;
        },
        /**
         * BER.encode(data) convert ASN.1 format CryptoOperationData data to javascript object<br><br>
         *
         * Conversion rules to javascript object:
         *  <ul>
         *      <li>BOOLEAN - Boolean object</li>
         *      <li>INTEGER, ENUMIRATED - Integer object if len <= 6 (48 bits) else Int16 encoded string</li>
         *      <li>BIT STRING - Integer object if len <= 5 (w/o unsedBit octet - 32 bits) else String like '10111100' or  Array with one item in case of incapsulates encoding</li>
         *      <li>OCTET STRING - Hex encoded string or Array with one item in case of incapsulates encoding</li>
         *      <li>OBJECT IDENTIFIER - String with object identifier</li>
         *      <li>SEQUENCE, SET - Array of encoded items</li>
         *      <li>UTF8String, NumericString, PrintableString, TeletexString, VideotexString,
         *          IA5String, GraphicString, VisibleString, GeneralString, UniversalString,
         *          BMPString - encoded String</li>
         *      <li>UTCTime, GeneralizedTime - Date</li>
         *  </ul>
         * @memberOf GostCoding.BER
         * @param {(CryptoOperationData|GostCoding.BER)} data Binary data to decode
         * @returns {Object} Javascript object with result of decoding
         */
        decode: function (data) {
            return decodeBER(data.object ? data : new Uint8Array(buffer(data)), 0);
        }
    }; // </editor-fold>
})();

/**
 * BER, DER, CER conversion
 * @memberOf GostCoding
 * @insnance
 * @type GostCoding.BER
 */
GostCoding.prototype.BER = BER;

/**
 * PEM conversion
 * @class GostCoding.PEM
 */
var PEM = {// <editor-fold defaultstate="collapsed">
    /**
     * PEM.encode(data, name) encode CryptoOperationData to PEM format with name label
     *
     * @memberOf GostCoding.PEM
     * @param {(Object|CryptoOperationData)} data Java script object or BER-encoded binary data
     * @param {string} name Name of PEM object: 'certificate', 'private key' etc.
     * @returns {string} Encoded object
     */
    encode: function (data, name) {
        return (name ? '-----BEGIN ' + name.toUpperCase() + '-----\r\n' : '') +
                Base64.encode(data instanceof CryptoOperationData ? data : BER.encode(data)) +
                (name ? '\r\n-----END ' + name.toUpperCase() + '-----' : '');
    },
    /**
     * PEM.decode(s, name, deep) decode PEM format s labeled name to CryptoOperationData or javascript object in according to deep parameter
     *
     * @memberOf GostCoding.PEM
     * @param {string} s PEM encoded string
     * @param {string} name Name of PEM object: 'certificate', 'private key' etc.
     * @param {boolean} deep If true method do BER-decoding, else only BASE64 decoding
     * @param {integer} index Index of decoded value
     * @returns {(Object|CryptoOperationData)} Decoded javascript object if deep=true, else CryptoOperationData for father BER decoding
     */
    decode: function (s, name, deep, index) {
        // Try clear base64
        var re1 = /([A-Za-z0-9\+\/\s\=]+)/g,
                valid = re1.exec(s);
        if (valid[1].length !== s.length)
            valid = false;
        if (!valid && name) {
            // Try with the name
            var re2 = new RegExp(
                    '-----\\s?BEGIN ' + name.toUpperCase() +
                    '-----([A-Za-z0-9\\+\\/\\s\\=]+)-----\\s?END ' +
                    name.toUpperCase() + '-----', 'g');
            valid = re2.exec(s);
        }
        if (!valid) {
            // Try with some name
            var re3 = new RegExp(
                    '-----\\s?BEGIN [A-Z0-9\\s]+' +
                    '-----([A-Za-z0-9\\+\\/\\s\\=]+)-----\\s?END ' +
                    '[A-Z0-9\\s]+-----', 'g');
            valid = re3.exec(s);
        }
        var r = valid && valid[1 + (index || 0)];
        if (!r)
            throw new DataError('Not valid PEM format');
        var out = Base64.decode(r);
        if (deep)
            out = BER.decode(out);
        return out;
    } // </editor-fold>
};

/**
 * PEM conversion
 * @memberOf GostCoding
 * @insnance
 * @type GostCoding.PEM
 */
GostCoding.prototype.PEM = PEM;

if (gostCrypto)
    /**
     * Coding algorithms: Base64, Hex, Int16, Chars, BER and PEM
     *
     * @memberOf gostCrypto
     * @type GostCoding
     */
    gostCrypto.coding = new GostCoding();

export default GostCoding;
