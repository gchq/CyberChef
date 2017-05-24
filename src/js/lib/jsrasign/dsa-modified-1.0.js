/*! dsa-modified-1.0.1.js (c) Recurity Labs GmbH, Kenji Urushimma | github.com/openpgpjs/openpgpjs/blob/master/LICENSE
 */
/*
 * dsa-modified.js - modified DSA class of OpenPGP-JS
 * 
 * Copyright (c) 2011-2013 Recurity Labs GmbH (github.com/openpgpjs)
 *                         Kenji Urushima (kenji.urushima@gmail.com)
 * LICENSE
 *   https://github.com/openpgpjs/openpgpjs/blob/master/LICENSE
 */

/**
 * @fileOverview
 * @name dsa-modified-1.0.js
 * @author Recurity Labs GmbH (github.com/openpgpjs) and Kenji Urushima (kenji.urushima@gmail.com)
 * @version 1.0.1 (2013-Oct-06)
 * @since jsrsasign 4.1.6
 * @license <a href="https://github.com/openpgpjs/openpgpjs/blob/master/LICENSE">LGPL License</a>
 */

if (typeof KJUR == "undefined" || !KJUR) KJUR = {};
if (typeof KJUR.crypto == "undefined" || !KJUR.crypto) KJUR.crypto = {};

/**
 * class for DSA signing and verification
 * @name KJUR.crypto.DSA
 * @class class for DSA signing and verifcation
 * @description
 * <p>
 * CAUTION: Most of the case, you don't need to use this class.
 * Please use {@link KJUR.crypto.Signature} class instead.
 * </p>
 * <p>
 * This class was originally developped by Recurity Labs GmbH for OpenPGP JavaScript library.
 * (See {@link https://github.com/openpgpjs/openpgpjs/blob/master/src/ciphers/asymmetric/dsa.js})
 * </p>
 */
/* https://github.com/openpgpjs/openpgpjs/blob/master/src/ciphers/asymmetric/dsa.js */
KJUR.crypto.DSA = function() {
    this.p = null;
    this.q = null;
    this.g = null;
    this.y = null;
    this.x = null;
    this.type = "DSA";

    //===========================
    // PUBLIC METHODS
    //===========================

    /**
     * set DSA private key by key specs
     * @name setPrivate
     * @memberOf KJUR.crypto.DSA
     * @function
     * @param {BigInteger} p prime P
     * @param {BigInteger} q sub prime Q
     * @param {BigInteger} g base G
     * @param {BigInteger} y public key Y
     * @param {BigInteger} x private key X
     * @since dsa-modified 1.0.0
     */
    this.setPrivate = function(p, q, g, y, x) {
	this.isPrivate = true;
	this.p = p;
	this.q = q;
	this.g = g;
	this.y = y;
	this.x = x;
    };

    /**
     * set DSA public key by key specs
     * @name setPublic
     * @memberOf KJUR.crypto.DSA
     * @function
     * @param {BigInteger} p prime P
     * @param {BigInteger} q sub prime Q
     * @param {BigInteger} g base G
     * @param {BigInteger} y public key Y
     * @since dsa-modified 1.0.0
     */
    this.setPublic = function(p, q, g, y) {
	this.isPublic = true;
	this.p = p;
	this.q = q;
	this.g = g;
	this.y = y;
	this.x = null;
    };

    /**
     * sign to hashed message by this DSA private key object
     * @name signWithMessageHash
     * @memberOf KJUR.crypto.DSA
     * @function
     * @param {String} sHashHex hexadecimal string of hashed message
     * @return {String} hexadecimal string of ASN.1 encoded DSA signature value
     * @since dsa-modified 1.0.0
     */
    this.signWithMessageHash = function(sHashHex) {
	var p = this.p;
	var q = this.q;
	var g = this.g;
	var y = this.y;
	var x = this.x;

	// 1. trim message hash
	var hashHex = sHashHex.substr(0, q.bitLength() / 4);
	var hash = new BigInteger(sHashHex, 16);

	var k = getRandomBigIntegerInRange(BigInteger.ONE.add(BigInteger.ONE),
					   q.subtract(BigInteger.ONE));
	var s1 = (g.modPow(k,p)).mod(q); 
	var s2 = (k.modInverse(q).multiply(hash.add(x.multiply(s1)))).mod(q);

	var result = KJUR.asn1.ASN1Util.jsonToASN1HEX({
		'seq': [{'int': {'bigint': s1}}, {'int': {'bigint': s2}}] 
	    });
	return result;
    };

    /**
     * verify signature by this DSA public key object
     * @name verifyWithMessageHash
     * @memberOf KJUR.crypto.DSA
     * @function
     * @param {String} sHashHex hexadecimal string of hashed message
     * @param {String} hSigVal hexadecimal string of ASN.1 encoded DSA signature value
     * @return {Boolean} true if the signature is valid otherwise false.
     * @since dsa-modified 1.0.0
     */
    this.verifyWithMessageHash = function(sHashHex, hSigVal) {
	var p = this.p;
	var q = this.q;
	var g = this.g;
	var y = this.y;

	// 1. parse ASN.1 signature
	var s1s2 = this.parseASN1Signature(hSigVal);
        var s1 = s1s2[0];
        var s2 = s1s2[1];

	// 2. trim message hash
	var sHashHex = sHashHex.substr(0, q.bitLength() / 4);
	var hash = new BigInteger(sHashHex, 16);

	if (BigInteger.ZERO.compareTo(s1) > 0 ||
	    s1.compareTo(q) > 0 ||
	    BigInteger.ZERO.compareTo(s2) > 0 ||
	    s2.compareTo(q) > 0) {
	    throw "invalid DSA signature";
	}
	var w = s2.modInverse(q);
	var u1 = hash.multiply(w).mod(q);
	var u2 = s1.multiply(w).mod(q);
	var dopublic = g.modPow(u1,p).multiply(y.modPow(u2,p)).mod(p).mod(q);
	return dopublic.compareTo(s1) == 0;
    };

    /**
     * parse hexadecimal ASN.1 DSA signature value
     * @name parseASN1Signature
     * @memberOf KJUR.crypto.DSA
     * @function
     * @param {String} hSigVal hexadecimal string of ASN.1 encoded DSA signature value
     * @return {Array} array [s1, s2] of DSA signature value. Both s1 and s2 are BigInteger.
     * @since dsa-modified 1.0.0
     */
    this.parseASN1Signature = function(hSigVal) {
	try {
	    var s1 = new BigInteger(ASN1HEX.getVbyList(hSigVal, 0, [0], "02"), 16);
	    var s2 = new BigInteger(ASN1HEX.getVbyList(hSigVal, 0, [1], "02"), 16);
	    return [s1, s2];
	} catch (ex) {
	    throw "malformed DSA signature";
	}
    }

    // s1 = ((g**s) mod p) mod q
    // s1 = ((s**-1)*(sha-1(m)+(s1*x) mod q)
    function sign(hashalgo, m, g, p, q, x) {
	// If the output size of the chosen hash is larger than the number of
	// bits of q, the hash result is truncated to fit by taking the number
	// of leftmost bits equal to the number of bits of q.  This (possibly
	// truncated) hash function result is treated as a number and used
	// directly in the DSA signature algorithm.

	var hashHex = KJUR.crypto.Util.hashString(m, hashalgo.toLowerCase());
	var hashHex = hashHex.substr(0, q.bitLength() / 4);
	var hash = new BigInteger(hashHex, 16);

	var k = getRandomBigIntegerInRange(BigInteger.ONE.add(BigInteger.ONE),
					   q.subtract(BigInteger.ONE));
	var s1 = (g.modPow(k,p)).mod(q); 
	var s2 = (k.modInverse(q).multiply(hash.add(x.multiply(s1)))).mod(q);
	var result = new Array();
	result[0] = s1;
	result[1] = s2;
	return result;
    }

    function select_hash_algorithm(q) {
	var usersetting = openpgp.config.config.prefer_hash_algorithm;
	/*
	 * 1024-bit key, 160-bit q, SHA-1, SHA-224, SHA-256, SHA-384, or SHA-512 hash
	 * 2048-bit key, 224-bit q, SHA-224, SHA-256, SHA-384, or SHA-512 hash
	 * 2048-bit key, 256-bit q, SHA-256, SHA-384, or SHA-512 hash
	 * 3072-bit key, 256-bit q, SHA-256, SHA-384, or SHA-512 hash
	 */
	switch (Math.round(q.bitLength() / 8)) {
	case 20: // 1024 bit
	    if (usersetting != 2 &&
		usersetting > 11 &&
		usersetting != 10 &&
		usersetting < 8)
		return 2; // prefer sha1
	    return usersetting;
	case 28: // 2048 bit
	    if (usersetting > 11 &&
		usersetting < 8)
		return 11;
	    return usersetting;
	case 32: // 4096 bit // prefer sha224
	    if (usersetting > 10 &&
		usersetting < 8)
		return 8; // prefer sha256
	    return usersetting;
	default:
	    util.print_debug("DSA select hash algorithm: returning null for an unknown length of q");
	    return null;
	    
	}
    }
    this.select_hash_algorithm = select_hash_algorithm;
	
    function verify(hashalgo, s1,s2,m,p,q,g,y) {
	var hashHex = KJUR.crypto.Util.hashString(m, hashalgo.toLowerCase());
	var hashHex = hashHex.substr(0, q.bitLength() / 4);
	var hash = new BigInteger(hashHex, 16);

	if (BigInteger.ZERO.compareTo(s1) > 0 ||
	    s1.compareTo(q) > 0 ||
	    BigInteger.ZERO.compareTo(s2) > 0 ||
	    s2.compareTo(q) > 0) {
	    util.print_error("invalid DSA Signature");
	    return null;
	}
	var w = s2.modInverse(q);
	var u1 = hash.multiply(w).mod(q);
	var u2 = s1.multiply(w).mod(q);
	var dopublic = g.modPow(u1,p).multiply(y.modPow(u2,p)).mod(p).mod(q);
	return dopublic.compareTo(s1) == 0;
    }
	
    /*
     * unused code. This can be used as a start to write a key generator
     * function.
     */
    function generateKey(bitcount) {
	var qi = new BigInteger(bitcount, primeCenterie);
	var pi = generateP(q, 512);
	var gi = generateG(p, q, bitcount);
	var xi;
	do {
	    xi = new BigInteger(q.bitCount(), rand);
	} while (x.compareTo(BigInteger.ZERO) != 1 && x.compareTo(q) != -1);
	var yi = g.modPow(x, p);
	return {x: xi, q: qi, p: pi, g: gi, y: yi};
    }

    function generateP(q, bitlength, randomfn) {
	if (bitlength % 64 != 0) {
	    return false;
	}
	var pTemp;
	var pTemp2;
	do {
	    pTemp = randomfn(bitcount, true);
	    pTemp2 = pTemp.subtract(BigInteger.ONE);
	    pTemp = pTemp.subtract(pTemp2.remainder(q));
	} while (!pTemp.isProbablePrime(primeCenterie) || pTemp.bitLength() != l);
	return pTemp;
    }
	
    function generateG(p, q, bitlength, randomfn) {
	var aux = p.subtract(BigInteger.ONE);
	var pow = aux.divide(q);
	var gTemp;
	do {
	    gTemp = randomfn(bitlength);
	} while (gTemp.compareTo(aux) != -1 && gTemp.compareTo(BigInteger.ONE) != 1);
	return gTemp.modPow(pow, p);
    }

    function generateK(q, bitlength, randomfn) {
	var tempK;
	do {
	    tempK = randomfn(bitlength, false);
	} while (tempK.compareTo(q) != -1 && tempK.compareTo(BigInteger.ZERO) != 1);
	return tempK;
    }

    function generateR(q,p) {
	k = generateK(q);
	var r = g.modPow(k, p).mod(q);
	return r;
    }

    function generateS(hashfn,k,r,m,q,x) {
        var hash = hashfn(m);
        s = (k.modInverse(q).multiply(hash.add(x.multiply(r)))).mod(q);
	    return s;
    }
    this.sign = sign;
    this.verify = verify;
    // this.generate = generateKey;

    //
    // METHODS FROM 
    // https://github.com/openpgpjs/openpgpjs/blob/master/src/ciphers/openpgp.crypto.js
    //
    function getRandomBigIntegerInRange(min, max) {
	if (max.compareTo(min) <= 0)
	    return;
	var range = max.subtract(min);
	var r = getRandomBigInteger(range.bitLength());
	while (r > range) {
	    r = getRandomBigInteger(range.bitLength());
	}
	return min.add(r);
    }

    function getRandomBigInteger(bits) {
	if (bits < 0)
	    return null;
	var numBytes = Math.floor((bits+7)/8);
	    
	var randomBits = getRandomBytes(numBytes);
	if (bits % 8 > 0) {
	    randomBits = String.fromCharCode((Math.pow(2,bits % 8)-1) &
					     randomBits.charCodeAt(0)) +
		randomBits.substring(1);
	}
	return new BigInteger(hexstrdump(randomBits), 16);
    }

    function getRandomBytes(length) {
	var result = '';
	for (var i = 0; i < length; i++) {
	    result += String.fromCharCode(getSecureRandomOctet());
	}
	return result;
    }

    function getSecureRandomOctet() {
	var buf = new Uint32Array(1);
	window.crypto.getRandomValues(buf);
	return buf[0] & 0xFF;
    }

    // https://github.com/openpgpjs/openpgpjs/blob/master/src/util/util.js
    function hexstrdump(str) {
	if (str == null)
	    return "";
	var r=[];
	var e=str.length;
	var c=0;
	var h;
	while(c<e){
	    h=str[c++].charCodeAt().toString(16);
	    while(h.length<2) h="0"+h;
	    r.push(""+h);
	}
	return r.join('');
    }

    this.getRandomBigIntegerInRange = getRandomBigIntegerInRange;
    this.getRandomBigInteger = getRandomBigInteger;
    this.getRandomBytes = getRandomBytes;
}
