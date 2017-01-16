/** @license
========================================================================
  Crypto API for JavaScript - https://github.com/nf404/crypto-api
  
  The MIT License (MIT)

  Copyright (c) 2015 nf404

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*global module, require */
(/**
 * @param {Object} root
 * @returns {CryptoApi}
 */
    function (root) {
    'use strict';
    /**
     * @class CryptoApi
     * @classdesc Main class
     * @public
     */
    var CryptoApi = function cryptoApi () {
        /**
         * @property Hashers
         * @type {Hashers}
         */
        this.Hashers = new Hashers();
        /**
         * @property Encodes
         * @type {Encodes}
         */
        this.Encodes = new Encodes();
        /**
         * @property Macs
         * @type {Macs}
         */
        this.Macs = new Macs();
        /**
         * @property Tools
         * @type {Tools}
         */
        this.Tools = new Tools();
    };

    /**
     * @interface HasherInterface
     * @classdesc All hashers MUST implement this interface
     * @public
     */
    var HasherInterface = function () {};
    /**
     * @memberOf HasherInterface
     * @constructor
     */
    HasherInterface.prototype.constructor = function constructor() {};
    /**
     * @desc Process ready block
     * @memberOf HasherInterface
     * @method processBlock
     * @param {number[]} block
     */
    HasherInterface.prototype.processBlock = function processBlock(block) {};
    /**
     * Update message
     * @memberOf HasherInterface
     * @method update
     * @param {string} message
     */
    HasherInterface.prototype.update = function update(message) {};
    /**
     * @desc Process last block and return hash
     * @memberOf HasherInterface
     * @method finalize
     * @return {HashArray} hash
     */
    HasherInterface.prototype.finalize = function finalize() {};

    /**
     * @class BaseHasher
     * @param {string} name
     * @param {Object} options
     * @public
     */
    var BaseHasher = function(name, options) {};
    BaseHasher.prototype.constructor = function (name, options) {
        /**
         * @desc Hasher name
         * @property name
         * @type {string}
         */
        this.name = name;
        /**
         * @desc All algorithm variables that changed during process
         * @property state
         * @type {Object}
         */
        this.state = {};
        /**
         * @desc Unprocessed Message
         * @memberof! BaseHasher#
         * @alias state.message
         * @type {number[]}
         */
        this.state.message = [];
        /**
         * @desc Length of message
         * @memberof! BaseHasher#
         * @alias state.length
         * @type {number}
         */
        this.state.length = 0;
        /**
         * @memberof! BaseHasher#
         * @alias state.options
         * @type {Object}
         */
        this.state.options = options;
        this.blockUnits = [];
    };

    /**
     *  Size of unit in bytes (4 = 32 bits)
     * @memberOf BaseHasher
     * @member {number} unitSize
     * @static
     */
    BaseHasher.prototype.unitSize = 4;
    /**
     * Bytes order in unit
     *   0 - normal
     *   1 - reverse
     * @memberOf BaseHasher
     * @member {number} unitOrder
     * @static
     */
    BaseHasher.prototype.unitOrder = 0;
    /**
     * Size of block in units
     * @memberOf BaseHasher
     * @member {number} blockSize
     * @static
     */
    BaseHasher.prototype.blockSize = 16;
    /**
     * Return current state
     * @memberOf BaseHasher
     * @method getState
     * @returns {Object}
     */
    BaseHasher.prototype.getState = function getState() {
        return JSON.parse(JSON.stringify(this.state));
    };
    /**
     * Set state
     * @memberOf BaseHasher
     * @method setState
     * @param {Object} state
     * @return {HasherInterface}
     */
    BaseHasher.prototype.setState = function setState(state) {
        this.state = state;
        return this;
    };

    /**
     * Update message
     * @memberOf BaseHasher
     * @method update
     * @param {string} message
     */
    BaseHasher.prototype.update = function update(message) {
      var l = 0;
      for (var i = 0, msgLen = message.length; i < msgLen; i++) {
        var charcode = message.charCodeAt(i);
        if (charcode < 0x80) {
          this.state.message.push(charcode);
          l += 1;
        }
        else if (charcode < 0x800) {
          this.state.message.push(0xc0 | (charcode >> 6),
            0x80 | (charcode & 0x3f));
          l += 2;
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          this.state.message.push(0xe0 | (charcode >> 12),
            0x80 | ((charcode >> 6) & 0x3f),
            0x80 | (charcode & 0x3f));
          l += 3;
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff) << 10)
            | (message.charCodeAt(i) & 0x3ff));
          this.state.message.push(0xf0 | (charcode >> 18),
            0x80 | ((charcode >> 12) & 0x3f),
            0x80 | ((charcode >> 6) & 0x3f),
            0x80 | (charcode & 0x3f));
          l += 4;
        }
      }
      this.state.length += l;

      this.process();
    };

    /**
     * Update message from array
     * @memberOf BaseHasher
     * @method updateFromArray
     * @param {number[]} message
     * @return {BaseHasher}
     */
    BaseHasher.prototype.updateFromArray = function updateFromArray(message) {
      this.state.length += message.length;
      this.state.message = this.state.message.concat(message);
      this.process();
      return this;
    };

    /**
     * Process ready blocks
     * @memberOf BaseHasher
     * @method process
     */
    BaseHasher.prototype.process = function process() {
      while (this.state.message.length >= this.blockSize * this.unitSize) {
        var j = 0, b = 0, block = this.state.message.splice(0, this.blockSize * this.unitSize);
        if (this.unitSize > 1) {
          this.blockUnits = [];
          for (var i = 0, u = 0; i < block.length; i += this.unitSize, u++) {
            if (this.unitOrder === 1) {
              for (j = this.unitSize - 1, b = 0; j >= 0; j--, b += 8) {
                this.blockUnits[u] |= (block[i + j] << b);
              }
            } else {
              for (j = 0, b = 0; j < this.unitSize; j++, b += 8) {
                this.blockUnits[u] |= (block[i + j] << b);
              }
            }
          }
          this.processBlock(this.blockUnits);
        } else {
          this.processBlock(block);
        }
      }
    };
    /**
     * @memberOf CryptoApi
     * @member {BaseHasher} BaseHasher
     */
    CryptoApi.prototype.BaseHasher = BaseHasher;

    /**
     * @class Hasher8
     * @desc Hasher for 32 bit little endian blocks
     * @extends BaseHasher
     * @param {string} name
     * @param {Object} options
     * @public
     */
    var Hasher8 = function (name, options) {
      this.constructor(name, options);
    };
    Hasher8.prototype = Object.create(BaseHasher.prototype);

    /**
     * @desc Normal order of bytes
     * @memberOf Hasher8#
     * @member {number} unitOrder
     */
    Hasher8.prototype.unitOrder = 0;
    /**
     * @desc Size of unit = 1 byte
     * @memberOf Hasher8#
     * @member {number} unitSize
     */
    Hasher8.prototype.unitSize = 1;

    /**
     * @memberOf Hasher8
     * @constructor
     * @param {string} name
     * @param {Object} options
     */
    Hasher8.prototype.constructor = function (name, options) {
      BaseHasher.prototype.constructor.call(this, name, options);
    };
    /**
     * Process ready blocks
     * @memberOf Hasher8
     * @method process
     */
    Hasher8.prototype.process = function process() {
      while (this.state.message.length >= this.blockSize * this.unitSize) {
        var block = this.state.message.splice(0, this.blockSize * this.unitSize);
        this.blockUnits = [];
        for (var i = 0; i < this.blockSize; i++) {
          this.blockUnits[i] = (block[i]);
        }
        this.processBlock(this.blockUnits);
      }
    };

    /**
     * @memberOf CryptoApi
     * @member {Hasher8} Hasher8
     */
    CryptoApi.prototype.Hasher8 = Hasher8;

  /**
     * @class Hasher32le
     * @desc Hasher for 32 bit little endian blocks
     * @extends BaseHasher
     * @param {string} name
     * @param {Object} options
     * @public
     */
    var Hasher32le = function (name, options) {
      this.constructor(name, options);
    };
    Hasher32le.prototype = Object.create(BaseHasher.prototype);

    Hasher32le.prototype.unitOrder = 0; // Normal order of bytes

    /**
     * @memberOf Hasher32le
     * @constructor
     * @param {string} name
     * @param {Object} options
     */
    Hasher32le.prototype.constructor = function (name, options) {
      BaseHasher.prototype.constructor.call(this, name, options);
    };
    /**
     * Process ready blocks
     * @memberOf Hasher32le
     * @method process
     */
    Hasher32le.prototype.process = function process() {
      while (this.state.message.length >= this.blockSize * this.unitSize) {
        var block = this.state.message.splice(0, this.blockSize * this.unitSize);
        this.blockUnits = [];
        for (var i = 0, b = 0; i < this.blockSize; i++, b+=4) {
          this.blockUnits[i] = (block[b]);
          this.blockUnits[i] |= (block[b + 1] << 8);
          this.blockUnits[i] |= (block[b + 2] << 16);
          this.blockUnits[i] |= (block[b + 3] << 24);
        }
        this.processBlock(this.blockUnits);
      }
    };

    /**
     * @memberOf CryptoApi
     * @member {Hasher32le} Hasher32
     */
    CryptoApi.prototype.Hasher32le = Hasher32le;

    /**
     * @class Hasher32be
     * @desc Hasher for 32 bit big endian blocks
     * @extends BaseHasher
     * @param {string} name
     * @param {Object} options
     * @public
     */
    var Hasher32be = function (name, options) {
      this.constructor(name, options);
    };
    Hasher32be.prototype = Object.create(BaseHasher.prototype);

    Hasher32be.prototype.unitOrder = 1; // Reverse order of bytes

    /**
     * @memberOf Hasher32be
     * @constructor
     * @param {string} name
     * @param {Object} options
     */
    Hasher32be.prototype.constructor = function (name, options) {
        BaseHasher.prototype.constructor.call(this, name, options);
    };
    /**
     * Process ready blocks
     * @memberOf Hasher32be
     * @method process
     */
    Hasher32be.prototype.process = function process() {
      while (this.state.message.length >= this.blockSize * this.unitSize) {
        var block = this.state.message.splice(0, this.blockSize * this.unitSize);
        this.blockUnits = [];
        for (var i = 0, b = 0; i < this.blockSize; i++, b+=4) {
          this.blockUnits[i] = (block[b] << 24);
          this.blockUnits[i] |= (block[b + 1] << 16);
          this.blockUnits[i] |= (block[b + 2] << 8);
          this.blockUnits[i] |= (block[b + 3]);
        }
        this.processBlock(this.blockUnits);
      }
    };

    /**
     * @memberOf CryptoApi
     * @member {Hasher32be} Hasher32be
     */
    CryptoApi.prototype.Hasher32be = Hasher32be;

    /**
     * @interface MacInterface
     * @classdesc All coders MUST implement this interface
     * @public
     */
    var MacInterface = function () {};
    /**
     * @memberOf MacInterface
     * @param {string|number[]} key
     * @param {string} hasher
     * @param {Object} options
     * @constructor
     */
    MacInterface.prototype.constructor = function constructor(key, hasher, options) {};
    /**
     * @desc Process ready block
     * @memberOf MacInterface
     * @method processBlock
     * @param {number[]} block
     */
    MacInterface.prototype.processBlock = function processBlock(block) {};
    /**
     * Update message
     * @memberOf MacInterface
     * @method update
     * @param {string|number[]} message
     * @return {MacInterface}
     */
    MacInterface.prototype.update = function update(message) {};
    /**
     * @desc Process last block and return hash
     * @memberOf MacInterface
     * @method finalize
     * @return {HashArray} hash
     */
    MacInterface.prototype.finalize = function finalize() {};

    /**
     * @class BaseMac
     * @extends BaseHasher
     * @param {string|number[]} key
     * @param {string} hasher
     * @param {Object} options
     * @public
     */
    var BaseMac = function(key, hasher, options) {};
    BaseMac.prototype = Object.create(BaseHasher.prototype);
    BaseMac.prototype.constructor = function (key, hasher, options) {
        BaseHasher.prototype.constructor.call(this, hasher, options);
    };
    /**
     * @memberOf CryptoApi
     * @member {BaseMac} BaseMac
     */
    CryptoApi.prototype.BaseMac = BaseMac;
    /**
     * @interface EncodeInterface
     * @classdesc All encodes MUST implement this interface
     * @public
     */
    var EncodeInterface = function () {};
    /**
     * @memberOf EncodeInterface
     * @constructor
     * @param {HashArray} hash
     */
    EncodeInterface.prototype.constructor = function constructor(hash) {};
    /**
     * @desc Stringify hash
     * @memberOf EncodeInterface
     * @method stringify
     * @returns {string}
     */
    EncodeInterface.prototype.stringify = function encode() {};


    /**
     * @class BaseEncode
     * @desc Encode HashArray
     * @param {HashArray} hash
     * @public
     */
    var BaseEncode = function (hash) {};
    /**
     * @memberOf BaseEncode
     * @constructor
     * @param {HashArray} hash
     */
    BaseEncode.prototype.constructor = function constructor(hash) {
        /**
         * @property hash
         * @type {HashArray}
         */
        this.hash = hash;
    };
    /**
     * @memberOf CryptoApi
     * @member {BaseEncode} BaseEncode
     */
    CryptoApi.prototype.BaseEncode = BaseEncode;

    /**
     * @class Hashers
     * @classdesc Collection of hashers
     */
    var Hashers = function hashers() {
        /**
         * @property hashers
         * @type {Object}
         */
        this.hashers = {};
    };
    /**
     * @memberOf Hashers
     * @method add
     * @param {string} name
     * @param {HasherInterface} hasher
     */
    Hashers.prototype.add = function add(name, hasher) {
        if (hasher === undefined) {
            throw Error('Error adding hasher: ' + name);
        }
        this.hashers[name] = hasher;
    };
    /**
     * @memberOf Hashers
     * @method add
     * @param {string} name
     * @param {Object} options
     * @returns {HasherInterface}
     */
    Hashers.prototype.get = function get(name, options) {
        var Hasher = this.hashers[name];
        if ((Hasher === undefined) && (typeof require !== 'undefined')) {
            var filename = name;
            if (filename === 'sha224') {
                filename = 'sha256';
            }
            require('./hasher.' + filename);
            Hasher = this.hashers[name];
        }
        if (Hasher === undefined) {
            throw Error('No hash algorithm: ' + name);
        }
        return new Hasher(name, options);
    };

    /**
     * @class Encodes
     * @classdesc Collection of encodes
     */
    var Encodes = function encodes() {
        /**
         * @property encodes
         * @type {Object}
         */
        this.encodes = {};
    };
    /**
     * @memberOf Encodes
     * @method add
     * @param {string} name
     * @param {BaseEncode} encode
     */
    Encodes.prototype.add = function add(name, encode) {
        if (encode === undefined) {
            throw Error('Error adding encode: ' + name);
        }
        this.encodes[name] = encode;
    };
    /**
     * @memberOf Encodes
     * @method get
     * @param {string} name
     * @param {HashArray} hash
     * @returns {BaseEncode}
     */
    Encodes.prototype.get = function get(name, hash) {
        var Encode = this.encodes[name];
        if ((Encode === undefined) && (typeof require !== 'undefined')) {
            require('./enc.' + name);
            Encode = this.encodes[name];
        }
        if (Encode === undefined) {
            throw Error('No encode type: ' + name);
        }
        return new Encode(hash);
    };

    /**
     * @class Macs
     * @classdesc Collection of macs
     */
    var Macs = function macs() {
        /**
         * @property macs
         * @type {Object}
         */
        this.macs = {};
    };
    /**
     * @memberOf Macs
     * @method add
     * @param {string} name
     * @param {BaseMac} mac
     */
    Macs.prototype.add = function add(name, mac) {
        if (mac === undefined) {
            throw Error('Error adding mac: ' + name);
        }
        this.macs[name] = mac;
    };
    /**
     * @memberOf Macs
     * @method get
     * @param {string} name
     * @param {string|number[]} key
     * @param {string} hasher
     * @param {Object} options
     * @returns {MacInterface}
     */
    Macs.prototype.get = function get(name, key, hasher, options) {
        var Mac = this.macs[name];
        if ((Mac === undefined) && (typeof require !== 'undefined')) {
            require('./mac.' + name);
            Mac = this.macs[name];
        }
        if (Mac === undefined) {
            throw Error('No mac type: ' + name);
        }
        return new Mac(key, hasher, options);
    };

    /**
     * @class Tools
     * @classdesc Helper with some methods
     */
    var Tools = function tools() {};
    /**
     * Rotate x to n bits left
     * @memberOf Tools
     * @method rotateLeft
     * @param {number} x
     * @param {number} n
     * @returns {number}
     */
    Tools.prototype.rotateLeft = function rotateLeft(x, n) {
        return ((x << n) | (x >>> (32 - n))) | 0;
    };
    /**
     * Rotate x to n bits right
     * @memberOf Tools
     * @method rotateLeft
     * @param {number} x
     * @param {number} n
     * @returns {number}
     */
    Tools.prototype.rotateRight = function rotateLeft(x, n) {
        return ((x >>> n) | (x << (32 - n))) | 0;
    };
    /**
     * @class HashArray
     * @classdesc Array of hash bytes
     * @instanceof {Array}
     * @param {number[]} hash
     * @param {Encodes} Encodes
     * @public
     */
    var HashArray = function (hash, Encodes) {
        Array.prototype.push.apply(this, hash);
        /**
         * @property Encodes
         * @type {Encodes}
         */
        this.Encodes = Encodes;
    };
    HashArray.prototype = Object.create(Array.prototype);
    HashArray.prototype.constructor = HashArray;

    /**
     * Get hash as string
     * @param {string} method
     * @returns {string|*}
     */
    HashArray.prototype.stringify = function stringify(method) {
        return this.Encodes.get(method, this).stringify();
    };

    /**
     * Hash message with algo
     *
     * @memberof CryptoApi
     * @method hash
     * @public
     * @param {string} algo
     * @param {string} message
     * @param {Object} options
     * @return {HashArray} hash
     */
    CryptoApi.prototype.hash = function hash(algo, message, options) {
      var hash = this.hasher(algo, options);
      hash.update(message);
        return hash.finalize();
    };
    /**
     * Get new Hasher object
     *
     * @memberof CryptoApi
     * @method hasher
     * @public
     * @param {string} algo
     * @param {Object} options
     * @returns {HasherInterface}
     */
    CryptoApi.prototype.hasher = function hasher(algo, options) {
        return this.Hashers.get(algo, options);
    };
    /**
     * Get new MAC object
     *
     * @memberof CryptoApi
     * @method mac
     * @public
     * @param {string} algo
     * @param {string|number[]} key
     * @param {string} hasher
     * @param {Object} options
     * @returns {MacInterface}
     */
    CryptoApi.prototype.mac = function mac(algo, key, hasher, options) {
        return this.Macs.get(algo, key, hasher, options);
    };
    /**
     * Get new HashArray
     *
     * @memberof CryptoApi
     * @method hashArray
     * @public
     * @param {number[]} hash
     * @returns {HashArray}
     */
    CryptoApi.prototype.hashArray = function hashArray(hash) {
        return new HashArray(hash, this.Encodes);
    };
    root.CryptoApi = new CryptoApi();
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = root.CryptoApi;
    } else {
        return root.CryptoApi;
    }
})(this);