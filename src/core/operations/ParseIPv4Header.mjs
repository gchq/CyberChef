/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import {fromHex, toHex} from "../lib/Hex";
import {_ipv4ToStr, _protocolLookup, calculateTCPIPChecksum} from "../lib/Ip";

/**
 * Parse IPv4 header operation
 */
class ParseIPv4Header extends Operation {

    /**
     * ParseIPv4Header constructor
     */
    constructor() {
        super();

        this.name = "Parse IPv4 header";
        this.module = "JSBN";
        this.description = "Given an IPv4 header, this operations parses and displays each field in an easily readable format.";
        this.inputType = "string";
        this.outputType = "html";
        this.args = [
            {
                "name": "Input format",
                "type": "option",
                "value": ["Hex", "Raw"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {
        const format = args[0];
        let output;

        if (format === "Hex") {
            input = fromHex(input);
        } else if (format === "Raw") {
            input = Utils.strToByteArray(input);
        } else {
            return "Unrecognised input format.";
        }

        let ihl = input[0] & 0x0f;
        const dscp = (input[1] >>> 2) & 0x3f,
            ecn = input[1] & 0x03,
            length = input[2] << 8 | input[3],
            identification = input[4] << 8 | input[5],
            flags = (input[6] >>> 5) & 0x07,
            fragOffset = (input[6] & 0x1f) << 8 | input[7],
            ttl = input[8],
            protocol = input[9],
            checksum = input[10] << 8 | input[11],
            srcIP = input[12] << 24 | input[13] << 16 | input[14] << 8 | input[15],
            dstIP = input[16] << 24 | input[17] << 16 | input[18] << 8 | input[19],
            checksumHeader = input.slice(0, 10).concat([0, 0]).concat(input.slice(12, 20));
        let version = (input[0] >>> 4) & 0x0f,
            options = [];


        // Version
        if (version !== 4) {
            version = version + " (Error: for IPv4 headers, this should always be set to 4)";
        }

        // IHL
        if (ihl < 5) {
            ihl = ihl + " (Error: this should always be at least 5)";
        } else if (ihl > 5) {
            // sort out options...
            const optionsLen = ihl * 4 - 20;
            options = input.slice(20, optionsLen + 20);
        }

        // Protocol
        const protocolInfo = _protocolLookup[protocol] || {keyword: "", protocol: ""};

        // Checksum
        const correctChecksum = calculateTCPIPChecksum(checksumHeader),
            givenChecksum = Utils.hex(checksum);
        let checksumResult;
        if (correctChecksum === givenChecksum) {
            checksumResult = givenChecksum + " (correct)";
        } else {
            checksumResult = givenChecksum + " (incorrect, should be " + correctChecksum + ")";
        }

        output = "<table class='table table-hover table-condensed table-bordered table-nonfluid'><tr><th>Field</th><th>Value</th></tr>" +
            "<tr><td>Version</td><td>" + version + "</td></tr>" +
            "<tr><td>Internet Header Length (IHL)</td><td>" + ihl + " (" + (ihl * 4) + " bytes)</td></tr>" +
            "<tr><td>Differentiated Services Code Point (DSCP)</td><td>" + dscp + "</td></tr>" +
            "<tr><td>Explicit Congestion Notification (ECN)</td><td>" + ecn + "</td></tr>" +
            "<tr><td>Total length</td><td>" + length + " bytes" +
            "\n  IP header: " + (ihl * 4) + " bytes" +
            "\n  Data: " + (length - ihl * 4) + " bytes</td></tr>" +
            "<tr><td>Identification</td><td>0x" + Utils.hex(identification) + " (" + identification + ")</td></tr>" +
            "<tr><td>Flags</td><td>0x" + Utils.hex(flags, 2) +
            "\n  Reserved bit:" + (flags >> 2) + " (must be 0)" +
            "\n  Don't fragment:" + (flags >> 1 & 1) +
            "\n  More fragments:" + (flags & 1) + "</td></tr>" +
            "<tr><td>Fragment offset</td><td>" + fragOffset + "</td></tr>" +
            "<tr><td>Time-To-Live</td><td>" + ttl + "</td></tr>" +
            "<tr><td>Protocol</td><td>" + protocol + ", " + protocolInfo.protocol + " (" + protocolInfo.keyword + ")</td></tr>" +
            "<tr><td>Header checksum</td><td>" + checksumResult + "</td></tr>" +
            "<tr><td>Source IP address</td><td>" + _ipv4ToStr(srcIP) + "</td></tr>" +
            "<tr><td>Destination IP address</td><td>" + _ipv4ToStr(dstIP) + "</td></tr>";

        if (ihl > 5) {
            output += "<tr><td>Options</td><td>" + toHex(options) + "</td></tr>";
        }

        return output + "</table>";
    }

}

export default ParseIPv4Header;
