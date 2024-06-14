/**
 * @author mykulh [mykulh@yahoo.co.uk]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import moment from "moment-timezone";

/**
 * From Mac Absolute Timestamp operation
 */
class FromMacAbsoluteTimestamp extends Operation {

    /**
     * FromMacAbsoluteTimestamp constructor
     */
    constructor() {
        super();
        this.name = "From Mac Absolute Timestamp";
        this.module = "Default";
        this.description = "Converts Apple Mac Absolute Timestamp to datetime string<br><br>e.g. <code>591621300</code> becomes <code>Tue 1 October 2019 11:15:00 UTC</code><br><br>Mac Absolute timestamp is a 32-bit value representing the number of seconds since January 1, 2001 UTC";
        this.infoURL = "https://developer.apple.com/documentation/corefoundation/cfabsolutetime";
        this.inputType = "number";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {number} input
     * @returns {string}
     * @throws {OperationError} if invalid unit
     */
    run(input, args) {
        try{
            const d = moment.unix(input + 978307200);
            return d.tz("UTC").format("ddd D MMMM YYYY HH:mm:ss") + " UTC";
        } catch {
            throw new OperationError("Unrecognised format");
        }
    }
}
export default FromMacAbsoluteTimestamp;
