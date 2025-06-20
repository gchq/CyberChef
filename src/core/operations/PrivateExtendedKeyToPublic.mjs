/**
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import ec from "elliptic";
import { deserializeExtendedKeyFunc, serializeExtendedKeyFunc, getExtendedKeyVersion,  privateVersionToPublicVersion, getExtendedKeyString
} from "../lib/Bitcoin.mjs";

/**
 * PrivateExtendedKeyToPublic operation
 */
class PrivateExtendedKeyToPublic extends Operation {

    /**
     * PrivateExtendedKeyToPublic constructor
     */
    constructor() {
        super();

        this.name = "Private Extended Key To Public";
        this.module = "Default";
        this.description = "Convert a private extended key to its associated public key. This may be useful post a BIP32Derivation operation if you need the extended public key for a different toolset.";
        this.infoURL = "https://en.bitcoin.it/wiki/BIP_0032"; // Usually a Wikipedia link. Remember to remove localisation (i.e. https://wikipedia.org/etc rather than https://en.wikipedia.org/etc)
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        // const [firstArg, secondArg] = args;
        // const [firstArg, secondArg] = args;
        if (input.trim().length === 0) {
            return "";
        }
        input = input.trim();

        const result = deserializeExtendedKeyFunc(input);
        const versionString = getExtendedKeyString(result.version);
        const privateVersions = ["xprv",  "yprv",  "zprv",  "Zprv",  "Yprv",  "Ltpv",  "Mtpv",  "ttpv", "tprv",  "uprv",  "vprv",  "Uprv", "Vprv"];
        if (privateVersions.indexOf(versionString) === -1) {
            throw new OperationError("Not an extended private key.");
        }
        const newVersion = privateVersionToPublicVersion(versionString);

        const processedInput = result.masterkey.slice(2,);
        const ecContext = ec.ec("secp256k1");
        const key = ecContext.keyFromPrivate(processedInput);
        const pubkey = key.getPublic(true, "hex");

        return serializeExtendedKeyFunc(getExtendedKeyVersion(newVersion), result.level, result.fingerprint, result.i, result.chaincode, pubkey);
    }

}

export default PrivateExtendedKeyToPublic;
