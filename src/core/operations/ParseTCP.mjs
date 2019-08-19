/**
 * @author  h345983745
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Stream from "../lib/Stream.mjs";
import {toHex} from "../lib/Hex.mjs";
import {toBase64} from "../lib/Base64.mjs";

/**
 * ParseTCP operation takes in a raw
 */
class ParseTCP extends Operation {

    /**
     * ParseTCP constructor
     */
    constructor() {
        super();

        this.name = "Parse TCP";
        this.module = "Default";
        this.description = "Parse TCP";
        this.infoURL = "https://en.wikipedia.org/wiki/Transmission_Control_Protocol";
        this.inputType = "byteArray";
        this.presentType = "html";
        this.outputType = "json";
        this.args = [];
    }

    /**
     * @param {Uint8Array} input
     * @param {Object[]} args
     * @returns {Object}
     */
    run(input, args) {
        const s = new Stream(input);

        const TCPPacket = {
            "Source port":  s.readInt(2),
            "Desination port":    s.readInt(2),
            "Sequence number":  s.readInt(4),
            "Acknowledgment number":  s.readInt(4),
            "Data offset": s.readBits(4),
            "Reserved": s.readBits(3),
            "Flags": {
                "NS": s.readBits(1),
                "CRW": s.readBits(1),
                "ECE": s.readBits(1),
                "URG": s.readBits(1),
                "ACK": s.readBits(1),
                "PSH": s.readBits(1),
                "RST": s.readBits(1),
                "SYN": s.readBits(1),
                "FIN": s.readBits(1),
            },
            "Window Size": s.readInt(2),
            "Checksum": s.readInt(2),
            "Urgent pointer": s.readInt(2),
        };

//TODO: Remove logging
        for (const key in TCPPacket) {
            console.log(key);
            console.log(TCPPacket[key].toString(2));
            if (key === "Flags"){
                for (const key2 in TCPPacket[key]) {
                    console.log(key2);
                    console.log(TCPPacket[key][key2].toString(2));
                }

            }
        }


        //TODO: Add suport for parsing common options
        //Options
        if (TCPPacket["Data offset"] > 5){
            console.log("not implimented");
        }

        //Read TCP Data
        console.log(input);
        TCPPacket.Data = toHex(input.slice(20 + TCPPacket["Data offset"] -5, input.length), "0x");

        return TCPPacket;
    }

      /**
     * Displays the TCP Segmant in a table style
     * @param {ArrayBuffer} data
     * @returns {html}
     */
    present(data) {
        const html = [];
        html.push("<table class='table table-hover table-sm table-bordered table-nonfluid'>");
        html.push("<tr>");
        html.push("<th>Field</th>");
        html.push("<th>Value</th>");
        html.push("</tr>");

        for (const key in data) {
            switch (key){
                case "Flags": {
                    html.push("<tr>");
                    html.push("<td>Flags Set</td>");
                    html.push("<td>");
                    for (const flagKey in data[key]) {
                        if (data[key][flagKey] === 1){
                            html.push(flagKey + " ");
                        }
                    }
                    html.push("</td>");
                    break;
                }
                case "Data": {
                    html.push("<tr>");
                    html.push("<td>" + key + "</td>");
                    html.push("<td>" + `<a href="#recipe=From_Hex('Auto')&input=${toBase64(data[key])}" target="_blank" >Hexadecimal Encoded</a>` + "</td>");
                    html.push("</tr>");
                    break;
                }
                default: {
                    html.push("<tr>");
                    html.push("<td>" + key + "</td>");
                    html.push("<td>" + data[key] + "</td>");
                    html.push("</tr>");
                }

            }
        }

        html.push("</table>");
        return html.join("");
    }

}

export default ParseTCP;
