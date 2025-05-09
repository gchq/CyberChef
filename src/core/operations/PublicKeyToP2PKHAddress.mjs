/**
 * Turns a public key into a cryptocurrency address. Supports Bitcoin (P2PKH, P2SH-P2WPKH, Segwit) as well as Ethereum.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023, geco 2019
 * @license MIT
 */

import Operation from "../Operation.mjs";
import { fromArrayBuffer } from "crypto-api/src/encoder/array-buffer.mjs";
import {toHex} from "crypto-api/src/encoder/hex.mjs";
import { base58Encode, getP2PKHVersionByte, getP2SHVersionByte, hash160Func, doubleSHA,  getHumanReadablePart, makeSureIsBytes, validatePublicKey, tweakHash, liftX, makeSureIsHex} from "../lib/Bitcoin.mjs";
import {encodeProgramToSegwit} from "../lib/Bech32.mjs";
import Utils from "../Utils.mjs";
import ec from "elliptic";

/**
 * Tweaks the key in compliance with BIP340. Needed for creating P2TR addresses.
 * @param {*} input
 */
function tweakKey(input) {
    // First EC Context.
    const ecContext = ec.ec("secp256k1");

    // We lift the passed in, input, dropping the first byte.
    const liftedKey = liftX(makeSureIsHex(input).slice(2,));
    if (liftedKey === -1)
        return -1;
    // We then run the input through the tweakHash, getting the first tweaked Private Key;
    const tweakedKey = tweakHash(makeSureIsBytes(liftedKey));
    // We turn the first private key, into a SECP256k1 Key.
    const key = ecContext.keyFromPrivate(makeSureIsHex(tweakedKey));

    // We take the lifted key, cast it back to a public key
    const newKey = "02".concat(makeSureIsHex(liftedKey));
    const ecContext1 = ec.ec("secp256k1");
    const otherKey = ecContext1.keyFromPublic(newKey, "hex");

    // We add the public keys together and return the result as compressed.
    const final = otherKey.getPublic().add(key.getPublic());
    return final.encodeCompressed("hex");
}
 /**
 * Converts a Public Key to a P2PKH Address of the given type.
 */
class PublicKeyToP2PKHAddress extends Operation {

    /**
     * Converts a public key to a P2PKH Address.
     */
    constructor() {
        super();

        this.name = "Public Key To Bitcoin-Like Address";
        this.module = "Default";
        this.description = "Turns a public key into a Bitcoin-Like cryptocurrency address. Can select P2PKH, P2SH-P2WPKH, P2WPKH and P2TR addresses for Bitcoin and Testnet.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Currency Type",
                "type": "option",
                "value": ["BTC", "Testnet", "LTC"]
            },
            {
                "name": "Address Type",
                "type": "option",
                "value": ["P2PKH (V1 BTC Addresses)", "P2SH-P2PWPKH (Segwit Compatible V3 Addresses)", "Segwit (P2WPKH bc1 Addresses)", "Taproot (P2TR bc1p Addresses)"]
            }
        ];
        this.checks = [
            {
                pattern: "^0[3|2][a-fA-F0-9]{64}$",
                flags: "",
                args: ["BTC", "P2PKH (V1 BTC Addresses)"]
            },

        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        // We check if input is blank.
        // If its blank or just whitespace, we don't need to bother dealing with it.
        if (input.trim().length === 0) {
            return "";
        }
        if (validatePublicKey(input) !== "") {
            return validatePublicKey(input);
        }
        // P2TR are their own separate case. We handle those first.
        if (args[1] === "Taproot (P2TR bc1p Addresses)") {
            const hrp = getHumanReadablePart(args[0]);
            const resultKey = tweakKey(input);
            if (resultKey === -1) {
                return "Error: Bad Public Key to turn into P2TR Address.";
            }
            return encodeProgramToSegwit(hrp, 1, Utils.convertToByteArray(resultKey.slice(2,), "hex"));
        } else {
            // We hash the input
            const curInput = makeSureIsBytes(input);
            const hash160 = toHex(hash160Func(curInput));
            // We do segwit addresses first.
            if (args[1] === "Segwit (P2WPKH bc1 Addresses)") {
                const redeemScript = hash160;
                const hrp = getHumanReadablePart(args[0]);
                if (hrp !== "") {
                    return encodeProgramToSegwit(hrp, 0, Utils.convertToByteArray(redeemScript, "hex"));
                } else {
                    return args[0] + " does not support Segwit Addresses.";
                }
            }
            // It its not segwit, we create the redeemScript either for P2PKH or P2SH-P2WPKH addresses.
            const versionByte = "P2PKH (V1 BTC Addresses)" === args[1] ? getP2PKHVersionByte(args[0]) : getP2SHVersionByte(args[0]);
            // If its a P2SH-P2WPKH address, we have to prepend some extra bytes and hash again. Either way we prepend the version byte.
            let hashRedeemedScript;
            if (args[1] === "P2SH-P2PWPKH (Segwit Compatible V3 Addresses)") {
                const redeemScript = "0014" + hash160;
                hashRedeemedScript = versionByte + toHex(hash160Func(fromArrayBuffer(Utils.convertToByteArray(redeemScript, "hex"))));
            } else {
                hashRedeemedScript = versionByte + hash160;
            }

            // We calculate the checksum, convert to Base58 and then we're done!
            const checksumHash = toHex(doubleSHA(fromArrayBuffer(Utils.convertToByteArray(hashRedeemedScript, "hex"))));
            const finalString = hashRedeemedScript + checksumHash.slice(0, 8);
            const address = base58Encode(Utils.convertToByteArray(finalString, "hex"));
            return address;
        }

    }

}

export default PublicKeyToP2PKHAddress;
