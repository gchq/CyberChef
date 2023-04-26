/**
 * Many Bitcoin specific function. Base58, Extended Key functions and other utility functions
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import CryptoApi from "crypto-api/src/crypto-api.mjs";
import { fromArrayBuffer } from "crypto-api/src/encoder/array-buffer.mjs";
import {toHex} from "crypto-api/src/encoder/hex.mjs";
import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";

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

