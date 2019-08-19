/**
 * @author h345983745 []
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Stream from "../lib/Stream.mjs";
import {toHex} from "../lib/Hex.mjs";
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
        this.inputType = "byteArray";
        this.outputType = "json";
        this.presentType = "html";
        this.args = [];
    }

    /**
     * @param {Uint8Array} input
     * @returns {Object}
     */
    run(input, args) {

        if (input.length < "8"){
            throw new OperationError("Need 8 bytes for a UDP Header");
        }

        const s = new Stream(input);
        //Parse Header
        const UDPPacket = {
            "Source port": s.readInt(2),
            "Destination port": s.readInt(2),
            "Length": s.readInt(2),
            "Checksum": toHex(s.getBytes(2), "0x")
        };
        //Parse data if present
        if (s.hasMore()){
            UDPPacket.Data = toHex(s.getBytes(UDPPacket.Length - 8), "0x");
        }

        return UDPPacket;

    }

    /**
     * Displays the UDP Packet in a table style
     * @param {Object} data
     * @returns {html}
     */
    present(data) {
        const html = [];
        html.push("<table class='table table-hover table-sm table-bordered' style='table-layout: fixed'>");
        html.push("<tr>");
        html.push("<th>Field</th>");
        html.push("<th>Value</th>");
        html.push("</tr>");

        for (const key in data) {
            switch (key){
                default: {
                    html.push("<tr>");
                    html.push("<td style=\"word-wrap:break-word\">" + key + "</td>");
                    html.push("<td>" + data[key] + "</td>");
                    html.push("</tr>");
                }
            }
        }
        html.push("</table>");
        return html.join("");
    }

}


export default ParseUDP;
