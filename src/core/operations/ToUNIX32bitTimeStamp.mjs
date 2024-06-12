/**
 * @author mykulh [mykulh@yahoo.co.uk]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import moment from "moment-timezone";

/**
 * To UNIX 32bit filesystem Timestamp operation
 */
class ToUNIX32bitTimestamp extends Operation {

    /**
     * ToUNIX32bitTimestamp constructor
     */
    constructor() {
        super();

        this.name = "To UNIX 32-bit Timestamp";
        this.module = "Default";
        this.description = "Converts datetime string to UNIX 32-bit Hex Timestamp<br><br>e.g. <code>21 June 2013 03:05:53 UTC</code> becomes <code>51C3C311</code><br><br>UNIX 32-bit timestamp is a 4 Byte Hex value representing the number of seconds since January 1, 1970 UTC<br><br> Use with swap endianness recipe if required.";
        this.infoURL = "https://wikipedia.org/wiki/Unix_time";
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
        let  result = d.unix();
        const hexString = result.toString(16);
        return showDateTime ? `${hexString.toUpperCase()} (${d.tz("UTC").format("ddd D MMMM YYYY HH:mm:ss")} UTC)` : hexString.toUpperCase();
    }
}

export default ToUNIX32bitTimestamp;
