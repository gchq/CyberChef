/**
 * Changes the extended key from one version to another.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { deserializeExtendedKeyFunc, serializeExtendedKeyFunc, getExtendedKeyVersion } from "../lib/Bitcoin.mjs";


/**
 * Changes the version of an extended key. This can help to see if two keys are equal.
 */
class ChangeExtendedKeyVersion extends Operation {

    /**
     * Extract Seedphrases Constructor.
     */
    constructor() {
        super();

        this.name = "Change Extended Key Version";
        this.module = "Serialize";
        this.description = "Changes the version of an Extended Key (xpub to ypub, ypub to xpub and so on) and returns the new extended key with the different version. All other data is kept the same. This can be useful in comparing extended keys written in different standards, or changing an extended key to a needed standard for importation into a wallet. Note that changing a public key to a private key (XPUB->XPRV) or vice versa will make the resulting key invalid as this operation does not change the key data itself as of now.";
        this.infoURL = "https://github.com/satoshilabs/slips/blob/master/slip-0132.md";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Version Type",
                "type": "option",
                "value": ["xpub", "xprv", "ypub", "yprv", "zpub", "zprv", "Zpub", "Zprv", "Ypub", "Yprv", "Ltub", "Ltpv", "Mtub", "Mtpv", "ttub", "ttpv", "tpub", "tprv", "upub", "uprv", "vpub", "vprv", "Upub", "Uprv", "Vpub", "Vprv"]
            }
        ];
        this.checks = [
            {
                "pattern": "^(X|x|Y|y|Z|z|L|l|T|t)[pub|prv|tbv|tub][A-HJ-NP-Za-km-z1-9]{2,}$",
                "flags": "",
                "args": []
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (input.trim().length === 0) {
            return "";
        }
        const result = deserializeExtendedKeyFunc(input);
        const newVersion = getExtendedKeyVersion(args[0]);
        return serializeExtendedKeyFunc(newVersion, result.level, result.fingerprint, result.i, result.chaincode, result.masterkey);
    }

}

export default ChangeExtendedKeyVersion;
