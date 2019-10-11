/**
 * @author MarvinJWendt [git@marvinjwendt.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Convert to NATO alphabet operation
 */
class ConvertToNATOAlphabet extends Operation {
    /**
     * ConvertToNATOAlphabet constructor
     */
    constructor() {
        super();

        this.name = "Convert to NATO alphabet";
        this.module = "Default";
        this.description = "Convert a text to NATO alphabet.";
        this.infoURL = "https://en.wikipedia.org/wiki/NATO_phonetic_alphabet";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        let result = "";

        const text = input.toUpperCase();

        for (let i = 0; i < text.length; i++) {
            switch (text.charAt(i)) {
                case "A":
                    result +=  "alfa ";
                    break;
                case "B":
                    result +=  "bravo ";
                    break;
                case "C":
                    result +=  "charlie ";
                    break;
                case "D":
                    result +=  "delta ";
                    break;
                case "E":
                    result +=  "echo ";
                    break;
                case "F":
                    result +=  "foxtrot ";
                    break;
                case "G":
                    result +=  "golf ";
                    break;
                case "H":
                    result +=  "hotel ";
                    break;
                case "I":
                    result +=  "india ";
                    break;
                case "J":
                    result +=  "juliett ";
                    break;
                case "K":
                    result +=  "kilo ";
                    break;
                case "L":
                    result +=  "lima ";
                    break;
                case "M":
                    result +=  "mike ";
                    break;
                case "N":
                    result +=  "november ";
                    break;
                case "O":
                    result +=  "oscar ";
                    break;
                case "P":
                    result +=  "papa ";
                    break;
                case "Q":
                    result +=  "quebec ";
                    break;
                case "R":
                    result +=  "romeo ";
                    break;
                case "S":
                    result +=  "sierra ";
                    break;
                case "T":
                    result +=  "tango ";
                    break;
                case "U":
                    result +=  "uniform ";
                    break;
                case "V":
                    result +=  "victor ";
                    break;
                case "W":
                    result +=  "whiskey ";
                    break;
                case "X":
                    result +=  "xray ";
                    break;
                case "Y":
                    result +=  "yankee ";
                    break;
                case "Z":
                    result +=  "zulu ";
                    break;
                case " ":
                    result +=  " ";
                    break;
                case "0":
                    result += "zero ";
                    break;
                case "1":
                    result += "one ";
                    break;
                case "2":
                    result += "two ";
                    break;
                case "3":
                    result += "three ";
                    break;
                case "4":
                    result += "four ";
                    break;
                case "5":
                    result += "five ";
                    break;
                case "6":
                    result += "six ";
                    break;
                case "7":
                    result += "seven ";
                    break;
                case "8":
                    result += "eight ";
                    break;
                case "9":
                    result += "nine ";
                    break;
                default:
                    result +=  text.charAt(i) + " ";
            }
        }

        return result;
    }
}

export default ConvertToNATOAlphabet;
