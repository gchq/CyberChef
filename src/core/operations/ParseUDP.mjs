/**
 * @author h345983745 []
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Stream from "../lib/Stream.mjs";
import {toHexFast, fromHex} from "../lib/Hex.mjs";
import {objToTable} from "../lib/Protocol.mjs";
import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Parse UDP operation
 */
class ParseUDP extends Operation {

    /**
     * ParseUDP constructor
     */
    constructor() {
        super();

        this.name = "Parse UDP";
        this.module = "Default";
        this.description = "Parses a UDP header and payload (if present).";
        this.infoURL = "https://wikipedia.org/wiki/User_Datagram_Protocol";
        this.inputType = "string";
        this.outputType = "json";
        this.presentType = "html";
        this.args = [
            {
                name: "Input format",
                type: "option",
                value: ["Hex", "Raw"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {Object}
     */
    run(input, args) {
        const format = args[0];

        if (format === "Hex") {
            input = fromHex(input);
        } else if (format === "Raw") {
            input = Utils.strToArrayBuffer(input);
        } else {
            throw new OperationError("Unrecognised input format.");
        }

        const s = new Stream(new Uint8Array(input));
        if (s.length < 8) {
            throw new OperationError("Need 8 bytes for a UDP Header");
        }

        // Parse Header
        const UDPPacket = {
            "Source port": s.readInt(2),
            "Destination port": s.readInt(2),
            "Length": s.readInt(2),
            "Checksum": "0x" + toHexFast(s.getBytes(2))
        };
        // Parse data if present
        if (s.hasMore()) {
            UDPPacket.Data = "0x" + toHexFast(s.getBytes(UDPPacket.Length - 8));
        }

        return UDPPacket;
    }

    /**
     * Displays the UDP Packet in a tabular style
     * @param {Object} data
     * @returns {html}
     */
    present(data) {
        return objToTable(data);
    }

}


export default ParseUDP;
