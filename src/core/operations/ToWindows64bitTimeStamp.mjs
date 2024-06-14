/**
 * @author mykulh [mykulh@yahoo.co.uk]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import moment from "moment-timezone";

/**
 * To Windows 64bit filesystem Timestamp operation
 */
class ToWindows64bitTimestamp extends Operation {

    /**
     * ToWindows64bitFilesystemTimestamp constructor
     */
    constructor() {
        super();
        this.name = "To Windows 64-bit Filetime Timestamp";
        this.module = "Default";
        this.description = "Converts datetime string to Windows 64-bit Hex Filetime Timestamp<br><br>e.g. <code>14 November 2013 19:21:19 UTC</code> becomes <code></code><br>01CEE16F415343EE<br>windows 64-bit filetime timestamp is a 8 Byte Hex value representing the number of 100s of nanoseconds since January 1, 1601 UTC<br><br> Use with swap endianness recipe if required.";
        this.infoURL = "https://en.wikipedia.org/wiki/System_time";
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
            let result = d.unix();
            const step1 = result + 11644473600;
            const hexString = (step1 * 10000000).toString(16);
            eturn showDateTime ?  `${hexString.toUpperCase()} (${d.tz("UTC").format("ddd D MMMM YYYY HH:mm:ss")} UTC)` : hexString.toUpperCase();
        } catch {
            throw new OperationError("Unrecognised format"); 
        }
    }
}
export default ToWindows64bitTimestamp;