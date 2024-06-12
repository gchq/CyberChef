/**
 * @author mykulh [mykulh@yahoo.co.uk]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import moment from "moment-timezone";

/**
 * From Chrome Browser Timestamp operation
 */
class FromChromeBrowserTimestamp extends Operation {

    /**
     * FromChromeBrowserTimestamp constructor
     */
    constructor() {
        super();
        this.name = "From Chrome Browser Timestamp";
        this.module = "Default";
        this.description = "Converts Chrome Browser Timestamp to datetime string<br><br>e.g. <code>12883423549000000</code> \
        becomes <code>5 April 209 16:45:49 UTC</code><br><br>Chrome Browser timestamp is a 17 digit value representing the number of microseconds since \
        January 1, 1601 UTC.";
        this.infoURL = "https://support.google.com/chrome/community?hl=en";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @returns {string}
     * @throws {OperationError} if invalid unit
     */
    run(input, args) {
        const d = moment.unix((input /1000000) - 11644473600);
        return d.tz("UTC").format("ddd D MMMM YYYY HH:mm:ss") + " UTC";
    }
}

export default FromChromeBrowserTimestamp;
