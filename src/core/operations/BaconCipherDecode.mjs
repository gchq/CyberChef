/**
* @author kassi [kassi@noreply.com]
* @copyright KS 2018
* @license Apache-2.0
*/

import Operation from "../Operation";

/**
* BaconCipherDecode operation
*/
class BaconCipherDecode extends Operation {
    /**
    * BaconCipherDecode constructor
    */
    constructor() {
        super();

        this.name = "Bacon Cipher Decode";
        this.module = "Default";
        this.description = "Bacon's cipher or the Baconian cipher is a method of steganography(a method of hiding a secret message as opposed to just a cipher) devised by Francis Bacon in 1605.[1][2][3] A message is concealed in the presentation of text, rather than its content.";
        this.infoURL = "https://en.wikipedia.org/wiki/Bacon%27s_cipher";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Alphabet",
                "type": "option",
                "value": ["ABCDEFGHIKLMNOPQRSTUWXYZ", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"]
            },
            {
                "name": "Translation",
                "type": "option",
                "value": ["0/1", "A/B", "Case", "A-M/N-Z"]
            },
            {
                "name": "Invert Translation",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
    * @param {String} input
    * @param {Object[]} args
    * @returns {String}
    */
    run(input, args) {
        const [alphabet, translation, invert] = args;
        const regexAM = /[A-M]/;
        const regexNZ = /[N-Z]/;
        // split text into groups of 5 characters
        const groups = [];
        let group = "";

        for (let index = 0; index < input.length; index++) {
            const char = input[index];

            if (char.toLowerCase() !== char.toUpperCase()) {
                switch (translation) {
                    case "0/1":
                        group = group + char;
                        break;
                    case "A/B":
                        if (char === "A") {
                            group = group + "1";
                        } else if (char === "B") {
                            group = group + "0";
                        }
                        break;
                    case "Case":
                        if (char === char.toUpperCase()) {
                            group = group + "1";
                        } else {
                            group = group + "0";
                        }
                        break;
                    case "A-M/N-Z":
                        if (char.match(regexAM)) {
                            group = group + "1";
                        } else if (char.match(regexNZ)) {
                            group = group + "0";
                        }
                        break;
                    default:
                        break;
                }

                if (group.length === 5) {
                    groups.push(group);
                    group = "";
                }
            }
        }

        // Padding
        if (group.length > 0) {
            group = (group + "0000").substr(0, 5);
            groups.push(group);
        }

        let output = "";
        const byteLen = 5;
        for (let index = 0; index < groups.length; index++) {
            let group = groups[index];
            if (invert) {
                group = group.replace(/[01]/g, function (m) {
                    return {
                        "0": "1",
                        "1": "0"
                    }[m];
                });
            }
            // calculate binary value
            let number;
            for (let i = 0; i < group.length; i += byteLen) {
                number = parseInt(group.substr(i, byteLen), 2);
            }
            let char;
            if (number < alphabet.length) {
                char = alphabet[number];
            } else {
                char = "?";
            }
            output += char;
        }
        return output;
    }
}

export default BaconCipherDecode;
