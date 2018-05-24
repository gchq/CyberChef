/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";

/**
 * To Hexdump operation
 */
class ToHexdump extends Operation {

    /**
     * ToHexdump constructor
     */
    constructor() {
        super();

        this.name = "To Hexdump";
        this.module = "Default";
        this.description = "Creates a hexdump of the input data, displaying both the hexadecimal values of each byte and an ASCII representation alongside.";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                "name": "Width",
                "type": "number",
                "value": 16
            },
            {
                "name": "Upper case hex",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Include final length",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const data = new Uint8Array(input);
        const [length, upperCase, includeFinalLength] = args;
        const padding = 2;

        let output = "";
        for (let i = 0; i < data.length; i += length) {
            const buff = data.slice(i, i+length);
            let hexa = "";
            for (let j = 0; j < buff.length; j++) {
                hexa += Utils.hex(buff[j], padding) + " ";
            }

            let lineNo = Utils.hex(i, 8);

            if (upperCase) {
                hexa = hexa.toUpperCase();
                lineNo = lineNo.toUpperCase();
            }

            output += lineNo + "  " +
                hexa.padEnd(length*(padding+1), " ") +
                " |" + Utils.printable(Utils.byteArrayToChars(buff)).padEnd(buff.length, " ") + "|\n";

            if (includeFinalLength && i+buff.length === data.length) {
                output += Utils.hex(i+buff.length, 8) + "\n";
            }
        }

        return output.slice(0, -1);
    }

    /**
     * Highlight To Hexdump
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
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

    /**
     * Highlight To Hexdump in reverse
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightReverse(pos, args) {
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

}

export default ToHexdump;
