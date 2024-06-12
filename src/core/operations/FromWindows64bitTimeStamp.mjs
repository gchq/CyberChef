/**
 * @author mykulh [mykulh@yahoo.co.uk]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import moment from "moment-timezone";

/**
 * From Windows 64bit Filesystem Timestamp operation
 */
class FromWindows64bitTimestamp extends Operation {

    /**
     * FromWindows64bitFilesystemTimestamp constructor
     */
    constructor() {
        super();
        this.name = "From Windows 64-bit Filetime Timestamp";
        this.module = "Default";
        this.description = "Converts Windows 64-bit Hex Filetime Timestamp to datetime string<br><br>e.g. <code>01CEE16F415343EE</code> becomes <code>14 November 2013 19:21:19 UTC</code><br><br>windows 64-bit filetime timestamp is a 8 Byte Hex value representing the number of 100s of nanoseconds since January 1, 1601 UTC<br><br> Use with swap endianness recipe if required.";
        this.infoURL = "https://en.wikipedia.org/wiki/System_time";
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
        const h = parseInt(input, 16);
        const secs = h/10000000;
        const d = moment.unix(secs - 11644473600);
        return d.tz("UTC").format("ddd D MMMM YYYY HH:mm:ss") + " UTC";
    }
}
export default FromWindows64bitTimestamp;
