/**
 * @author mykulh [mykulh@yahoo.co.uk]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import moment from "moment-timezone";

/**
 * From HFSPlus filesystem Timestamp operation
 */
class FromHFSPlusTimestamp extends Operation {

    /**
     * FromHFSPlusTimestamp constructor
     */
    constructor() {
        super();

        this.name = "From HFS(+) Timestamp";
        this.module = "Default";
        this.description = "Converts Apple HFS/HFS+ Filesystem Timestamp to datetime string<br><br>e.g. <code>CDF566EE</code> becomes <code>30 June 2013 04:39:10 UTC</code><br><br>Mac HFS/HFS+ timestamp is a 4 Byte Hex String representing the number of seconds since January 1, 1904 UTC<br><br> Use with swap endianness recipe if required.";
        this.infoURL = "https://en.wikipedia.org/wiki/HFS_Plus";
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
        const d = moment.unix(h - 2082844800);
        return d.tz("UTC").format("ddd D MMMM YYYY HH:mm:ss") + " UTC";
    }
}

export default FromHFSPlusTimestamp;
