/**
 * Minimal Node crypto compatibility layer for the browser build.
 *
 * crypto-browserify does not implement KeyObject or the create*Key helpers
 * used by jsonwebtoken. This shim provides enough of that API for symmetric
 * (HMAC) JWTs and unwraps KeyObject instances before handing them to
 * crypto-browserify.
 *
 * @author Henglie
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
const cryptoBrowserify = require("crypto-browserify");


/**
 * Wrapper for a symmetric key, matching the parts of Node's KeyObject API
 * that jsonwebtoken and jwa rely on.
 */
class KeyObject {
    /**
     * @param {string} type
     * @param {Buffer} key
     */
    constructor(type, key) {
        this.type = type;
        this.key = key;
    }

    /**
     * @returns {Buffer}
     */
    export() {
        return this.key;
    }
}


/**
 * Create a symmetric key object from a string or Buffer.
 *
 * @param {string|Buffer} key
 * @param {string} [encoding]
 * @returns {KeyObject}
 */
function createSecretKey(key, encoding) {
    if (typeof key === "string") {
        key = Buffer.from(key, encoding || "utf8");
    }
    if (!Buffer.isBuffer(key)) {
        throw new TypeError("The key must be a string or Buffer");
    }
    return new KeyObject("secret", key);
}


/**
 * Node's asymmetric key constructors are not available in the browser build.
 *
 * @throws {TypeError}
 */
function createPrivateKey() {
    throw new TypeError("Asymmetric keys are not supported in the browser build");
}


/**
 * Node's asymmetric key constructors are not available in the browser build.
 *
 * @throws {TypeError}
 */
function createPublicKey() {
    throw new TypeError("Asymmetric keys are not supported in the browser build");
}


const createHmac = cryptoBrowserify.createHmac;


/**
 * Call crypto-browserify's createHmac, unwrapping our KeyObject first.
 *
 * @param {string} algorithm
 * @param {string|Buffer|KeyObject} key
 * @returns {*}
 */
function createHmacWithKeyObject(algorithm, key) {
    if (key instanceof KeyObject) {
        key = key.export();
    }
    return createHmac.call(cryptoBrowserify, algorithm, key);
}


module.exports = Object.assign({}, cryptoBrowserify, {
    KeyObject,
    createSecretKey,
    createPrivateKey,
    createPublicKey,
    createHmac: createHmacWithKeyObject
});
