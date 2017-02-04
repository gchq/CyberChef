/*global require */
(/**
 *
 * @param {CryptoApi} CryptoApi
 * @returns {Sha0}
 */
  function (CryptoApi) {
  'use strict';

  // Transform constants
  var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];

  /**
   * @class Sha0
   * @desc Sha0 hasher
   * @implements HasherInterface
   * @extends Hasher32be
   */
  var Sha0 = function sha0(name, options) {
    this.constructor(name, options);
  };
  Sha0.prototype = Object.create(CryptoApi.Hasher32be.prototype);
  /**
   * @memberOf Sha0
   * @constructor
   */
  Sha0.prototype.constructor = function (name, options) {
    CryptoApi.Hasher32be.prototype.constructor.call(this, name, options);
    /**
     * @desc Hash state
     * @memberOf! Sha0#
     * @alias state.hash
     * @type {number[]}
     */
    this.state.hash = [
      0x67452301,
      0xefcdab89,
      0x98badcfe,
      0x10325476,
      0xc3d2e1f0
    ];
    this.W = [];
  };

  /**
   * @memberOf Sha0
   * @method processBlock
   * @param {number[]} M
   */
  Sha0.prototype.processBlock = function processBlock(M) {
    // Working variables
    var a = this.state.hash[0] | 0;
    var b = this.state.hash[1] | 0;
    var c = this.state.hash[2] | 0;
    var d = this.state.hash[3] | 0;
    var e = this.state.hash[4] | 0;

    // Calculate hash
    for (var i = 0; i < 80; i++) {
      if (i < 16) {
        this.W[i] = M[i] | 0;
      } else {
        this.W[i] = (this.W[i - 3] ^ this.W[i - 8] ^ this.W[i - 14] ^ this.W[i - 16]) | 0;
      }

      var t = (CryptoApi.Tools.rotateLeft(a, 5) + e + this.W[i] + K[(i / 20) >> 0]) | 0;
      if (i < 20) {
        t = (t + ((b & c) | (~b & d))) | 0;
      } else if (i < 40) {
        t = (t + (b ^ c ^ d)) | 0;
      } else if (i < 60) {
        t = (t + ((b & c) | (b & d) | (c & d))) | 0;
      } else {
        t = (t + (b ^ c ^ d)) | 0;
      }
      e = d;
      d = c;
      c = CryptoApi.Tools.rotateLeft(b, 30) | 0;
      b = a;
      a = t;
    }

    this.state.hash[0] = (this.state.hash[0] + a) | 0;
    this.state.hash[1] = (this.state.hash[1] + b) | 0;
    this.state.hash[2] = (this.state.hash[2] + c) | 0;
    this.state.hash[3] = (this.state.hash[3] + d) | 0;
    this.state.hash[4] = (this.state.hash[4] + e) | 0;
  };

  /**
   * @memberOf Sha0
   * @method finalize
   * @return {HashArray} hash
   */
  Sha0.prototype.finalize = function finalize() {
    // Add padding
    var padLen = this.state.message.length < 56 ? 56 - this.state.message.length : 120 - this.state.message.length;
    padLen += 4; // @todo fix length to 64 bit
    var padding = new Array(padLen);
    padding[0] = 0x80;

    // Add length
    var lengthBits = this.state.length * 8;
    for (var i = 3; i >= 0; i--) {
      padding.push((lengthBits >> (8 * i)) & 0xff);
    }

    this.updateFromArray(padding);

    var hash = [];
    for (var k = 0, l = this.state.hash.length; k < l; k++) {
      for (var j = 3; j >= 0; j--) {
        hash.push((this.state.hash[k] >> 8 * j) & 0xFF);
      }
    }

    // Return hash
    return CryptoApi.hashArray(hash);
  };

  CryptoApi.Hashers.add('sha0', Sha0);
  return Sha0;
})(
    this.CryptoApi || require('./crypto-api')
);