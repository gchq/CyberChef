/**
 * Extracts seedphrases. Right now, extracts BIP39 and Electrum2 seedphrases.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023 Wei Lu <luwei.here@gmail.com> and Daniel Cousens <email@dcousens.com> 2014
 * @license ISC
 */
import Operation from "../Operation.mjs";
import { search} from "../lib/Extract.mjs";
import {bip39, electrum2} from "../lib/Seedphrase.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Extract Cryptocurrency addresses that are Base58 Encoded, with Double SHA256 Checksum.
 */
class ExtractSeedPhrases extends Operation {

    /**
     * Extract Seedphrases Constructor.
     */
    constructor() {
        super();

        this.name = "Extract Seedphrases";
        this.module = "Regex";
        this.description = "Attempts to extract seedphrases from text. Right now, only BIP39 and Electrum2 standards and the English language supported.";
        this.infoURL = "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [{
            "name": "Seedphrase Type",
            "type": "option",
            "value": ["bip39", "electrum2"]
        }];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {

        const regex = /[a-z]{3,20}/g;

        const type = args[0];
        let seedphraseInfo = {};
        if (type === "bip39") {
            seedphraseInfo = bip39;
        } else if (type === "electrum2") {
            seedphraseInfo = electrum2;
        } else {
            throw new OperationError("Unknown seedphrase type value: " + type);
        }

        let output = "";
        const wordArray = search(input, regex, null, false);

        // Start scanning through the list
        for (let i = 0; i < wordArray.length; i++) {
            // If we find a starting element in the wordlist, we expand.
            if (seedphraseInfo.english.includes(wordArray[i])) {
                for (let j = 0; j < seedphraseInfo.acceptable_lengths.length; j++) {
                    // For each possible length, we scan through the list.
                    const curPhraseLength = seedphraseInfo.acceptable_lengths[j];
                    let correctPhrase = true;
                    for (let w =0; w < curPhraseLength; w++) {
                        if (!seedphraseInfo.english.includes(wordArray[i + w])) {
                            correctPhrase = false;
                        }
                    }
                    // If all words in that slice belong in the word list, and the checksum holds we assume the phrase is a valid one.
                    if (correctPhrase) {
                        if (seedphraseInfo.checksum(wordArray.slice(i, i + curPhraseLength).join(" "), seedphraseInfo.english)) {
                            output += wordArray.slice(i, i + curPhraseLength).join(" ") + "\n";
                        }
                    }
                }

            }
        }
        return output;
    }

}

export default ExtractSeedPhrases;
