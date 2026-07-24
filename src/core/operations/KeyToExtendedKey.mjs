/**
 * @author dcgoldenberg [dgoldenberg@mitre.org]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { makeSureIsHex,  serializeExtendedKeyFunc, getExtendedKeyVersion, getVersions } from "../lib/Bitcoin.mjs";


/**
 * Key To Extended Key operation
 */
class KeyToExtendedKey extends Operation {

    /**
     * KeyToExtendedKey constructor
     */
    constructor() {
        super();

        this.name = "Key To Extended Key";
        this.module = "Default";
        this.description = "Turns a key, with chaincode and version as parameters, into an extended key. We assume the key is meant to be a master key, so depth and child number are set to 0, and fingerprint is set to 00000000.";
        this.infoURL = "https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki"; // Usually a Wikipedia link. Remember to remove localisation (i.e. https://wikipedia.org/etc rather than https://en.wikipedia.org/etc)
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Chaincode",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex"]
            },
            {
                "name": "Fingerprint",
                "type": "toggleString",
                "value": "00000000",
                "toggleValues": ["Hex"]
            },
            {
                "name": "Level",
                "type": "toggleString",
                "value": 0,
                "toggleValues": ["Hex", "Number"]
            },
            {
                "name": "Version Type",
                "type": "option",
                "value": getVersions()
            },
            {
                "name": "i",
                "type": "toggleString",
                "value": 0,
                "toggleValues": ["Hex", "Number"]
            }

        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        // const [firstArg, secondArg] = args;
        if (input.trim().length === 0) {
            return "";
        }
        input = input.trim();

        const inputAsHex = makeSureIsHex(input);
        const isPublic = inputAsHex.length === 66 && (inputAsHex.startsWith("03") || inputAsHex.startsWith("02"));
        const isPrivate = inputAsHex.length === 64;
        const privateVersions = ["xprv",  "yprv",  "zprv",  "Zprv",  "Yprv",  "Ltpv",  "Mtpv",  "ttpv", "tprv",  "uprv",  "vprv",  "Uprv", "Vprv"];
        if (!isPublic && !isPrivate) {
            throw new OperationError("Error: String " + inputAsHex + " is not a valid public or private key.");
        }
        if (isPublic && privateVersions.indexOf(args[3]) !== -1) {
            throw new OperationError("Error: Mis-Match between version and key type. Public Key is entered, but a private version is selected.");
        }
        if (isPrivate && privateVersions.indexOf(args[3]) === -1) {
            throw new OperationError("Error: Mis-Match between version and key type. Private Key is entered, but a public version is selected.");
        }
        const key =  isPrivate ? "00" + inputAsHex : inputAsHex;
        const radix = (args[2].option === "Hex") ? 16 : 10;
        const level = parseInt(args[2].string, radix);
        const iRadix = (args[4].option === "Hex") ? 16: 10;
        const i = parseInt(args[4].string, iRadix);
        const fingerprint = args[1];
        const newVersion = getExtendedKeyVersion(args[3]);

        const newExtendedKey = serializeExtendedKeyFunc(newVersion, level, fingerprint.string, i, args[0].string, key);
        return newExtendedKey;

    }

}

export default KeyToExtendedKey;
