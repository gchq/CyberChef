/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import {fromHex} from "../lib/Hex";

/**
 * From Hexdump operation
 */
class FromHexdump extends Operation {

    /**
     * FromHexdump constructor
     */
    constructor() {
        super();

        this.name = "From Hexdump";
        this.module = "Default";
        this.description = "Attempts to convert a hexdump back into raw data. This operation supports many different hexdump variations, but probably not all. Make sure you verify that the data it gives you is correct before continuing analysis.";
        this.infoURL = "https://wikipedia.org/wiki/Hex_dump";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [];
        this.patterns = [
            {
                match: "^(?:(?:[\\dA-F]{4,16}h?:?)?[ \\t]*((?:[\\dA-F]{2} ){1,8}(?:[ \\t]|[\\dA-F]{2}-)(?:[\\dA-F]{2} ){1,8}|(?:[\\dA-F]{4} )*[\\dA-F]{4}|(?:[\\dA-F]{2} )*[\\dA-F]{2})[^\\n]*\\n?){2,}$",
                flags: "i",
                args: []
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const output = [],
            regex = /^\s*(?:[\dA-F]{4,16}h?:?)?[ \t]+((?:[\dA-F]{2} ){1,8}(?:[ \t]|[\dA-F]{2}-)(?:[\dA-F]{2} ){1,8}|(?:[\dA-F]{4} )*[\dA-F]{4}|(?:[\dA-F]{2} )*[\dA-F]{2})/igm;
        let block, line;

        while ((block = regex.exec(input))) {
            line = fromHex(block[1].replace(/-/g, " "));
            for (let i = 0; i < line.length; i++) {
                output.push(line[i]);
            }
        }
        // Is this a CyberChef hexdump or is it from a different tool?
        const width = input.indexOf("\n");
        const w = (width - 13) / 4;
        // w should be the specified width of the hexdump and therefore a round number
        if (Math.floor(w) !== w || input.indexOf("\r") !== -1 || output.indexOf(13) !== -1) {
            if (ENVIRONMENT_IS_WORKER()) self.setOption("attemptHighlight", false);
        }
        return output;
    }

    /**
     * Highlight From Hexdump
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
        const w = args[0] || 16;
        const width = 14 + (w*4);

        let line = Math.floor(pos[0].start / width);
        let offset = pos[0].start % width;

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
    }

    /**
     * Highlight From Hexdump in reverse
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightReverse(pos, args) {
        // Calculate overall selection
        const w = args[0] || 16,
            width = 14 + (w*4);
        let line = Math.floor(pos[0].start / w),
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
        let startLineNum = Math.floor(pos[0].start / width);
        const endLineNum = Math.floor(pos[0].end / width);

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
        const len = pos.length;
        let lineNum = 0;
        start = 0;
        end = 0;
        for (let i = 1; i < len; i++) {
            lineNum = Math.floor(pos[i].start / width);
            start = (((pos[i].start - (lineNum * width)) - 10) / 3) + (width - w -2) + (lineNum * width);
            end = (((pos[i].end + 1 - (lineNum * width)) - 10) / 3) + (width - w -2) + (lineNum * width);
            pos.push({ start: start, end: end });
        }
        return pos;
    }

}

export default FromHexdump;
