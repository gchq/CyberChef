/**
 * @author edouard hinard []
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";

/**
 * To Python bytes operation
 */
class ToPythonBytes extends Operation {

    /**
     * ToPythonBytes constructor
     */
    constructor() {
        super();

        this.name = "To Python bytes";
        this.module = "Default";
        this.description = "Converts the input data to Python bytes literal.<br><br>e.g. The UTF-8 encoded string <code>ça ma couté 20€</code> becomes <code>b'\\xc3\\xa7a ma cout\\xc3\\xa9 20\\xe2\\x82\\xac'</code>";
        this.infoURL = "https://docs.python.org/3/reference/lexical_analysis.html#string-and-bytes-literals";
        this.inputType = "ArrayBuffer" ;
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const data = new Uint8Array(input);
        if (!data) return "b''";

        // First pass to decide which quote to use
        //  single quote is prefered
        let onlySingleQuote = false;
        for (let i = 0; i < data.length; i++) {
            if (data[i] === 0x22) { // 0x22 <-> "
                onlySingleQuote = false;
                break;
            }
            if (data[i] === 0x27) { // 0x27 <-> '
                onlySingleQuote = true;
            }
        }
        let singleQuoted = true;
        if (onlySingleQuote) {
            singleQuoted = false;
        }

        // Second pass to convert byte array in Python bytes literal
        let output = "";
        for (let i = 0; i < data.length; i++) {
            if (data[i] === 0x09) {
                output += "\\t";
            } else if (data[i] === 0x0a) {
                output += "\\n";
            } else if (data[i] === 0x0d) {
                output += "\\r";
            } else if (data[i] === 0x22 && !singleQuoted) {
                output += '\\"';
            } else if (data[i] === 0x27 && singleQuoted) {
                output += "\\'";
            } else if (data[i] === 0x5c) {
                output += "\\";
            } else if (data[i] < 0x20 || data[i] > 0x7e) {
                output += "\\x" + data[i].toString(16).padStart(2, 0);
            } else {
                output += String.fromCharCode(data[i]);
            }
        }
        if (singleQuoted) {
            return "b'" + output + "'";
        } else {
            return 'b"' + output + '"';
        }
    }
}

export default ToPythonBytes;
