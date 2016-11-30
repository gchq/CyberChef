import Utils from '../core/Utils';


/**
 * Hexdump operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const Hexdump = {

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
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {string}
     */
  run_to(input, args) {
    const length = args[0] || Hexdump.WIDTH;
    const upper_case = args[1];
    const include_final_length = args[2];

    let output = '',
      padding = 2;
    for (let i = 0; i < input.length; i += length) {
      const buff = input.slice(i, i + length);
      let hexa = '';
      for (let j = 0; j < buff.length; j++) {
        hexa += `${Utils.hex(buff[j], padding)} `;
      }

      let line_no = Utils.hex(i, 8);

      if (upper_case) {
        hexa = hexa.toUpperCase();
        line_no = line_no.toUpperCase();
      }

      output += `${line_no}  ${
                Utils.pad_right(hexa, (length * (padding + 1)))
                } |${Utils.pad_right(Utils.printable(Utils.byte_array_to_chars(buff)), buff.length)}|\n`;

      if (include_final_length && i + buff.length == input.length) {
        output += `${Utils.hex(i + buff.length, 8)}\n`;
      }
    }

    return output.slice(0, -1);
  },


    /**
     * From Hexdump operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {byte_array}
     */
  run_from(input, args) {
    let output = [],
      regex = /^\s*(?:[\dA-F]{4,16}:?)?\s*((?:[\dA-F]{2}\s){1,8}(?:\s|[\dA-F]{2}-)(?:[\dA-F]{2}\s){1,8}|(?:[\dA-F]{2}\s|[\dA-F]{4}\s)+)/igm,
      block,
      line;

    while (block = regex.exec(input)) {
      line = Utils.from_hex(block[1].replace(/-/g, ' '));
      for (let i = 0; i < line.length; i++) {
        output.push(line[i]);
      }
    }
        // Is this a CyberChef hexdump or is it from a different tool?
    const width = input.indexOf('\n');
    const w = (width - 13) / 4;
        // w should be the specified width of the hexdump and therefore a round number
    if (Math.floor(w) != w || input.indexOf('\r') != -1 || output.indexOf(13) != -1) {
      window.app.options.attempt_highlight = false;
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
  highlight_to(pos, args) {
        // Calculate overall selection
    let w = args[0] || 16,
      width = 14 + (w * 4),
      line = Math.floor(pos[0].start / w),
      offset = pos[0].start % w,
      start = 0,
      end = 0;

    pos[0].start = line * width + 10 + offset * 3;

    line = Math.floor(pos[0].end / w);
    offset = pos[0].end % w;
    if (offset === 0) { line--; offset = w; }
    pos[0].end = line * width + 10 + offset * 3 - 1;

        // Set up multiple selections for bytes
    let start_line_num = Math.floor(pos[0].start / width);
    const end_line_num = Math.floor(pos[0].end / width);

    if (start_line_num == end_line_num) {
      pos.push(pos[0]);
    } else {
      start = pos[0].start;
      end = (start_line_num + 1) * width - w - 5;
      pos.push({ start, end });
      while (end < pos[0].end) {
        start_line_num++;
        start = start_line_num * width + 10;
        end = (start_line_num + 1) * width - w - 5;
        if (end > pos[0].end) end = pos[0].end;
        pos.push({ start, end });
      }
    }

        // Set up multiple selections for ASCII
    let len = pos.length,
      line_num = 0;
    start = 0;
    end = 0;
    for (let i = 1; i < len; i++) {
      line_num = Math.floor(pos[i].start / width);
      start = (((pos[i].start - (line_num * width)) - 10) / 3) + (width - w - 2) + (line_num * width);
      end = (((pos[i].end + 1 - (line_num * width)) - 10) / 3) + (width - w - 2) + (line_num * width);
      pos.push({ start, end });
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
  highlight_from(pos, args) {
    const w = args[0] || 16;
    const width = 14 + (w * 4);

    let line = Math.floor(pos[0].start / width);
    let offset = pos[0].start % width;

    if (offset < 10) { // In line number section
      pos[0].start = line * w;
    } else if (offset > 10 + (w * 3)) { // In ASCII section
      pos[0].start = (line + 1) * w;
    } else { // In byte section
      pos[0].start = line * w + Math.floor((offset - 10) / 3);
    }

    line = Math.floor(pos[0].end / width);
    offset = pos[0].end % width;

    if (offset < 10) { // In line number section
      pos[0].end = line * w;
    } else if (offset > 10 + (w * 3)) { // In ASCII section
      pos[0].end = (line + 1) * w;
    } else { // In byte section
      pos[0].end = line * w + Math.ceil((offset - 10) / 3);
    }

    return pos;
  },

};

export default Hexdump;
