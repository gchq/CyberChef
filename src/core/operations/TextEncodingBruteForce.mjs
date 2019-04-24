/**
 * @author Cynser
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import cptable from "../vendor/js-codepage/cptable.js";
import {IO_FORMAT} from "../lib/ChrEnc";

/**
 * Text Encoding Brute Force operation
 */
class TextEncodingBruteForce extends Operation {

    /**
     * TextEncodingBruteForce constructor
     */
    constructor() {
        super();

        this.name = "Text Encoding Brute Force";
        this.module = "Encodings";
        this.description = [
            "Enumerates all supported text encodings for the input, allowing you to quickly spot the correct one.",
            "<br><br>",
            "Supported charsets are:",
            "<ul>",
            Object.keys(IO_FORMAT).map(e => `<li>${e}</li>`).join("\n"),
            "</ul>"
        ].join("\n");
        this.infoURL = "https://wikipedia.org/wiki/Character_encoding";
        this.inputType = "string";
        this.outputType = "json";
        this.presentType = "html";
        this.args = [
            {
                name: "Mode",
                type: "option",
                value: ["Encode", "Decode"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {json}
     */
    run(input, args) {
        const output = {},
            charsets = Object.keys(IO_FORMAT),
            mode = args[0];

        charsets.forEach(charset => {
            try {
                if (mode === "Decode") {
                    output[charset] = cptable.utils.decode(IO_FORMAT[charset], input);
                } else {
                    output[charset] = Utils.arrayBufferToStr(cptable.utils.encode(IO_FORMAT[charset], input));
                }
            } catch (err) {
                output[charset] = "Could not decode.";
            }
        });

        return output;
    }

    /**
     * Displays the encodings in an HTML table for web apps.
     *
     * @param {Object[]} encodings
     * @returns {html}
     */
    present(encodings) {
        let table = "<table class='table table-hover table-sm table-bordered table-nonfluid'><tr><th>Encoding</th><th>Value</th></tr>";

        for (const enc in encodings) {
            const value = Utils.escapeHtml(Utils.printable(encodings[enc], true));
            table += `<tr><td>${enc}</td><td>${value}</td></tr>`;
        }

        table += "<table>";
        return table;
    }

}

export default TextEncodingBruteForce;
