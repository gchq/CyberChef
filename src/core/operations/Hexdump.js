/* globals app */
var Utils = require("../Utils.js");


/**
 * Hexdump operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var Hexdump = module.exports = {

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
     * To Hexdump operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runTo: function(input, args) {
        var length = args[0] || Hexdump.WIDTH;
        var upperCase = args[1];
        var includeFinalLength = args[2];

        var output = "", padding = 2;
        for (var i = 0; i < input.length; i += length) {
            var buff = input.slice(i, i+length);
            var hexa = "";
            for (var j = 0; j < buff.length; j++) {
                hexa += Utils.hex(buff[j], padding) + " ";
            }

            var lineNo = Utils.hex(i, 8);

            if (upperCase) {
                hexa = hexa.toUpperCase();
                lineNo = lineNo.toUpperCase();
            }

            output += lineNo + "  " +
                Utils.padRight(hexa, (length*(padding+1))) +
                " |" + Utils.padRight(Utils.printable(Utils.byteArrayToChars(buff)), buff.length) + "|\n";

            if (includeFinalLength && i+buff.length === input.length) {
                output += Utils.hex(i+buff.length, 8) + "\n";
            }
        }

        return output.slice(0, -1);
    },


    /**
     * From Hexdump operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runFrom: function(input, args) {
        var output = [],
            regex = /^\s*(?:[\dA-F]{4,16}:?)?\s*((?:[\dA-F]{2}\s){1,8}(?:\s|[\dA-F]{2}-)(?:[\dA-F]{2}\s){1,8}|(?:[\dA-F]{2}\s|[\dA-F]{4}\s)+)/igm,
            block, line;

        while ((block = regex.exec(input))) {
            line = Utils.fromHex(block[1].replace(/-/g, " "));
            for (var i = 0; i < line.length; i++) {
                output.push(line[i]);
            }
        }
        // Is this a CyberChef hexdump or is it from a different tool?
        var width = input.indexOf("\n");
        var w = (width - 13) / 4;
        // w should be the specified width of the hexdump and therefore a round number
        if (Math.floor(w) !== w || input.indexOf("\r") !== -1 || output.indexOf(13) !== -1) {
            if (app) app.options.attemptHighlight = false;
        }
        return output;
    },


    /**
     * Highlight to hexdump
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightTo: function(pos, args) {
        // Calculate overall selection
        var w = args[0] || 16,
            width = 14 + (w*4),
            line = Math.floor(pos[0].start / w),
            offset = pos[0].start % w,
            start = 0,
            end = 0;

        pos[0].start = line*width + 10 + offset*3;

        line = Math.floor(pos[0].end / w);
        offset = pos[0].end % w;
        if (offset === 0) {
            line--;
            offset = w;
        }
        pos[0].end = line*width + 10 + offset*3 - 1;

        // Set up multiple selections for bytes
        var startLineNum = Math.floor(pos[0].start / width);
        var endLineNum = Math.floor(pos[0].end / width);

        if (startLineNum === endLineNum) {
            pos.push(pos[0]);
        } else {
            start = pos[0].start;
            end = (startLineNum+1) * width - w - 5;
            pos.push({ start: start, end: end });
            while (end < pos[0].end) {
                startLineNum++;
                start = startLineNum * width + 10;
                end = (startLineNum+1) * width - w - 5;
                if (end > pos[0].end) end = pos[0].end;
                pos.push({ start: start, end: end });
            }
        }

        // Set up multiple selections for ASCII
        var len = pos.length, lineNum = 0;
        start = 0;
        end = 0;
        for (var i = 1; i < len; i++) {
            lineNum = Math.floor(pos[i].start / width);
            start = (((pos[i].start - (lineNum * width)) - 10) / 3) + (width - w -2) + (lineNum * width);
            end = (((pos[i].end + 1 - (lineNum * width)) - 10) / 3) + (width - w -2) + (lineNum * width);
            pos.push({ start: start, end: end });
        }
        return pos;
    },


    /**
     * Highlight from hexdump
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightFrom: function(pos, args) {
        var w = args[0] || 16;
        var width = 14 + (w*4);

        var line = Math.floor(pos[0].start / width);
        var offset = pos[0].start % width;

        if (offset < 10) { // In line number section
            pos[0].start = line*w;
        } else if (offset > 10+(w*3)) { // In ASCII section
            pos[0].start = (line+1)*w;
        } else { // In byte section
            pos[0].start = line*w + Math.floor((offset-10)/3);
        }

        line = Math.floor(pos[0].end / width);
        offset = pos[0].end % width;

        if (offset < 10) { // In line number section
            pos[0].end = line*w;
        } else if (offset > 10+(w*3)) { // In ASCII section
            pos[0].end = (line+1)*w;
        } else { // In byte section
            pos[0].end = line*w + Math.ceil((offset-10)/3);
        }

        return pos;
    },

};
