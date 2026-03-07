/**
 * Extracts most Double SHA256 encoded strings from text. These are strings which are valid Base58 encoded, with the last 4 bytes being the double sha256 of the previous bytes.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */
import Operation from "../Operation.mjs";
import { searchAndFilter } from "../lib/Extract.mjs";
import { b58DoubleSHAChecksum } from "../lib/Bitcoin.mjs";

/**
 * Extract Cryptocurrency addresses that are Base58 Encoded, with Double SHA256 Checksum.
 */
class ExtractDoubleShaArtifacts extends Operation {

    /**
     * ExtractDoubleShaArtifacts Constructor.
     */
    constructor() {
        super();

        this.name = "Extract Double SHA Artifacts";
        this.module = "Regex";
        this.description = "Extracts many cryptocurrency artifact strings that are Base58 encoded where here we define that as: 28-150 characters that are Base-58 encoded with a Double SHA256 checksum. For example, this will extract Bitcoin/Litecoin/Dogecoin addreses, WIF keys, extended keys amongst other artifacts from ASCII text.";
        this.infoURL = "https://en.bitcoin.it/wiki/Base58Check_encoding";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Display total",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const displayTotal = args[0],
            regex = /[A-HJ-NP-Za-km-z1-9]{28,150}/g;

        return searchAndFilter(input, regex, null, b58DoubleSHAChecksum, displayTotal);
    }

}

export default ExtractDoubleShaArtifacts;

