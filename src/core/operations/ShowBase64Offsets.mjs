/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import {fromBase64, toBase64} from "../lib/Base64";

/**
 * Show Base64 offsets operation
 */
class ShowBase64Offsets extends Operation {

    /**
     * ShowBase64Offsets constructor
     */
    constructor() {
        super();

        this.name = "Show Base64 offsets";
        this.module = "Default";
        this.description = "When a string is within a block of data and the whole block is Base64'd, the string itself could be represented in Base64 in three distinct ways depending on its offset within the block.<br><br>This operation shows all possible offsets for a given string so that each possible encoding can be considered.";
        this.inputType = "byteArray";
        this.outputType = "html";
        this.args = [
            {
                name: "Alphabet",
                type: "binaryString",
                value: "A-Za-z0-9+/="
            },
            {
                name: "Show variable chars and padding",
                type: "boolean",
                value: true
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {
        const [alphabet, showVariable] = args;

        let offset0 = toBase64(input, alphabet),
            offset1 = toBase64([0].concat(input), alphabet),
            offset2 = toBase64([0, 0].concat(input), alphabet),
            staticSection = "",
            padding = "";

        const len0 = offset0.indexOf("="),
            len1 = offset1.indexOf("="),
            len2 = offset2.indexOf("="),
            script = "<script type='application/javascript'>$('[data-toggle=\"tooltip\"]').tooltip()</script>";

        if (input.length < 1) {
            return "Please enter a string.";
        }

        // Highlight offset 0
        if (len0 % 4 === 2) {
            staticSection = offset0.slice(0, -3);
            offset0 = "<span data-toggle='tooltip' data-placement='top' title='" +
                Utils.escapeHtml(fromBase64(staticSection, alphabet).slice(0, -2)) + "'>" +
                staticSection + "</span>" +
                "<span class='hl5'>" + offset0.substr(offset0.length - 3, 1) + "</span>" +
                "<span class='hl3'>" + offset0.substr(offset0.length - 2) + "</span>";
        } else if (len0 % 4 === 3) {
            staticSection = offset0.slice(0, -2);
            offset0 = "<span data-toggle='tooltip' data-placement='top' title='" +
                Utils.escapeHtml(fromBase64(staticSection, alphabet).slice(0, -1)) + "'>" +
                staticSection + "</span>" +
                "<span class='hl5'>" + offset0.substr(offset0.length - 2, 1) + "</span>" +
                "<span class='hl3'>" + offset0.substr(offset0.length - 1) + "</span>";
        } else {
            staticSection = offset0;
            offset0 = "<span data-toggle='tooltip' data-placement='top' title='" +
                Utils.escapeHtml(fromBase64(staticSection, alphabet)) + "'>" +
                staticSection + "</span>";
        }

        if (!showVariable) {
            offset0 = staticSection;
        }


        // Highlight offset 1
        padding = "<span class='hl3'>" + offset1.substr(0, 1) + "</span>" +
            "<span class='hl5'>" + offset1.substr(1, 1) + "</span>";
        offset1 = offset1.substr(2);
        if (len1 % 4 === 2) {
            staticSection = offset1.slice(0, -3);
            offset1 = padding + "<span data-toggle='tooltip' data-placement='top' title='" +
                Utils.escapeHtml(fromBase64("AA" + staticSection, alphabet).slice(1, -2)) + "'>" +
                staticSection + "</span>" +
                "<span class='hl5'>" + offset1.substr(offset1.length - 3, 1) + "</span>" +
                "<span class='hl3'>" + offset1.substr(offset1.length - 2) + "</span>";
        } else if (len1 % 4 === 3) {
            staticSection = offset1.slice(0, -2);
            offset1 = padding + "<span data-toggle='tooltip' data-placement='top' title='" +
                Utils.escapeHtml(fromBase64("AA" + staticSection, alphabet).slice(1, -1)) + "'>" +
                staticSection + "</span>" +
                "<span class='hl5'>" + offset1.substr(offset1.length - 2, 1) + "</span>" +
                "<span class='hl3'>" + offset1.substr(offset1.length - 1) + "</span>";
        } else {
            staticSection = offset1;
            offset1 = padding +  "<span data-toggle='tooltip' data-placement='top' title='" +
                Utils.escapeHtml(fromBase64("AA" + staticSection, alphabet).slice(1)) + "'>" +
                staticSection + "</span>";
        }

        if (!showVariable) {
            offset1 = staticSection;
        }

        // Highlight offset 2
        padding = "<span class='hl3'>" + offset2.substr(0, 2) + "</span>" +
            "<span class='hl5'>" + offset2.substr(2, 1) + "</span>";
        offset2 = offset2.substr(3);
        if (len2 % 4 === 2) {
            staticSection = offset2.slice(0, -3);
            offset2 = padding + "<span data-toggle='tooltip' data-placement='top' title='" +
                Utils.escapeHtml(fromBase64("AAA" + staticSection, alphabet).slice(2, -2)) + "'>" +
                staticSection + "</span>" +
                "<span class='hl5'>" + offset2.substr(offset2.length - 3, 1) + "</span>" +
                "<span class='hl3'>" + offset2.substr(offset2.length - 2) + "</span>";
        } else if (len2 % 4 === 3) {
            staticSection = offset2.slice(0, -2);
            offset2 = padding + "<span data-toggle='tooltip' data-placement='top' title='" +
                Utils.escapeHtml(fromBase64("AAA" + staticSection, alphabet).slice(2, -2)) + "'>" +
                staticSection + "</span>" +
                "<span class='hl5'>" + offset2.substr(offset2.length - 2, 1) + "</span>" +
                "<span class='hl3'>" + offset2.substr(offset2.length - 1) + "</span>";
        } else {
            staticSection = offset2;
            offset2 = padding +  "<span data-toggle='tooltip' data-placement='top' title='" +
                Utils.escapeHtml(fromBase64("AAA" + staticSection, alphabet).slice(2)) + "'>" +
                staticSection + "</span>";
        }

        if (!showVariable) {
            offset2 = staticSection;
        }

        return (showVariable ? "Characters highlighted in <span class='hl5'>green</span> could change if the input is surrounded by more data." +
            "\nCharacters highlighted in <span class='hl3'>red</span> are for padding purposes only." +
            "\nUnhighlighted characters are <span data-toggle='tooltip' data-placement='top' title='Tooltip on left'>static</span>." +
            "\nHover over the static sections to see what they decode to on their own.\n" +
            "\nOffset 0: " + offset0 +
            "\nOffset 1: " + offset1 +
            "\nOffset 2: " + offset2 +
            script :
            offset0 + "\n" + offset1 + "\n" + offset2);
    }

}

export default ShowBase64Offsets;
