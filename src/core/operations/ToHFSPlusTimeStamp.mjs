/**
 * @author mykulh [mykulh@yahoo.co.uk]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import moment from "moment-timezone";

/**
 * To HFSPlus filesystem Timestamp operation
 */
class ToHFSPlusTimestamp extends Operation {

    /**
     * ToHFSPlusTimestamp constructor
     */
    constructor() {
        super();

        this.name = "To HFS(+) Timestamp";
        this.module = "Default";
        this.description = "Converts datetime string to Apple HFS/HFS+ Filesystem Timestamp<br><br>e.g. <code>30 June 2013 04:39:10 UTC</code> becomes <code>CDF566EE</code><br><br>Mac HFS/HFS+ timestamp is a 4 Byte Hex String representing the number of seconds since January 1, 1904 UTC<br><br> Use with swap endianness recipe if required.";
        this.infoURL = "https://en.wikipedia.org/wiki/HFS_Plus";
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
        let result = d.unix();
        const hexString = (result + 2082844800).toString(16);
        return showDateTime ? `${hexString.toUpperCase()} (${d.tz("UTC").format("ddd D MMMM YYYY HH:mm:ss")} UTC)`: hexString.toUpperCase();
    }
}

export default ToHFSPlusTimestamp;
