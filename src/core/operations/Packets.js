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
     * @constant
     * @default
     */
    WIDTH: 16,
    /**
     * @constant
     * @default
     */
    UPPER_CASE: false,
    /**
     * @constant
     * @default
     */
    INCLUDE_FINAL_LENGTH: false,

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

};

export default Packets;
