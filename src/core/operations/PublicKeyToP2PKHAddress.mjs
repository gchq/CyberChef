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
import { base58Encode, getP2PKHVersionByte, getP2SHVersionByte, hash160Func, doubleSHA,  getHumanReadablePart, makeSureIsBytes, validatePublicKey} from "../lib/Bitcoin.mjs";
import {encodeProgramToSegwit} from "../lib/Bech32.mjs";
import Utils from "../Utils.mjs";


 /**
 * Converts a Public Key to a P2PKH Address of the given type.
 */
class PublicKeyToP2PKHAddress extends Operation {

    /**
     * Converts a public key to a P2PKH Address.
     */
    constructor() {
        super();

        this.name = "Public Key To Cryptocurrency Address";
        this.module = "Default";
        this.description = "Turns a public key into a cryptocurrency address. Can select P2PKH, P2SH-P2WPKH and P2WPKH addresses for Bitcoin and Testnet.";
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
                "value": ["P2PKH (V1 BTC Addresses)", "P2SH-P2PWPKH (Segwit Compatible V3 Addresses)", "Segwit (P2WPKH bc1 Addresses)"]
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

export default PublicKeyToP2PKHAddress;
