/**
 * Extracts segwit encoded seedphrases. These can be Bech32 encoded or P2TR style addresses.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023, geco 2019
 * @license MIT
 */

import Operation from "../Operation.mjs";
import { searchAndFilter } from "../lib/Extract.mjs";
import { segwitChecksum} from "../lib/Bech32.mjs";

/**
 * Extract Cryptocurrency addresses that are Segwit Formatted
 */
class ExtractSegwitAddresses extends Operation {

    /**
     * Extract Segwit Constructor.
     */
    constructor() {
        super();

        this.name = "Extract Segwit Addresses";
        this.module = "Regex";
        this.description = "Extracts Segwit formatted cryptocurrency addresses. Compliant with BIP173, and BIP350, given normal addresses. Not compatible as of now with Lightning Network invoices.";
        this.infoURL = "https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki";
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
            regex = /(bc|ltc|tb)1[023456789ac-hj-np-z]{38,60}/g;

        return searchAndFilter(input, regex, null, segwitChecksum, displayTotal);
    }

}

export default ExtractSegwitAddresses;

