/*! asn1hex-1.1.6.js (c) 2012-2015 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
/*
 * asn1hex.js - Hexadecimal represented ASN.1 string library
 *
 * Copyright (c) 2010-2015 Kenji Urushima (kenji.urushima@gmail.com)
 *
 * This software is licensed under the terms of the MIT License.
 * http://kjur.github.com/jsrsasign/license/
 *
 * The above copyright and license notice shall be 
 * included in all copies or substantial portions of the Software.
 */

/**
 * @fileOverview
 * @name asn1hex-1.1.js
 * @author Kenji Urushima kenji.urushima@gmail.com
 * @version asn1hex 1.1.6 (2015-Jun-11)
 * @license <a href="http://kjur.github.io/jsrsasign/license/">MIT License</a>
 */

/*
 * MEMO:
 *   f('3082025b02...', 2) ... 82025b ... 3bytes
 *   f('020100', 2) ... 01 ... 1byte
 *   f('0203001...', 2) ... 03 ... 1byte
 *   f('02818003...', 2) ... 8180 ... 2bytes
 *   f('3080....0000', 2) ... 80 ... -1
 *
 *   Requirements:
 *   - ASN.1 type octet length MUST be 1. 
 *     (i.e. ASN.1 primitives like SET, SEQUENCE, INTEGER, OCTETSTRING ...)
 */

/**
 * ASN.1 DER encoded hexadecimal string utility class
 * @name ASN1HEX
 * @class ASN.1 DER encoded hexadecimal string utility class
 * @since jsrsasign 1.1
 */
var ASN1HEX = new function() {
    /**
     * get byte length for ASN.1 L(length) bytes
     * @name getByteLengthOfL_AtObj
     * @memberOf ASN1HEX
     * @function
     * @param {String} s hexadecimal string of ASN.1 DER encoded data
     * @param {Number} pos string index
     * @return byte length for ASN.1 L(length) bytes
     */
    this.getByteLengthOfL_AtObj = function(s, pos) {
        if (s.substring(pos + 2, pos + 3) != '8') return 1;
        var i = parseInt(s.substring(pos + 3, pos + 4));
        if (i == 0) return -1;          // length octet '80' indefinite length
        if (0 < i && i < 10) return i + 1;      // including '8?' octet;
        return -2;                              // malformed format
    };

    /**
     * get hexadecimal string for ASN.1 L(length) bytes
     * @name getHexOfL_AtObj
     * @memberOf ASN1HEX
     * @function
     * @param {String} s hexadecimal string of ASN.1 DER encoded data
     * @param {Number} pos string index
     * @return {String} hexadecimal string for ASN.1 L(length) bytes
     */
    this.getHexOfL_AtObj = function(s, pos) {
        var len = this.getByteLengthOfL_AtObj(s, pos);
        if (len < 1) return '';
        return s.substring(pos + 2, pos + 2 + len * 2);
    };

    //   getting ASN.1 length value at the position 'idx' of
    //   hexa decimal string 's'.
    //
    //   f('3082025b02...', 0) ... 82025b ... ???
    //   f('020100', 0) ... 01 ... 1
    //   f('0203001...', 0) ... 03 ... 3
    //   f('02818003...', 0) ... 8180 ... 128
    /**
     * get integer value of ASN.1 length for ASN.1 data
     * @name getIntOfL_AtObj
     * @memberOf ASN1HEX
     * @function
     * @param {String} s hexadecimal string of ASN.1 DER encoded data
     * @param {Number} pos string index
     * @return ASN.1 L(length) integer value
     */
    this.getIntOfL_AtObj = function(s, pos) {
        var hLength = this.getHexOfL_AtObj(s, pos);
        if (hLength == '') return -1;
        var bi;
        if (parseInt(hLength.substring(0, 1)) < 8) {
            bi = new BigInteger(hLength, 16);
        } else {
            bi = new BigInteger(hLength.substring(2), 16);
        }
        return bi.intValue();
    };

    /**
     * get ASN.1 value starting string position for ASN.1 object refered by index 'idx'.
     * @name getStartPosOfV_AtObj
     * @memberOf ASN1HEX
     * @function
     * @param {String} s hexadecimal string of ASN.1 DER encoded data
     * @param {Number} pos string index
     */
    this.getStartPosOfV_AtObj = function(s, pos) {
        var l_len = this.getByteLengthOfL_AtObj(s, pos);
        if (l_len < 0) return l_len;
        return pos + (l_len + 1) * 2;
    };

    /**
     * get hexadecimal string of ASN.1 V(value)
     * @name getHexOfV_AtObj
     * @memberOf ASN1HEX
     * @function
     * @param {String} s hexadecimal string of ASN.1 DER encoded data
     * @param {Number} pos string index
     * @return {String} hexadecimal string of ASN.1 value.
     */
    this.getHexOfV_AtObj = function(s, pos) {
        var pos1 = this.getStartPosOfV_AtObj(s, pos);
        var len = this.getIntOfL_AtObj(s, pos);
        return s.substring(pos1, pos1 + len * 2);
    };

    /**
     * get hexadecimal string of ASN.1 TLV at
     * @name getHexOfTLV_AtObj
     * @memberOf ASN1HEX
     * @function
     * @param {String} s hexadecimal string of ASN.1 DER encoded data
     * @param {Number} pos string index
     * @return {String} hexadecimal string of ASN.1 TLV.
     * @since 1.1
     */
    this.getHexOfTLV_AtObj = function(s, pos) {
        var hT = s.substr(pos, 2);
        var hL = this.getHexOfL_AtObj(s, pos);
        var hV = this.getHexOfV_AtObj(s, pos);
        return hT + hL + hV;
    };

    /**
     * get next sibling starting index for ASN.1 object string
     * @name getPosOfNextSibling_AtObj
     * @memberOf ASN1HEX
     * @function
     * @param {String} s hexadecimal string of ASN.1 DER encoded data
     * @param {Number} pos string index
     * @return next sibling starting index for ASN.1 object string
     */
    this.getPosOfNextSibling_AtObj = function(s, pos) {
        var pos1 = this.getStartPosOfV_AtObj(s, pos);
        var len = this.getIntOfL_AtObj(s, pos);
        return pos1 + len * 2;
    };

    /**
     * get array of indexes of child ASN.1 objects
     * @name getPosArrayOfChildren_AtObj
     * @memberOf ASN1HEX
     * @function
     * @param {String} s hexadecimal string of ASN.1 DER encoded data
     * @param {Number} start string index of ASN.1 object
     * @return {Array of Number} array of indexes for childen of ASN.1 objects
     */
    this.getPosArrayOfChildren_AtObj = function(h, pos) {
        var a = new Array();
        var p0 = this.getStartPosOfV_AtObj(h, pos);
        a.push(p0);

        var len = this.getIntOfL_AtObj(h, pos);
        var p = p0;
        var k = 0;
        while (1) {
            var pNext = this.getPosOfNextSibling_AtObj(h, p);
            if (pNext == null || (pNext - p0  >= (len * 2))) break;
            if (k >= 200) break;
            
            a.push(pNext);
            p = pNext;
            
            k++;
        }
        
        return a;
    };

    /**
     * get string index of nth child object of ASN.1 object refered by h, idx
     * @name getNthChildIndex_AtObj
     * @memberOf ASN1HEX
     * @function
     * @param {String} h hexadecimal string of ASN.1 DER encoded data
     * @param {Number} idx start string index of ASN.1 object
     * @param {Number} nth for child
     * @return {Number} string index of nth child.
     * @since 1.1
     */
    this.getNthChildIndex_AtObj = function(h, idx, nth) {
        var a = this.getPosArrayOfChildren_AtObj(h, idx);
        return a[nth];
    };

    // ========== decendant methods ==============================
    /**
     * get string index of nth child object of ASN.1 object refered by h, idx
     * @name getDecendantIndexByNthList
     * @memberOf ASN1HEX
     * @function
     * @param {String} h hexadecimal string of ASN.1 DER encoded data
     * @param {Number} currentIndex start string index of ASN.1 object
     * @param {Array of Number} nthList array list of nth
     * @return {Number} string index refered by nthList
     * @since 1.1
     * @example
     * The "nthList" is a index list of structured ASN.1 object
     * reference. Here is a sample structure and "nthList"s which
     * refers each objects.
     *
     * SQUENCE               - 
     *   SEQUENCE            - [0]
     *     IA5STRING 000     - [0, 0]
     *     UTF8STRING 001    - [0, 1]
     *   SET                 - [1]
     *     IA5STRING 010     - [1, 0]
     *     UTF8STRING 011    - [1, 1]
     */
    this.getDecendantIndexByNthList = function(h, currentIndex, nthList) {
        if (nthList.length == 0) {
            return currentIndex;
        }
        var firstNth = nthList.shift();
        var a = this.getPosArrayOfChildren_AtObj(h, currentIndex);
        return this.getDecendantIndexByNthList(h, a[firstNth], nthList);
    };

    /**
     * get hexadecimal string of ASN.1 TLV refered by current index and nth index list.
     * @name getDecendantHexTLVByNthList
     * @memberOf ASN1HEX
     * @function
     * @param {String} h hexadecimal string of ASN.1 DER encoded data
     * @param {Number} currentIndex start string index of ASN.1 object
     * @param {Array of Number} nthList array list of nth
     * @return {Number} hexadecimal string of ASN.1 TLV refered by nthList
     * @since 1.1
     */
    this.getDecendantHexTLVByNthList = function(h, currentIndex, nthList) {
        var idx = this.getDecendantIndexByNthList(h, currentIndex, nthList);
        return this.getHexOfTLV_AtObj(h, idx);
    };

    /**
     * get hexadecimal string of ASN.1 V refered by current index and nth index list.
     * @name getDecendantHexVByNthList
     * @memberOf ASN1HEX
     * @function
     * @param {String} h hexadecimal string of ASN.1 DER encoded data
     * @param {Number} currentIndex start string index of ASN.1 object
     * @param {Array of Number} nthList array list of nth
     * @return {Number} hexadecimal string of ASN.1 V refered by nthList
     * @since 1.1
     */
    this.getDecendantHexVByNthList = function(h, currentIndex, nthList) {
        var idx = this.getDecendantIndexByNthList(h, currentIndex, nthList);
        return this.getHexOfV_AtObj(h, idx);
    };
};

/**
 * @since asn1hex 1.1.4
 */
ASN1HEX.getVbyList = function(h, currentIndex, nthList, checkingTag) {
    var idx = this.getDecendantIndexByNthList(h, currentIndex, nthList);
    if (idx === undefined) {
        throw "can't find nthList object";
    }
    if (checkingTag !== undefined) {
        if (h.substr(idx, 2) != checkingTag) {
            throw "checking tag doesn't match: " + 
                h.substr(idx,2) + "!=" + checkingTag;
        }
    }
    return this.getHexOfV_AtObj(h, idx);
};

/**
 * get OID string from hexadecimal encoded value
 * @name hextooidstr
 * @memberOf ASN1HEX
 * @function
 * @param {String} hex hexadecmal string of ASN.1 DER encoded OID value
 * @return {String} OID string (ex. '1.2.3.4.567')
 * @since asn1hex 1.1.5
 */
ASN1HEX.hextooidstr = function(hex) {
    var zeroPadding = function(s, len) {
        if (s.length >= len) return s;
        return new Array(len - s.length + 1).join('0') + s;
    };

    var a = [];

    // a[0], a[1]
    var hex0 = hex.substr(0, 2);
    var i0 = parseInt(hex0, 16);
    a[0] = new String(Math.floor(i0 / 40));
    a[1] = new String(i0 % 40);

    // a[2]..a[n]
   var hex1 = hex.substr(2);
    var b = [];
    for (var i = 0; i < hex1.length / 2; i++) {
    b.push(parseInt(hex1.substr(i * 2, 2), 16));
    }
    var c = [];
    var cbin = "";
    for (var i = 0; i < b.length; i++) {
        if (b[i] & 0x80) {
            cbin = cbin + zeroPadding((b[i] & 0x7f).toString(2), 7);
        } else {
            cbin = cbin + zeroPadding((b[i] & 0x7f).toString(2), 7);
            c.push(new String(parseInt(cbin, 2)));
            cbin = "";
        }
    }

    var s = a.join(".");
    if (c.length > 0) s = s + "." + c.join(".");
    return s;
};

/**
 * get string of simple ASN.1 dump from hexadecimal ASN.1 data
 * @name dump
 * @memberOf ASN1HEX
 * @function
 * @param {String} hex hexadecmal string of ASN.1 data
 * @param {Array} associative array of flags for dump (OPTION)
 * @param {Number} idx string index for starting dump (OPTION)
 * @param {String} indent string (OPTION)
 * @return {String} string of simple ASN.1 dump
 * @since jsrsasign 4.8.3 asn1hex 1.1.6
 * @description
 * This method will get an ASN.1 dump from
 * hexadecmal string of ASN.1 DER encoded data.
 * Here are features:
 * <ul>
 * <li>ommit long hexadecimal string</li>
 * <li>dump encapsulated OCTET STRING (good for X.509v3 extensions)</li>
 * <li>structured/primitive context specific tag support (i.e. [0], [3] ...)</li>
 * <li>automatic decode for implicit primitive context specific tag 
 * (good for X.509v3 extension value)
 *   <ul>
 *   <li>if hex starts '68747470'(i.e. http) it is decoded as utf8 encoded string.</li>
 *   <li>if it is in 'subjectAltName' extension value and is '[2]'(dNSName) tag
 *   value will be encoded as utf8 string</li>
 *   <li>otherwise it shows as hexadecimal string</li>
 *   </ul>
 * </li>
 * </ul>
 * @example
 * // ASN.1 INTEGER
 * ASN1HEX.dump('0203012345')
 * &darr;
 * INTEGER 012345
 * // ASN.1 Object Identifier
 * ASN1HEX.dump('06052b0e03021a')
 * &darr;
 * ObjectIdentifier sha1 (1 3 14 3 2 26)
 * // ASN.1 SEQUENCE
 * ASN1HEX.dump('3006020101020102')
 * &darr;
 * SEQUENCE
 *   INTEGER 01
 *   INTEGER 02
 * // ASN.1 DUMP FOR X.509 CERTIFICATE
 * ASN1HEX.dump(X509.pemToHex(certPEM))
 * &darr;
 * SEQUENCE
 *   SEQUENCE
 *     [0]
 *       INTEGER 02
 *     INTEGER 0c009310d206dbe337553580118ddc87
 *     SEQUENCE
 *       ObjectIdentifier SHA256withRSA (1 2 840 113549 1 1 11)
 *       NULL
 *     SEQUENCE
 *       SET
 *         SEQUENCE
 *           ObjectIdentifier countryName (2 5 4 6)
 *           PrintableString 'US'
 *             :
 */
ASN1HEX.dump = function(hex, flags, idx, indent) {
    var _skipLongHex = function(hex, limitNumOctet) {
	if (hex.length <= limitNumOctet * 2) {
	    return hex;
	} else {
	    var s = hex.substr(0, limitNumOctet) + 
		    "..(total " + hex.length / 2 + "bytes).." +
		    hex.substr(hex.length - limitNumOctet, limitNumOctet);
	    return s;
	};
    };

    if (flags === undefined) flags = { "ommit_long_octet": 32 };
    if (idx === undefined) idx = 0;
    if (indent === undefined) indent = "";
    var skipLongHex = flags.ommit_long_octet;

    if (hex.substr(idx, 2) == "01") {
	var v = ASN1HEX.getHexOfV_AtObj(hex, idx);
	if (v == "00") {
	    return indent + "BOOLEAN FALSE\n";
	} else {
	    return indent + "BOOLEAN TRUE\n";
	}
    }
    if (hex.substr(idx, 2) == "02") {
	var v = ASN1HEX.getHexOfV_AtObj(hex, idx);
	return indent + "INTEGER " + _skipLongHex(v, skipLongHex) + "\n";
    }
    if (hex.substr(idx, 2) == "03") {
	var v = ASN1HEX.getHexOfV_AtObj(hex, idx);
	return indent + "BITSTRING " + _skipLongHex(v, skipLongHex) + "\n";
    }
    if (hex.substr(idx, 2) == "04") {
	var v = ASN1HEX.getHexOfV_AtObj(hex, idx);
	if (ASN1HEX.isASN1HEX(v)) {
	    var s = indent + "OCTETSTRING, encapsulates\n";
	    s = s + ASN1HEX.dump(v, flags, 0, indent + "  ");
	    return s;
	} else {
	    return indent + "OCTETSTRING " + _skipLongHex(v, skipLongHex) + "\n";
	}
    }
    if (hex.substr(idx, 2) == "05") {
	return indent + "NULL\n";
    }
    if (hex.substr(idx, 2) == "06") {
	var hV = ASN1HEX.getHexOfV_AtObj(hex, idx);
        var oidDot = KJUR.asn1.ASN1Util.oidHexToInt(hV);
        var oidName = KJUR.asn1.x509.OID.oid2name(oidDot);
	var oidSpc = oidDot.replace(/\./g, ' ');
        if (oidName != '') {
  	    return indent + "ObjectIdentifier " + oidName + " (" + oidSpc + ")\n";
	} else {
  	    return indent + "ObjectIdentifier (" + oidSpc + ")\n";
	}
    }
    if (hex.substr(idx, 2) == "0c") {
	return indent + "UTF8String '" + hextoutf8(ASN1HEX.getHexOfV_AtObj(hex, idx)) + "'\n";
    }
    if (hex.substr(idx, 2) == "13") {
	return indent + "PrintableString '" + hextoutf8(ASN1HEX.getHexOfV_AtObj(hex, idx)) + "'\n";
    }
    if (hex.substr(idx, 2) == "14") {
	return indent + "TeletexString '" + hextoutf8(ASN1HEX.getHexOfV_AtObj(hex, idx)) + "'\n";
    }
    if (hex.substr(idx, 2) == "16") {
	return indent + "IA5String '" + hextoutf8(ASN1HEX.getHexOfV_AtObj(hex, idx)) + "'\n";
    }
    if (hex.substr(idx, 2) == "17") {
	return indent + "UTCTime " + hextoutf8(ASN1HEX.getHexOfV_AtObj(hex, idx)) + "\n";
    }
    if (hex.substr(idx, 2) == "18") {
	return indent + "GeneralizedTime " + hextoutf8(ASN1HEX.getHexOfV_AtObj(hex, idx)) + "\n";
    }
    if (hex.substr(idx, 2) == "30") {
	if (hex.substr(idx, 4) == "3000") {
	    return indent + "SEQUENCE {}\n";
	}

	var s = indent + "SEQUENCE\n";
	var aIdx = ASN1HEX.getPosArrayOfChildren_AtObj(hex, idx);

	var flagsTemp = flags;
	
	if ((aIdx.length == 2 || aIdx.length == 3) &&
	    hex.substr(aIdx[0], 2) == "06" &&
	    hex.substr(aIdx[aIdx.length - 1], 2) == "04") { // supposed X.509v3 extension
	    var oidHex = ASN1HEX.getHexOfV_AtObj(hex, aIdx[0]);
	    var oidDot = KJUR.asn1.ASN1Util.oidHexToInt(oidHex);
	    var oidName = KJUR.asn1.x509.OID.oid2name(oidDot);

	    var flagsClone = JSON.parse(JSON.stringify(flags));
	    flagsClone.x509ExtName = oidName;
	    flagsTemp = flagsClone;
	}
	
	for (var i = 0; i < aIdx.length; i++) {
	    s = s + ASN1HEX.dump(hex, flagsTemp, aIdx[i], indent + "  ");
	}
	return s;
    }
    if (hex.substr(idx, 2) == "31") {
	var s = indent + "SET\n";
	var aIdx = ASN1HEX.getPosArrayOfChildren_AtObj(hex, idx);
	for (var i = 0; i < aIdx.length; i++) {
	    s = s + ASN1HEX.dump(hex, flags, aIdx[i], indent + "  ");
	}
	return s;
    }
    var tag = parseInt(hex.substr(idx, 2), 16);
    if ((tag & 128) != 0) { // context specific 
	var tagNumber = tag & 31;
	if ((tag & 32) != 0) { // structured tag
	    var s = indent + "[" + tagNumber + "]\n";
	    var aIdx = ASN1HEX.getPosArrayOfChildren_AtObj(hex, idx);
	    for (var i = 0; i < aIdx.length; i++) {
		s = s + ASN1HEX.dump(hex, flags, aIdx[i], indent + "  ");
	    }
	    return s;
	} else { // primitive tag
	    var v = ASN1HEX.getHexOfV_AtObj(hex, idx);
	    if (v.substr(0, 8) == "68747470") { // http
		v = hextoutf8(v);
	    }
	    if (flags.x509ExtName === "subjectAltName" &&
		tagNumber == 2) {
		v = hextoutf8(v);
	    }
	    
	    var s = indent + "[" + tagNumber + "] " + v + "\n";
	    return s;
	}
    }
    return indent + "UNKNOWN(" + hex.substr(idx, 2) + ") " + ASN1HEX.getHexOfV_AtObj(hex, idx) + "\n";
};

/**
 * check wheather the string is ASN.1 hexadecimal string or not
 * @name isASN1HEX
 * @memberOf ASN1HEX
 * @function
 * @param {String} hex string to check whether it is hexadecmal string for ASN.1 DER or not
 * @return {Boolean} true if it is hexadecimal string of ASN.1 data otherwise false
 * @since jsrsasign 4.8.3 asn1hex 1.1.6
 * @description
 * This method checks wheather the argument 'hex' is a hexadecimal string of
 * ASN.1 data or not.
 * @example
 * ASN1HEX.isASN1HEX('0203012345') &rarr; true // PROPER ASN.1 INTEGER
 * ASN1HEX.isASN1HEX('0203012345ff') &rarr; false // TOO LONG VALUE
 * ASN1HEX.isASN1HEX('02030123') &rarr; false // TOO SHORT VALUE
 * ASN1HEX.isASN1HEX('fa3bcd') &rarr; false // WRONG FOR ASN.1
 */
ASN1HEX.isASN1HEX = function(hex) {
    if (hex.length % 2 == 1) return false;

    var intL = ASN1HEX.getIntOfL_AtObj(hex, 0);
    var tV = hex.substr(0, 2);
    var lV = ASN1HEX.getHexOfL_AtObj(hex, 0);
    var hVLength = hex.length - tV.length - lV.length;
    if (hVLength == intL * 2) return true;

    return false;
};
