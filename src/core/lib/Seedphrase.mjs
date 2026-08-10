/**
 * Many Seedphrase specific functions. We cover BIP39 and Electrum2 checksums so far.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023 Wei Lu <luwei.here@gmail.com> and Daniel Cousens <email@dcousens.com> 2014
 * @license ISC
 */

import CryptoApi from "crypto-api/src/crypto-api.mjs";
import {toHex} from "crypto-api/src/encoder/hex.mjs";
import Hmac  from "crypto-api/src/mac/hmac.mjs";
import { fromArrayBuffer } from "crypto-api/src/encoder/array-buffer.mjs";
import {bip39English, electrum2English} from "./SeedphraseWordLists.mjs";

// Dictionary for BIP39.
export const bip39 = {
    "acceptable_lengths": [12, 15, 18, 21, 24],
    "english": bip39English,
    "checksum": validateMnemonic
};

// Dictionary for Electrum2
export const electrum2 = {
    "acceptable_lengths": [12, 14],
    "english": electrum2English,
    "checksum": validateElectrum2Mnemonic
};

// BIP39 Verification code taken from https://github.com/vacuumlabs/bip39-light/blob/master/index.js
const INVALIDMNEMONIC = "Invalid mnemonic";
const INVALIDENTROPY = "Invalid entropy";
const INVALIDCHECKSUM = "Invalid mnemonic checksum";

/**
 * Left pad data.
 * @param {string} str
 * @param {string} padString
 * @param {int} length
 * @returns
 */
function lpad (str, padString, length) {
    while (str.length < length) str = padString + str;
    return str;
}

/**
 * Turns a string of 0 and 1 to bytes.
 * @param {string} bin
 * @returns
 */
function binaryToByte (bin) {
    return parseInt(bin, 2);
}

/**
 * Turns a string of bytes to a binary array
 * @param {string} bytes
 * @returns
 */
function bytesToBinary (bytes) {
    return bytes.map(function (x) {
        return lpad(x.toString(2), "0", 8);
    }).join("");
}

/**
 * Derive the checksum bits for a BIP39 seedphrase.
 * @param {bytes} entropyBuffer
 * @returns
 */
function deriveChecksumBits (entropyBuffer) {
    const ENT = entropyBuffer.length * 8;
    const CS = ENT / 32;
    const hasher= CryptoApi.getHasher("sha256");
    hasher.update(fromArrayBuffer(entropyBuffer));
    const result = hasher.finalize();
    const hexResult = toHex(result);
    const temp = bytesToBinary([parseInt(hexResult.slice(0, 2), 16)]);
    const final = temp.slice(0, CS);
    return final;
}

/**
 * Turns a mnemonic string to the underlying bytes.
 * @param {str} mnemonic
 * @param {list} wordlist
 * @returns
 */
function mnemonicToEntropy (mnemonic, wordlist) {
    const words = mnemonic.split(" ");
    if (words.length % 3 !== 0) throw new Error(INVALIDMNEMONIC);

    // convert word indices to 11 bit binary strings
    const bits = words.map(function (word) {
        const index = wordlist.indexOf(word);
        if (index === -1) throw new Error(INVALIDMNEMONIC);

        return lpad(index.toString(2), "0", 11);
    }).join("");


    // split the binary string into ENT/CS
    const dividerIndex = Math.floor(bits.length / 33) * 32;
    const entropyBits = bits.slice(0, dividerIndex);
    const checksumBits = bits.slice(dividerIndex);

    // calculate the checksum and compare
    const entropyBytes = entropyBits.match(/(.{1,8})/g).map(binaryToByte);
    if (entropyBytes.length < 16) throw new Error(INVALIDENTROPY);
    if (entropyBytes.length > 32) throw new Error(INVALIDENTROPY);
    if (entropyBytes.length % 4 !== 0) throw new Error(INVALIDENTROPY);

    const entropy = Buffer.from(entropyBytes);
    const newChecksum = deriveChecksumBits(entropy);
    if (newChecksum !== checksumBits) throw new Error(INVALIDCHECKSUM);
    return entropy.toString("hex");
}

/**
 * Validates the BIP39 mnemonic string.
 * @param {str} mnemonic
 * @param {list} wordlist
 * @returns
 */
function validateMnemonic (mnemonic, wordlist) {
    try {
        mnemonicToEntropy(mnemonic, wordlist);
    } catch (e) {
        return false;
    }

    return true;
}

// My own code for Electrum2
/**
 * Validates an Electrum2 Mnemonic
 * @param {string} mnemonic
 * @returns
 */
function validateElectrum2Mnemonic(mnemonic) {
    const hasher = CryptoApi.getHasher("sha512");
    const hmac = new Hmac("Seed version", hasher);
    hmac.update(Buffer.from(mnemonic, "utf-8").toString());
    const result = toHex(hmac.finalize());
    return (result.startsWith("01") || result.startsWith("100") || result.startsWith("101") || result.startsWith("102"));
}
