import Utils from "../Utils.js";


/**
 * Base64 operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const Base64 = {

    /**
     * @constant
     * @default
     */
    ALPHABET: "A-Za-z0-9+/=",
    /**
     * @constant
     * @default
     */
    ALPHABET_OPTIONS: [
        {name: "Standard: A-Za-z0-9+/=", value: "A-Za-z0-9+/="},
        {name: "URL safe: A-Za-z0-9-_", value: "A-Za-z0-9-_"},
        {name: "Filename safe: A-Za-z0-9+-=", value: "A-Za-z0-9+\\-="},
        {name: "itoa64: ./0-9A-Za-z=", value: "./0-9A-Za-z="},
        {name: "XML: A-Za-z0-9_.", value: "A-Za-z0-9_."},
        {name: "y64: A-Za-z0-9._-", value: "A-Za-z0-9._-"},
        {name: "z64: 0-9a-zA-Z+/=", value: "0-9a-zA-Z+/="},
        {name: "Radix-64: 0-9A-Za-z+/=", value: "0-9A-Za-z+/="},
        {name: "Uuencoding: [space]-_", value: " -_"},
        {name: "Xxencoding: +-0-9A-Za-z", value: "+\\-0-9A-Za-z"},
        {name: "BinHex: !-,-0-689@A-NP-VX-Z[`a-fh-mp-r", value: "!-,-0-689@A-NP-VX-Z[`a-fh-mp-r"},
        {name: "ROT13: N-ZA-Mn-za-m0-9+/=", value: "N-ZA-Mn-za-m0-9+/="},
        {name: "UNIX crypt: ./0-9A-Za-z", value: "./0-9A-Za-z"},
    ],

    /**
     * To Base64 operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runTo: function(input, args) {
        const alphabet = args[0] || Base64.ALPHABET;
        return Utils.toBase64(input, alphabet);
    },


    /**
     * @constant
     * @default
     */
    REMOVE_NON_ALPH_CHARS: true,

    /**
     * From Base64 operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runFrom: function(input, args) {
        let alphabet = args[0] || Base64.ALPHABET,
            removeNonAlphChars = args[1];

        return Utils.fromBase64(input, alphabet, "byteArray", removeNonAlphChars);
    },


    /**
     * @constant
     * @default
     */
    BASE32_ALPHABET: "A-Z2-7=",

    /**
     * To Base32 operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runTo32: function(input, args) {
        if (!input) return "";

        let alphabet = args[0] ?
                Utils.expandAlphRange(args[0]).join("") : "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
            output = "",
            chr1, chr2, chr3, chr4, chr5,
            enc1, enc2, enc3, enc4, enc5, enc6, enc7, enc8,
            i = 0;

        while (i < input.length) {
            chr1 = input[i++];
            chr2 = input[i++];
            chr3 = input[i++];
            chr4 = input[i++];
            chr5 = input[i++];

            enc1 = chr1 >> 3;
            enc2 = ((chr1 & 7) << 2) | (chr2 >> 6);
            enc3 = (chr2 >> 1) & 31;
            enc4 = ((chr2 & 1) << 4) | (chr3 >> 4);
            enc5 = ((chr3 & 15) << 1) | (chr4 >> 7);
            enc6 = (chr4 >> 2) & 31;
            enc7 = ((chr4 & 3) << 3) | (chr5 >> 5);
            enc8 = chr5 & 31;

            if (isNaN(chr2)) {
                enc3 = enc4 = enc5 = enc6 = enc7 = enc8 = 32;
            } else if (isNaN(chr3)) {
                enc5 = enc6 = enc7 = enc8 = 32;
            } else if (isNaN(chr4)) {
                enc6 = enc7 = enc8 = 32;
            } else if (isNaN(chr5)) {
                enc8 = 32;
            }

            output += alphabet.charAt(enc1) + alphabet.charAt(enc2) + alphabet.charAt(enc3) +
                alphabet.charAt(enc4) + alphabet.charAt(enc5) + alphabet.charAt(enc6) +
                alphabet.charAt(enc7) + alphabet.charAt(enc8);
        }

        return output;
    },


    /**
     * From Base32 operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runFrom32: function(input, args) {
        if (!input) return [];

        let alphabet = args[0] ?
                Utils.expandAlphRange(args[0]).join("") : "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
            removeNonAlphChars = args[0];

        let output = [],
            chr1, chr2, chr3, chr4, chr5,
            enc1, enc2, enc3, enc4, enc5, enc6, enc7, enc8,
            i = 0;

        if (removeNonAlphChars) {
            const re = new RegExp("[^" + alphabet.replace(/[\]\\\-^]/g, "\\$&") + "]", "g");
            input = input.replace(re, "");
        }

        while (i < input.length) {
            enc1 = alphabet.indexOf(input.charAt(i++));
            enc2 = alphabet.indexOf(input.charAt(i++) || "=");
            enc3 = alphabet.indexOf(input.charAt(i++) || "=");
            enc4 = alphabet.indexOf(input.charAt(i++) || "=");
            enc5 = alphabet.indexOf(input.charAt(i++) || "=");
            enc6 = alphabet.indexOf(input.charAt(i++) || "=");
            enc7 = alphabet.indexOf(input.charAt(i++) || "=");
            enc8 = alphabet.indexOf(input.charAt(i++) || "=");

            chr1 = (enc1 << 3) | (enc2 >> 2);
            chr2 = ((enc2 & 3) << 6) | (enc3 << 1) | (enc4 >> 4);
            chr3 = ((enc4 & 15) << 4) | (enc5 >> 1);
            chr4 = ((enc5 & 1) << 7) | (enc6 << 2) | (enc7 >> 3);
            chr5 = ((enc7 & 7) << 5) | enc8;

            output.push(chr1);
            if (enc2 & 3 !== 0 || enc3 !== 32) output.push(chr2);
            if (enc4 & 15 !== 0 || enc5 !== 32) output.push(chr3);
            if (enc5 & 1 !== 0 || enc6 !== 32) output.push(chr4);
            if (enc7 & 7 !== 0 || enc8 !== 32) output.push(chr5);
        }

        return output;
    },


    /**
     * @constant
     * @default
     */
    SHOW_IN_BINARY: false,
    /**
     * @constant
     * @default
     */
    OFFSETS_SHOW_VARIABLE: true,

    /**
     * Show Base64 offsets operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {html}
     */
    runOffsets: function(input, args) {
        let alphabet = args[0] || Base64.ALPHABET,
            showVariable = args[1],
            offset0 = Utils.toBase64(input, alphabet),
            offset1 = Utils.toBase64([0].concat(input), alphabet),
            offset2 = Utils.toBase64([0, 0].concat(input), alphabet),
            len0 = offset0.indexOf("="),
            len1 = offset1.indexOf("="),
            len2 = offset2.indexOf("="),
            script = "<script type='application/javascript'>$('[data-toggle=\"tooltip\"]').tooltip()</script>",
            staticSection = "",
            padding = "";

        if (input.length < 1) {
            return "Please enter a string.";
        }

        // Highlight offset 0
        if (len0 % 4 === 2) {
            staticSection = offset0.slice(0, -3);
            offset0 = "<span data-toggle='tooltip' data-placement='top' title='" +
                Utils.escapeHtml(Utils.fromBase64(staticSection, alphabet).slice(0, -2)) + "'>" +
                staticSection + "</span>" +
                "<span class='hlgreen'>" + offset0.substr(offset0.length - 3, 1) + "</span>" +
                "<span class='hlred'>" + offset0.substr(offset0.length - 2) + "</span>";
        } else if (len0 % 4 === 3) {
            staticSection = offset0.slice(0, -2);
            offset0 = "<span data-toggle='tooltip' data-placement='top' title='" +
                Utils.escapeHtml(Utils.fromBase64(staticSection, alphabet).slice(0, -1)) + "'>" +
                staticSection + "</span>" +
                "<span class='hlgreen'>" + offset0.substr(offset0.length - 2, 1) + "</span>" +
                "<span class='hlred'>" + offset0.substr(offset0.length - 1) + "</span>";
        } else {
            staticSection = offset0;
            offset0 = "<span data-toggle='tooltip' data-placement='top' title='" +
                Utils.escapeHtml(Utils.fromBase64(staticSection, alphabet)) + "'>" +
                staticSection + "</span>";
        }

        if (!showVariable) {
            offset0 = staticSection;
        }


        // Highlight offset 1
        padding = "<span class='hlred'>" + offset1.substr(0, 1) + "</span>" +
            "<span class='hlgreen'>" + offset1.substr(1, 1) + "</span>";
        offset1 = offset1.substr(2);
        if (len1 % 4 === 2) {
            staticSection = offset1.slice(0, -3);
            offset1 = padding + "<span data-toggle='tooltip' data-placement='top' title='" +
                Utils.escapeHtml(Utils.fromBase64("AA" + staticSection, alphabet).slice(1, -2)) + "'>" +
                staticSection + "</span>" +
                "<span class='hlgreen'>" + offset1.substr(offset1.length - 3, 1) + "</span>" +
                "<span class='hlred'>" + offset1.substr(offset1.length - 2) + "</span>";
        } else if (len1 % 4 === 3) {
            staticSection = offset1.slice(0, -2);
            offset1 = padding + "<span data-toggle='tooltip' data-placement='top' title='" +
                Utils.escapeHtml(Utils.fromBase64("AA" + staticSection, alphabet).slice(1, -1)) + "'>" +
                staticSection + "</span>" +
                "<span class='hlgreen'>" + offset1.substr(offset1.length - 2, 1) + "</span>" +
                "<span class='hlred'>" + offset1.substr(offset1.length - 1) + "</span>";
        } else {
            staticSection = offset1;
            offset1 = padding +  "<span data-toggle='tooltip' data-placement='top' title='" +
                Utils.escapeHtml(Utils.fromBase64("AA" + staticSection, alphabet).slice(1)) + "'>" +
                staticSection + "</span>";
        }

        if (!showVariable) {
            offset1 = staticSection;
        }

        // Highlight offset 2
        padding = "<span class='hlred'>" + offset2.substr(0, 2) + "</span>" +
            "<span class='hlgreen'>" + offset2.substr(2, 1) + "</span>";
        offset2 = offset2.substr(3);
        if (len2 % 4 === 2) {
            staticSection = offset2.slice(0, -3);
            offset2 = padding + "<span data-toggle='tooltip' data-placement='top' title='" +
                Utils.escapeHtml(Utils.fromBase64("AAA" + staticSection, alphabet).slice(2, -2)) + "'>" +
                staticSection + "</span>" +
                "<span class='hlgreen'>" + offset2.substr(offset2.length - 3, 1) + "</span>" +
                "<span class='hlred'>" + offset2.substr(offset2.length - 2) + "</span>";
        } else if (len2 % 4 === 3) {
            staticSection = offset2.slice(0, -2);
            offset2 = padding + "<span data-toggle='tooltip' data-placement='top' title='" +
                Utils.escapeHtml(Utils.fromBase64("AAA" + staticSection, alphabet).slice(2, -2)) + "'>" +
                staticSection + "</span>" +
                "<span class='hlgreen'>" + offset2.substr(offset2.length - 2, 1) + "</span>" +
                "<span class='hlred'>" + offset2.substr(offset2.length - 1) + "</span>";
        } else {
            staticSection = offset2;
            offset2 = padding +  "<span data-toggle='tooltip' data-placement='top' title='" +
                Utils.escapeHtml(Utils.fromBase64("AAA" + staticSection, alphabet).slice(2)) + "'>" +
                staticSection + "</span>";
        }

        if (!showVariable) {
            offset2 = staticSection;
        }

        return (showVariable ? "Characters highlighted in <span class='hlgreen'>green</span> could change if the input is surrounded by more data." +
            "\nCharacters highlighted in <span class='hlred'>red</span> are for padding purposes only." +
            "\nUnhighlighted characters are <span data-toggle='tooltip' data-placement='top' title='Tooltip on left'>static</span>." +
            "\nHover over the static sections to see what they decode to on their own.\n" +
            "\nOffset 0: " + offset0 +
            "\nOffset 1: " + offset1 +
            "\nOffset 2: " + offset2 +
            script :
            offset0 + "\n" + offset1 + "\n" + offset2);
    },


    /**
     * Highlight to Base64
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightTo: function(pos, args) {
        pos[0].start = Math.floor(pos[0].start / 3 * 4);
        pos[0].end = Math.ceil(pos[0].end / 3 * 4);
        return pos;
    },

    /**
     * Highlight from Base64
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightFrom: function(pos, args) {
        pos[0].start = Math.ceil(pos[0].start / 4 * 3);
        pos[0].end = Math.floor(pos[0].end / 4 * 3);
        return pos;
    },

};

export default Base64;
