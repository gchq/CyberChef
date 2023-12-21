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
import { base58Encode, getP2PKHVersionByte, getP2SHVersionByte, hash160Func, doubleSHA,  getHumanReadablePart} from "../lib/Bitcoin.mjs";
import {encodeProgramToSegwit} from "../lib/Bech32.mjs";
import JSSHA3 from "js-sha3";
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
        this.description = "Turns a public key into a cryptocurrency address.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Currency Type",
                "type": "option",
                "value": ["BTC", "Testnet", "Ethereum"]
            },
            {
                "name": "Address Type",
                "type": "option",
                "value": ["P2PKH (V1 BTC Addresses)", "P2SH-P2PWPKH (Segwit Compatible)", "Segwit (P2WPKH)"]
            }
        ];
        this.checks = [
            {
                pattern: "^0[3|2][a-fA-F0-9]{64}$",
                flags: "",
                args: ["BTC", "P2PKH (V1 BTC Addresses)"]
            },
            {
                pattern: "^04[a-fA-F0-9]{128}$",
                flags: "",
                args: ["Ethereum", "P2PKH (V1 BTC Addresses)"]
            }

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
        // We check to see if the input is hex or not.
        // If it is, we convert back to bytes.
        const re = /([0-9A-Fa-f]{2,})/g;
        let inputIsHex = false;
        let curInput = input;
        if (re.test(input)) {
            inputIsHex = true;
        }
        if (inputIsHex) {
            curInput = fromArrayBuffer(Utils.convertToByteArray(input, "hex"));
        }

        // We sanity check the input
        const startByte = toHex(curInput[0]);
        if (curInput.length !== 33 && curInput.length !== 65) {
            return "Input is wrong length. Should be either 33 or 65 bytes, but is: " + curInput.length;
        }
        if (curInput.length === 33 && startByte !== "03" && startByte !== "02") {
            return "Input is 33 bytes, but begins with invalid byte: " + startByte;
        }

        if (curInput.length === 65 && startByte !== "04") {
            return "Input is 65 bytes, but begins with invalid byte: " + startByte;
        }

        if (args[0] === "Ethereum") {
            // Ethereum addresses require uncompressed public keys.
            if (startByte !== "04" || curInput.length !== 65) {
                return "Ethereum addresses require uncompressed public keys.";
            }
            const algo = JSSHA3.keccak256;
            // We need to redo the hex-> bytes transformation here because Javascript is silly.
            // sometimes what is desired is an array of ints.
            // Other times a string
            // Here, the Keccak algorithm seems to want an array of ints. (sigh)
            let result;
            if (inputIsHex) {
                result = algo(Utils.convertToByteArray(input, "hex").slice(1,));
            } else {
                result = algo(Utils.convertToByteArray(toHex(input), "hex").slice(1,));
            }
            return "0x" + result.slice(-40);

        } else {
            // We hash the input
            const hash160 = toHex(hash160Func(curInput));
            // We do segwit addresses first.
            if (args[1] === "Segwit (P2WPKH)") {
                const redeemScript = hash160;
                const hrp = getHumanReadablePart(args[0]);
                return encodeProgramToSegwit(hrp, 0, Utils.convertToByteArray(redeemScript, "hex"));
            }
            // It its not segwit, we create the redeemScript either for P2PKH or P2SH-P2WPKH addresses.
            const versionByte = "P2PKH (V1 BTC Addresses)" === args[1] ? getP2PKHVersionByte(args[0]) : getP2SHVersionByte(args[0]);
            // If its a P2SH-P2WPKH address, we have to prepend some extra bytes and hash again. Either way we prepend the version byte.
            let hashRedeemedScript;
            if (args[1] === "P2SH-P2PWPKH (Segwit Compatible)") {
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
