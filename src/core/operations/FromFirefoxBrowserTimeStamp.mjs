/**
 * @author mykulh [mykulh@yahoo.co.uk]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import moment from "moment-timezone";

/**
 * From Firefox Browser Timestamp operation
 */
class FromFirefoxBrowserTimestamp extends Operation {

    /**
     * FromFirefoxBrowserTimestamp constructor
     */
    constructor() {
        super();
        this.name = "From Firefox Browser Timestamp";
        this.module = "Default";
        this.description = "Converts Firefox Browser Timestamp to datetime string<br><br>e.g. <code>1341575244735000</code> \
        becomes <code>6 July 2012 11:47:24 UTC</code><br><br>Firefox Browser timestamp is a 16 digit value representing the number of microseconds since \
        January 1, 1970 UTC. Note: fractions of seconds are not retained.";
        this.infoURL = "https://support.mozilla.org/en-US/";
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
        const d = moment.unix((input /1000000));
        return d.tz("UTC").format("ddd D MMMM YYYY HH:mm:ss") + " UTC";
    }
}

export default FromFirefoxBrowserTimestamp;
