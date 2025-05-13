/**
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {base58Decode, base58Encode, doubleSHA, b58DoubleSHAChecksum} from "../lib/Bitcoin.mjs";
import Utils from "../Utils.mjs";
import {toHex} from "crypto-api/src/encoder/hex.mjs";
import { fromArrayBuffer } from "crypto-api/src/encoder/array-buffer.mjs";
import JSSHA3 from "js-sha3";

/**
 * Turns an address to a checksummed address.
 * @param {*} address ETH style address.
 */
function ethCheckSum(address) {
    const lowerCaseAddress = address.toLowerCase();
    const trimmedAddress = lowerCaseAddress.slice(2,);
    const algo = JSSHA3.keccak256;
    const hashResult = algo(Utils.convertToByteArray(trimmedAddress, "utf8"));
    let finalResult = "";
    for (let i = 0; i < trimmedAddress.length; i++) {
        if (trimmedAddress.charAt(i).toLowerCase() >= "a" && trimmedAddress.charAt(i).toLowerCase() <= "f") {
            if (hashResult.charAt(i)>= "8") {
                finalResult += trimmedAddress.charAt(i).toUpperCase();
            } else {
                finalResult += trimmedAddress.charAt(i);
            }
        } else {
            finalResult += trimmedAddress.charAt(i);
        }
    }
    return "0x" + finalResult;
}

/**
 * Checks if past in address could be a valid ETH address based off of regex.
 * @param {*} input
 * @returns
 */
function validateETHAddress(input) {
    const regex = /^0x[a-f,A-F,0-9]{40}$/g;
    return regex.test(input);
}

/**
 * Runs the checksum on the potential TRX address. Returns false is checksum fails.
 * @param {*} input
 * @returns
 */
function validateTRXAddress(input) {
    return b58DoubleSHAChecksum(input);
}
/**
 * ETH / TRX Conversion operation
 */
class ETHTRXConversion extends Operation {

    /**
     * ETHTRXConversion constructor
     */
    constructor() {
        super();

        this.name = "ETH / TRX Conversion";
        this.module = "Default";
        this.description = "Converts between ETH and TRX addresses.";
        this.infoURL = "https://tronscan.org/#/tools/code-converter/tron-ethereum-address"; // Usually a Wikipedia link. Remember to remove localisation (i.e. https://wikipedia.org/etc rather than https://en.wikipedia.org/etc)
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Direction",
                type: "option",
                value: ["ETH->TRX", "TRX->ETH"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [direction] = args;
        // We check if input is blank.
        // If its blank or just whitespace, we don't need to bother dealing with it.
        if (input.trim().length === 0) {
            return "";
        }
        switch (direction) {
            case "ETH->TRX":{
                if (!validateETHAddress(input)) {
                    return "Invalid ETH address. ETH addresses should have 20 bytes (40 characters) prefaced by 0x.";
                }
                const unencodedAddress =  input.slice(2,);
                const checksumHash = toHex(doubleSHA(fromArrayBuffer(Utils.convertToByteArray("41" + unencodedAddress, "hex"))));
                const finalString = "41" + unencodedAddress + checksumHash.slice(0, 8);
                const address = base58Encode(Utils.convertToByteArray(finalString, "hex"));
                return address;
            }
            case "TRX->ETH":{
                if (!validateTRXAddress(input)) {
                    return "Invalid TRX Address. Checksum failed.";
                }
                return ethCheckSum("0x" + toHex(fromArrayBuffer(base58Decode(input).slice(1, -4))));
            }

        }
    }

}

export default ETHTRXConversion;
