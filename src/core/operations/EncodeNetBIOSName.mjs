/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import Operation from "../Operation";

/**
 * Encode NetBIOS Name operation
 */
class EncodeNetBIOSName extends Operation {

    /**
     * EncodeNetBIOSName constructor
     */
    constructor() {
        super();

        this.name = "Encode NetBIOS Name";
        this.module = "Default";
        this.description = "NetBIOS names as seen across the client interface to NetBIOS are exactly 16 bytes long. Within the NetBIOS-over-TCP protocols, a longer representation is used.<br><br>There are two levels of encoding. The first level maps a NetBIOS name into a domain system name.  The second level maps the domain system name into the 'compressed' representation required for interaction with the domain name system.<br><br>This operation carries out the first level of encoding. See RFC 1001 for full details.";
        this.infoURL = "https://wikipedia.org/wiki/NetBIOS";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.args = [
            {
                "name": "Offset",
                "type": "number",
                "value": 65
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const output = [],
            offset = args[0];

        if (input.length <= 16) {
            const len = input.length;
            input.length = 16;
            input.fill(32, len, 16);
            for (let i = 0; i < input.length; i++) {
                output.push((input[i] >> 4) + offset);
                output.push((input[i] & 0xf) + offset);
            }
        }

        return output;

    }

}

export default EncodeNetBIOSName;
