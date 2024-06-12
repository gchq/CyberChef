/**
 * @author mykulh [mykulh@yahoo.co.uk]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import moment from "moment-timezone";

/**
 * To Chrome Browser Timestamp operation
 */
class ToChromeBrowserTimestamp extends Operation {

    /**
     * ToChromeBrowserTimestamp constructor
     */
    constructor() {
        super();

        this.name = "To Chrome Browser Timestamp";
        this.module = "Default";
        this.description = "Converts datetime string to Chrome Browser Timestamp<br><br>e.g. <code>5 April 2009 16:45:49 UTC</code>\
         becomes <code>12883423549000000</code><br><br>Chrome Browser timestamp is a 17 digit value representing the number of microseconds since January 1, 1601 UTC.";
        this.infoURL = "https://support.google.com/chrome/community?hl=en";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Show parsed datetime",
                "type": "boolean",
                "value": true
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     * @throws {OperationError} if invalid unit
     */
    run(input, args) {
         const [showDateTime] = args, 
	     d = moment.utc(input);
         let result = ((d.unix()+11644473600) * 1000000);
         return showDateTime ? `${result} (${d.tz("UTC").format("ddd D MMMM YYYY HH:mm:ss")} UTC)` : result.toString();
    }
}

export default ToChromeBrowserTimestamp;
