/**
 * Turns a seedphrase into the inital seed given PBKDF2.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023 Wei Lu <luwei.here@gmail.com> and Daniel Cousens <email@dcousens.com> 2014
 * @license ISC
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import forge from "node-forge";

/**
 * Seedphrase to Seed Class.
 */
class SeedphraseToSeed extends Operation {

    /**
     * SeedphraseToSeed Constructor.
     */
    constructor() {
        super();

        this.name = "Seedphrase To Seed";
        this.module = "Serialize";
        this.description = "Turns a seedphrase (with possible seed passphrase) into a seed. Note, does not type or validate the input, it is assumed to be a valid seedphrase. The Extract Seedphrases Op can extract valid seedphrases from text. Supports BIP39 and Electrum2 standards.";
        this.infoURL = "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki#from-mnemonic-to-seed";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Seedphrase Type",
                "type": "option",
                "value": ["bip39", "electrum2"]
            },
            {
                "name": "Seed Passphrase",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["UTF8"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const convertedSeedPhrase = Utils.convertToByteString(input.trim(), "UTF8");
        const iterations = 2048;
        const keySize = 512;
        const hasher = "SHA512";
        let salt;
        if (args[0] === "bip39") {
            salt = Utils.convertToByteString("mnemonic" + args[1].string, args[1].option) ||
            forge.random.getBytesSync(keySize);
        } else {
            salt = Utils.convertToByteString("electrum" + args[1].string, args[1].option) ||
            forge.random.getBytesSync(keySize);
        }
        const derivedKey = forge.pkcs5.pbkdf2(convertedSeedPhrase, salt, iterations, keySize / 8, hasher.toLowerCase());
        return forge.util.bytesToHex(derivedKey);
    }
}

export default SeedphraseToSeed;
