/**
 * Deserializes the passed in Extended Key to its component parts.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */
import Operation from "../Operation.mjs";
import { deserializeExtendedKeyFunc } from "../lib/Bitcoin.mjs";


/**
 * Deserializes an extended key (XPUB/XPRV). Returns available information.
 */
class DeserializeExtendedKey extends Operation {

    /**
     * Extract Seedphrases Constructor.
     */
    constructor() {
        super();

        this.name = "Deserialize Extended Key";
        this.module = "Serialize";
        this.description = "Deserializes a passed in extended key. Can return all the deserialized information, or just the master key part (useful for chaining this call to others in a recipe).";
        this.inputType = "string";
        this.outputType = "JSON";
        this.presentType = "string";
        this.infoURL = "https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#Serialization_format";
        this.args = [
            {
                name: "Key Only",
                type: "boolean",
                value: true
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
        const [keyOnly] = args;
        const result = deserializeExtendedKeyFunc(input);
        if (!keyOnly) {
            return result;
        } else {
            return {"masterkey": result.masterkey};
        }
    }

    /**
     * Displays the result of deserializing the extended key.
     *
     * @param {Object} output
     * @returns {final_output}
     */
    present(output) {
        if ("error" in output) {
            return output.error;
        } else {
            if (Object.prototype.hasOwnProperty.call(output, "masterkey") && Object.prototype.hasOwnProperty.call(output, "checksum")) {
                let finalOutput = "Key Analyzed: " + output.key + "\n";
                finalOutput += "\tChecksum: " + output.checksum + "\n";
                finalOutput += "\tVersion: " + output.version + "\n";
                finalOutput += "\tLevel: " + output.level + "\n";
                finalOutput += "\tFingerprint: " + output.fingerprint + "\n";
                finalOutput += "\tChaincode: " + output.chaincode + "\n";
                finalOutput += "\tMasterKey: " + output.masterkey + "\n";
                finalOutput += "\n";
                return finalOutput;
            } else {
                return output.masterkey;
            }
        }
    }

}

export default DeserializeExtendedKey;
