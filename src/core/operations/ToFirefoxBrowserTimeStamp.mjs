/**
 * @author mykulh [mykulh@yahoo.co.uk]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import moment from "moment-timezone";

/**
 * To Firefox Browser Timestamp operation
 */
class ToFirefoxBrowserTimestamp extends Operation {

    /**
     * ToFirefoxBrowserTimestamp constructor
     */
    constructor() {
        super();
        this.name = "To Firefox Browser Timestamp";
        this.module = "Default";
        this.description = "Converts datetime string to Firefox Browser Timestamp<br><br>e.g. <code>6 July 2012 11:47:24 UTC</code>\
         becomes <code>1341575244735000</code><br><br>Firefox Browser timestamp is a 16 digit value representing the number of microseconds since \
         January 1, 1970 UTC. Note: fractions of seconds are not retained.";
        this.infoURL = "https://support.mozilla.org/en-US/";
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
        try{
            const [showDateTime] = args,d = moment.utc(input);
            let result = (d.unix() * 1000000);
            return showDateTime ? `${result} (${d.tz("UTC").format("ddd D MMMM YYYY HH:mm:ss")} UTC)` : result.toString();
        } catch {
            throw new OperationError("Unrecognised format"); 
        }
    }
}
export default ToFirefoxBrowserTimestamp;