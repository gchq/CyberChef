/**
 * @author Jarmo van Lenthe [github.com/jarmovanlenthe]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import {DELIM_OPTIONS} from "../lib/Delim.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * A1Z26 Cipher Decode operation
 */
class A1Z26CipherDecode extends Operation {

    /**
     * A1Z26CipherDecode constructor
     */
    constructor() {
        super();

        this.name = "A1Z26 Cipher Decode";
        this.module = "Ciphers";
        this.description = "Converts alphabet order numbers into their corresponding  alphabet character.<br><br>e.g. <code>1</code> becomes <code>a</code> and <code>2</code> becomes <code>b</code>.";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "string";

        // Issue 1124 - sometimes hyphen is used as a character delimiter
        var char_d = [...DELIM_OPTIONS];
        char_d.push("Hyphen");

        var word_d = [...DELIM_OPTIONS];
        word_d.unshift("None");

        this.args = [
            {
                name: "Character Delimiter",
                type: "option",
                value: char_d
            },
            {
                name: "Word Delimiter",
                type: "option",
                value: word_d
            }
        ];
        this.checks = [
            {
                pattern:  "^\\s*([12]?[0-9] )+[12]?[0-9]\\s*$",
                flags:  "",
                args:   ["Space"]
            },
            {
                pattern:  "^\\s*([12]?[0-9],)+[12]?[0-9]\\s*$",
                flags:  "",
                args:   ["Comma"]
            },
            {
                pattern:  "^\\s*([12]?[0-9];)+[12]?[0-9]\\s*$",
                flags:  "",
                args:   ["Semi-colon"]
            },
            {
                pattern:  "^\\s*([12]?[0-9]:)+[12]?[0-9]\\s*$",
                flags:  "",
                args:   ["Colon"]
            },
            {
                pattern:  "^\\s*([12]?[0-9]\\n)+[12]?[0-9]\\s*$",
                flags:  "",
                args:   ["Line feed"]
            },
            {
                pattern:  "^\\s*([12]?[0-9]-)+[12]?[0-9]\\s*$",
                flags:  "",
                args:   ["Hyphen"]
            },
            {
                pattern:  "^\\s*([12]?[0-9]\\r\\n)+[12]?[0-9]\\s*$",
                flags:  "",
                args:   ["CRLF"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const char_delim = Utils.charRep(args[0] || "Space");
        const word_delim = Utils.charRep(args[1] || "None");

        if (input.length === 0) {
            return [];
        }

        var words;
        if (word_delim != "") {
            words = input.split(word_delim);
        } else {
            words = [input];
        }

        let output = "";
        for (let j = 0; j < words.length; j++) {
            const bites = words[j].split(char_delim);
            let latin1 = "";
            for (let i = 0; i < bites.length; i++) {
                if (bites[i] < 1 || bites[i] > 26) {
                    throw new OperationError("Error: all numbers must be between 1 and 26.");
                }
                latin1 += Utils.chr(parseInt(bites[i], 10) + 96);
            }
            output = output + " " + latin1;
        }
        return output;
    }

}

export default A1Z26CipherDecode;
