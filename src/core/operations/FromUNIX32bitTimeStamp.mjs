/**
 * @author mykulh [mykulh@yahoo.co.uk]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import moment from "moment-timezone";

/**
 * From UNIX 32bit filesystem Timestamp operation
 */
class FromUNIX32bitTimestamp extends Operation {

    /**
     * FromUNIX32bitTimestamp constructor
     */
    constructor() {
        super();
        this.name = "From UNIX 32-bit Timestamp";
        this.module = "Default";
        this.description = "Converts UNIX 32-bit Hex Timestamp to datetime string<br><br>e.g. <code>51C3C311</code> becomes <code>21 June 2013 03:05:53 UTC</code><br><br>UNIX 32-bit timestamp is a 4 Byte Hex value representing the number of seconds since January 1, 1970 UTC<br><br> Use with swap endianness recipe if required.";
        this.infoURL = "https://wikipedia.org/wiki/Unix_time";
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
        try {
            const h = parseInt(input, 16);
            const d = moment.unix(h);
            return d.tz("UTC").format("ddd D MMMM YYYY HH:mm:ss") + " UTC"; 
        } catch {
            throw new OperationError("Unrecognised format");          
        }       
    }
}
export default FromUNIX32bitTimestamp;