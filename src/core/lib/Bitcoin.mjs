/**
 * Many Bitcoin specific function. Base58, Extended Key functions and other utility functions
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import CryptoApi from "crypto-api/src/crypto-api.mjs";
import { fromArrayBuffer} from "crypto-api/src/encoder/array-buffer.mjs";
import {toHex} from "crypto-api/src/encoder/hex.mjs";
import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";
import BigNumber from "bignumber.js";


/**
 * Validates the length of the passed in input as one of the allowable lengths.
 * @param {*} input
 * @param {*} allowableLengths
 * @returns
 */
function validateLengths(input, allowableLengths) {
    return allowableLengths.includes(input.length);
}

/**
 * Returns true if input is a valid hex string, false otherwise.
 * @param {*} input
 */
export function isHex(input) {
    const re = /^[0-9A-Fa-f]{2,}$/g;
    return re.test(input) && input.length %2 === 0;
}

/**
 * Returns true if input could be interpreted as a byte string, false otherwise.
 */
function isValidBytes(input) {
    for (let i=0; i < input.length; i ++) {
        if (input.charCodeAt(i) > 255) {
            return false;
        }
    }
    return true;
}

/**
 * We validate a passed in input to see if it could be a valid private key.
 * A valid private key is string of length 64 that is valid hex, or of length 32 that could be valid bytes.
 * @param {*} input
 */
export function validatePrivateKey(input) {
    if (!validateLengths(input, [32, 64])) {
        return "Invalid length. We want either 32 or 64 but we got: " + input.length;
    }
    if (input.length === 64 && !isHex(input)) {
        return "We have a string of length 64, but not valid hex. Cannot be interpreted as a private key.";
    }
    if (input.length === 32 && !isValidBytes(input)) {
        return "We have a string of length 32 but cannot cannot be interpreted as valid bytes.";
    }
    return "";
}

/**
 * We validate a passed in input to see if it could be a valid public key.
 * A valid public key (in bytes) is either:
 *  65 bytes beginning with 04
 *  33 bytes beginning with 02 or 03
 * @param {*} input
 */
export function validatePublicKey(input) {
    if (!validateLengths(input, [33, 65, 66, 130])) {
        return "Invalid length. We want either 33, 65 (if bytes) or 66, 130 (if hex) but we got: " + input.length;
    }
    if (isHex(input)) {
        if (!validateLengths(input, [66, 130])) {
            return "We have a hex string, but its length is wrong. We want 66, 130 but we got: " + input.length;
        }
        if (input.length === 66 && (input.slice(0, 2) !== "02" && input.slice(0, 2) !== "03")) {
            return "We have a valid hex string, of reasonable length, (66) but doesn't start with the right value. Correct values are 02, or 03 but we have: " + input.slice(0, 2);
        }
        if (input.length === 130 && input.slice(0, 2) !== "04") {
            return "We have a valid hex string of reasonable length, (130) but doesn't start with the right value. Correct values are 04 but we have: " + input.slice(0, 2);
        }
        return "";
    }
    if (isValidBytes(input)) {
        if (!validateLengths(input, [33, 65])) {
            return "We have a byte string, but its length is wrong. We want 33 or 65 but we got: " + input.length;
        }
        if (input.length === 33 && toHex(input[0]) !== "02" && toHex(input[0]) !== "03") {
            return "We have a valid byte string, of reasonable length, (33) but doesn't start with the right value. Correct values are 02, or 03 but we have: " + toHex(input[0]) ;
        }
        if (input.length === 65 && toHex(input[0]) !== "04") {
            return "We have a valid byte string, of reasonable length, (65) but doesn't start with the right value. Correct value is 04 but we have: " + toHex(input[0]);
        }
        return "";
    }

}

/**
 * We make sure the input is a valid hex string, regardless of if its hex or bytes.
 * If not valid bytes or hex, we throw TypeError.
 * @param {*} input
 * @returns
 */
export function makeSureIsHex(input) {
    if (!(isValidBytes(input)) && !(isHex(input))) {
        throw TypeError("Input: " + input + " is not valid bytes or hex.");
    }
    if (isValidBytes(input) && !isHex(input)) {
        return toHex(input);
    }
    return input;
}

/**
 * We make sure the input is valid bytes, regardless of if its hex or bytes.
 * If not valid bytes or hex, we throw TypeError.
 * @param {*} input
 */
export function makeSureIsBytes(input) {
    if (!(isValidBytes(input)) && !(isHex(input))) {
        throw TypeError("Input: " + input + " is not valid bytes or hex.");
    }
    if (isHex(input)) {
        return fromArrayBuffer(Utils.convertToByteArray(input, "hex"));
    }
    return input;
}

// ################################################ BEGIN HELPER HASH FUNCTIONS #################################################

// SHA256(SHA256(input))
/**
 * Double SHA256 hash the passed in string.
 * @param {string} input
 * @returns
 */
export function doubleSHA(input) {
    const hasher= CryptoApi.getHasher("sha256");
    hasher.update(input);
    const result = hasher.finalize();
    const hasher2 = CryptoApi.getHasher("sha256");
    hasher2.update(result);
    return hasher2.finalize();
}

// RIPEMD160(SHA256(input))
/**
 * Performs the RIPEMD_160(SHA256(input)) hash. This is a common hash pattern in cryptocurrency.
 * @param {string} input
 * @returns
 */
export function hash160Func(input) {
    const sha256Hasher= CryptoApi.getHasher("sha256");
    sha256Hasher.update(input);
    const sha256hash = sha256Hasher.finalize();
    const ripemdHasher=CryptoApi.getHasher("ripemd160");
    ripemdHasher.update(sha256hash);
    return ripemdHasher.finalize();
}

// Tag Hash defined in https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki
/**
 * Tag Hash defined in BIP340 https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki
 * Hash is defined as SHA256(SHA256(tag) || SHA256(tag) || x)
 * @param {*} input
 * @returns
 */
export function tweakHash(input) {
    const sha256Hasher = CryptoApi.getHasher("sha256");
    sha256Hasher.update("TapTweak");
    const tagHash = sha256Hasher.finalize();
    const sha256Hasher2 = CryptoApi.getHasher("sha256");
    sha256Hasher2.update(tagHash);
    sha256Hasher2.update(tagHash);
    sha256Hasher2.update(input);
    const result = sha256Hasher2.finalize();
    return result;
}

/**
 * Given x, returns the point P(x) where the y-coordinate is even. Fails if x is greater than p-1 or if the point does not exist.
 * Since this is mostly going to be used for analysis and not key derivation, failure should be rare but we check anyway.
 * @param {*} input
 * @returns
 */
export function liftX(input) {
    const three = BigNumber(3);
    const seven = BigNumber(7);
    const one = BigNumber(1);
    const four = BigNumber(4);
    const two = BigNumber(2);

    const pHex ="0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F";
    const p = BigNumber(pHex, 16);
    let x;
    try {
        x = BigNumber("0x" + makeSureIsHex(input), 16);
    } catch (TypeError) {
        return -1;
    }
    if (x.comparedTo(p) === 1) {
        return -1;
    } else {
        const temp = x.pow(three, p).plus(seven);
        const ySQ = temp.mod(p);
        const tempExp = (p.plus(one)).idiv(four);
        const y = ySQ.pow(tempExp, p);
        if (y.pow(two, p).comparedTo(ySQ) !== 0) {
            return -1;
        } else {
            return input;
        }

    }
}

// ################################################ END HELPER HASH FUNCTIONS ###################################################


// ################################################ BEGIN BASE58 FUNCTIONS ######################################################

/**
 * Taken and modified from the ToBase58 op.
 * We need this code as the operation code isn't exportable / easily available to other functions.
 * We don't remove non Base58 characters, (we assume this must be done earlier) and we stick to only the Bitcoin alphabet here.
 * @param {*} input
 * @returns
 */
export function base58Encode (input) {
    let alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    input = new Uint8Array(input);

    alphabet = Utils.expandAlphRange(alphabet).join("");
    let result = [0];
    if (alphabet.length !== 58 ||
        [].unique.call(alphabet).length !== 58) {
        throw new OperationError("Error: alphabet must be of length 58");
    }

    if (input.length === 0) {
        return "";
    }

    let zeroPrefix = 0;
    for (let i = 0; i < input.length && input[i] === 0; i++) {
        zeroPrefix++;
    }

    input.forEach(function(b) {
        let carry = (result[0] << 8) + b;
        result[0] = carry % 58;
        carry = (carry / 58) | 0;

        for (let i = 1; i < result.length; i++) {
            carry += result[i] << 8;
            result[i] = carry % 58;
            carry = (carry / 58) | 0;
        }

        while (carry > 0) {
            result.push(carry % 58);
            carry = (carry / 58) | 0;
        }
    });
    result = result.map(function(b) {
        return alphabet[b];
    }).reverse().join("");

    while (zeroPrefix--) {
        result = alphabet[0] + result;
    }

    return result;
}

/**
  * Taken and modified from the FromBase58 op.
  * We need this code as the operation code isn't exportable / easily available to other functions.
  * We don't remove non Base58 characters, (we assume this must be done earlier) and we stick to only the Bitcoin alphabet here.
  * @param {*} input
  * @returns
*/
export function base58Decode (input) {
    let alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    const result = [0];

    alphabet = Utils.expandAlphRange(alphabet).join("");

    if (alphabet.length !== 58 ||
        [].unique.call(alphabet).length !== 58) {
        throw new OperationError("Alphabet must be of length 58");
    }

    if (input.length === 0) return [];

    let zeroPrefix = 0;
    for (let i = 0; i < input.length && input[i] === alphabet[0]; i++) {
        zeroPrefix++;
    }

    [].forEach.call(input, function(c, charIndex) {
        const index = alphabet.indexOf(c);

        if (index === -1) {
            throw new OperationError(`Char '${c}' at position ${charIndex} not in alphabet`);
        }

        let carry = result[0] * 58 + index;
        result[0] = carry & 0xFF;
        carry = carry >> 8;

        for (let i = 1; i < result.length; i++) {
            carry += result[i] * 58;
            result[i] = carry & 0xFF;
            carry = carry >> 8;
        }

        while (carry > 0) {
            result.push(carry & 0xFF);
            carry = carry >> 8;
        }
    });

    while (zeroPrefix--) {
        result.push(0);
    }

    return result.reverse();
}


// Base58 Checksum
/**
 * Base58 Checksum
 * @param {*} input
 * @returns
 */
export function b58DoubleSHAChecksum(input) {
    let byteResult;
    try {
        byteResult = fromArrayBuffer(base58Decode(input));
    } catch (oe) {
        if (oe instanceof OperationError) {
            return false;
        } else {
            throw oe;
        }
    }
    const data = byteResult.slice(0, -4);
    const checksum = byteResult.slice(byteResult.length-4,);
    const hashedData = doubleSHA(data);
    return hashedData.slice(0, 4) === checksum;
}

// ################################################ END BASE58 FUNCTIONS ########################################################

// ################################################ BEGIN EXTRA FUNCTIONS #######################################################
// Function for Deserializing Extended Keys (XPUBs/XPRVs)
/**
 * Function for deserializing an extended key (xpub/xprv).
 * We break down an extended key into its constituent parts, and return the results as JSON.
 * @param {*} input
 * @returns
 */
export function deserializeExtendedKeyFunc (input) {
    if (! b58DoubleSHAChecksum(input)) {
        const output = {"error": "Invalid checksum."};
        return output;
    } else {
        const byteResult = fromArrayBuffer(base58Decode(input));
        const checksum = byteResult.slice(-4);
        const xprv = byteResult.slice(0, -4);
        const version = xprv.slice(0, 4);
        const level = parseInt(toHex(xprv.slice(4, 5)), 16);
        const fingerprint = xprv.slice(5, 9);
        const i = parseInt(toHex(xprv.slice(9, 13)), 16);
        const chaincode = xprv.slice(13, 45);
        const masterkey = xprv.slice(45, 78);

        return {"version": toHex(version), "level": level, "checksum": toHex(checksum), "key": input,
            "fingerprint": toHex(fingerprint), "chaincode": toHex(chaincode), "masterkey": toHex(masterkey), "i": i};
    }
}

// Reverse lookup for version bytes
const versionString = {
    "043587cf": "tpub",
    "04358394": "tprv",
    "044a5262": "upub",
    "044a4e28": "uprv",
    "045f1cf6": "vpub",
    "045f18bc": "vprv",
    "024289ef": "Upub",
    "024285b5": "Uprv",
    "02575483": "Vpub",
    "02575048": "Vprv",
    "0488b21e": "xpub",
    "0488ade4": "xprv",
    "049d7cb2": "ypub",
    "049d7878": "yprv",
    "04b24746": "zpub",
    "04b2430c": "zprv",
    "02aa7ed3": "Zpub",
    "02aa7a99": "Zprv",
    "0295b43f": "Ypub",
    "0295b005": "Yprv",
    "019da462": "Ltub",
    "019d9cfe": "Ltpv",
    "01b26ef6": "Mtub",
    "01b26792": "Mtpv",
    "0436f6e1": "ttub",
    "0436ef7d": "ttpv"
};

// Version byte dictionary.
const versionBytes = {
    "tpub": "043587cf",
    "tprv": "04358394",
    "upub": "044a5262",
    "uprv": "044a4e28",
    "vpub": "045f1cf6",
    "vprv": "045f18bc",
    "Upub": "024289ef",
    "Uprv": "024285b5",
    "Vpub": "02575483",
    "Vprv": "02575048",
    "xpub": "0488b21e",
    "xprv": "0488ade4",
    "ypub": "049d7cb2",
    "yprv": "049d7878",
    "zpub": "04b24746",
    "zprv": "04b2430c",
    "Zpub": "02aa7ed3",
    "Zprv": "02aa7a99",
    "Ypub": "0295b43f",
    "Yprv": "0295b005",
    "Ltub": "019da462",
    "Ltpv": "019d9cfe",
    "Mtub": "01b26ef6",
    "Mtpv": "01b26792",
    "ttub": "0436f6e1",
    "ttpv": "0436ef7d"
};

/**
 * We return the correct version bytes from the versionBytes map, given input string.
 * @param {*} input
 * @returns
 */
export function getExtendedKeyVersion(input) {
    return versionBytes[input];

}

/**
 * Reverse lookup for version string. We take in bytes, output string.
 * @param {*} input
 * @returns
 */
export function getExtendedKeyString(input) {
    return versionString[input];
}

/**
 * Returns valid versions as an array.
 */
export function getVersions() {
    return Object.keys(versionBytes);
}

/**
 * We serialize the extended key based off of the passed in data.
 * We assume that the i value should be interpreted as a Uint32 LE.
 * We assume the level is a number that should be interpreted as a byte.
 * All other arguments are hex.
 * @param {*} version
 * @param {*} level
 * @param {*} fingerprint
 * @param {*} i
 * @param {*} chaincode
 * @param {*} masterkey
 * @returns
 */
export function serializeExtendedKeyFunc (version, level, fingerprint, i, chaincode, masterkey) {
    const iArr = new ArrayBuffer(4);
    const iView = new DataView(iArr);
    iView.setUint32(0, i, false);
    const iAsHex = toHex(fromArrayBuffer(iArr));

    const levelArr = new ArrayBuffer(1);
    const levelView = new DataView(levelArr);
    levelView.setUint8(0, level);
    const levelAsHex = toHex(fromArrayBuffer(levelArr));

    let s = version + levelAsHex + fingerprint + iAsHex + chaincode + masterkey;
    const checksumHash = toHex(doubleSHA(fromArrayBuffer(Utils.convertToByteArray(s, "hex"))));
    s += checksumHash.slice(0, 8);
    return base58Encode(Utils.convertToByteArray(s, "hex"));
}

// Version Byte Info
const versionByteInfo = {
    "BTC": {
        "P2PKH": "00",
        "P2SH": "05",
        "WIF": "80",
        "hrp": "bc"
    },
    "Testnet": {
        "P2PKH": "6F",
        "P2SH": "C4",
        "WIF": "EF",
        "hrp": "tb"
    },
    "LTC": {
        "hrp": "ltc",
        "P2PKH": "30",
        "P2SH": "32",
        "WIF": "B0"
    }
};

/**
 * We get the P2PKH byte for the given cryptocurrency type.
 * @param {string} type
 * @returns
 */
export function getP2PKHVersionByte(type) {
    if (type in versionByteInfo) {
        return versionByteInfo[type].P2PKH;
    } else {
        return "";
    }
}

/**
 * We get the P2SH byte from the given cryptocurrency type.
 * @param {string} type
 * @returns
 */
export function getP2SHVersionByte(type) {
    if (type in versionByteInfo) {
        return versionByteInfo[type].P2SH;
    } else {
        return "";
    }
}

/**
 * We get the private key WIF version byte for the given cryptocurrency type.
 * @param {string} type
 * @returns
 */
export function getWIFVersionByte(type) {
    if (type in versionByteInfo) {
        return versionByteInfo[type].WIF;
    } else {
        return "";
    }
}

/**
 * Returns the human readable part (hrp) for segwit addresses.
 * @param {*} type
 * @returns
 */
export function getHumanReadablePart(type) {
    if (type in versionByteInfo) {
        return versionByteInfo[type].hrp;
    } else {
        return "";
    }
}

// ################################################ END EXTRA FUNCTIONS #########################################################

