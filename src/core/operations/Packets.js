import Utils from "../Utils.js";


/**
 * Packets operations.
 *
 * @author drkna [whytho@email]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const Packets = {
    /**
     * From Tcpdump Hexstring operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runFromTcpdump: function(input, args) {
        let output = [];
        let regex = /^\s*(?:0x[\dA-F]{4}:?)?\s*((?:[\dA-F]{4}\s?){1,8})/igm;
        let block = regex.exec(input);
        while (block) {
            let line = Utils.fromHex(block[1].replace(/-/g, " "));
            for (let i = 0; i < line.length; i++) {
                output.push(line[i]);
            }
            block = regex.exec(input);
        }
        return output;
    },


    /**
     * @constant
     * @default
     */
    STRIP_ETHERNET_HEADER: true,

    /**
     * @constant
     * @default
     */
    STRIP_IP_HEADER: true,

    /**
     * @constant
     * @default
     */
    STRIP_TCP_HEADER: true,

    /**
     * Strip TCP Headersoperation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    stripPacketHeader: function(input, args) {
        let output = input,
            stripEthernet = args[0],
            stripIP = args[1],
            stripTCP = args[2];

        if (stripEthernet) {
            output = output.replace(/^(([0-9a-f]{4} ?){6,8}0800 ?)/igm, "");
        }
        if (stripIP) {
            output = output.replace(/^((45[0-9a-f]{2} ?([0-9a-f]{4} ?){9}))/igm, "");
        }
        if (stripTCP) {
            output = output.replace(/^([0-9a-f]{4} ?){6}((80[0-9a-f]{2} ?([0-9a-f]{4} ?){9})|(50[0-9a-f]{2} ?([0-9a-f]{4} ?){3}))/igm, "");
        }

        return output;
    },
};

export default Packets;
