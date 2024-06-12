/**
 * @author mykulh [mykulh@yahoo.co.uk]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import moment from "moment-timezone";

/**
 * To Mac Absolute Timestamp operation
 */
class ToMacAbsoluteTimestamp extends Operation {

    /**
     * FromMacAbsoluteTimestamp constructor
     */
    constructor() {
        super();

        this.name = "To Mac Absolute Timestamp";
        this.module = "Default";
        this.description = "Converts datetime string to Apple Mac Absolute Timestamp<br><br>e.g. <code>Tue 1 October 2019 11:15:00 UTC</code> becomes <code>591621300</code><br><br>Mac Absolute timestamp is a 32-bit value representing the number of seconds since January 1, 2001 UTC";
        this.infoURL = "https://developer.apple.com/documentation/corefoundation/cfabsolutetime";
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
        let  result = (d.unix()-978307200);
        return  showDateTime ? `${result} (${d.tz("UTC").format("ddd D MMMM YYYY HH:mm:ss")} UTC)` : result.toString(); 
    }
}
export default ToMacAbsoluteTimestamp;
