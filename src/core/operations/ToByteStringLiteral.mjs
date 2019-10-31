/**
 * @author edouard hinard []
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";

const LANGUAGES = {
    "C": "c",
    "Go": "go",
    "Python": "python",
};

/**
 * To Byte String Literal operation
 */
class ToByteStringLiteral extends Operation {

    /**
     * ToByteStringLiteral constructor
     */
    constructor() {
        super();

        this.name = "To Byte String Literal";
        this.module = "Default";
        this.description = "Converts the input data to byte string literal in common languages.<br><br>e.g. for python, the UTF-8 encoded string <code>ça ma couté 20€</code> becomes <code>b'\\xc3\\xa7a ma cout\\xc3\\xa9 20\\xe2\\x82\\xac'</code>";
        this.inputType = "ArrayBuffer" ;
        this.outputType = "string";this.infoURL = "https://en.wikipedia.org/wiki/String_(computer_science)#Non-text_strings";

        this.args = [
            {
                "name": "Language",
                "type": "option",
                "value": Object.keys(LANGUAGES)
            },
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const data = new Uint8Array(input);
        const language = LANGUAGES[args[0]];
        if (language === "c") {
            const sequences = Object.assign(DOUBLEQUOTE_SEQUENCE, COMMON_SEQUENCES, C_EXTRA_SEQUENCES);
            // regex is here to replace \xa7a by \xa7""a since escape sequence can have more than 2 digit
            return '"' + this.escape(data, sequences).replace(/(\\x[0-9a-f]{2})([0-9a-f])/gi, '$1""$2') + '"';
        } else if (language === "go") {
            const sequences = Object.assign(DOUBLEQUOTE_SEQUENCE, COMMON_SEQUENCES, GO_EXTRA_SEQUENCES);
            return '([]byte)("' + this.escape(data, sequences) + '")';
        } else if (language === "python") {
            const [quote, quoteSequence] = this.preferedQuote(data);
            const sequences = Object.assign(quoteSequence, COMMON_SEQUENCES, PYTHON_EXTRA_SEQUENCES);
            return "b" + quote + this.escape(data, sequences) + quote;
        }
        return "";
    }

    /**
     * @param {Uint8Array} data
     * @returns {bool}
     * python and javascript can use single or double quote equally
     * better use the variant that reduce quote escape
     */
    preferedQuote(data) {
        let onlySingleQuoteInData = false;
        for (let i = 0; i < data.length; i++) {
            if (data[i] === '"'.charCodeAt(0)) {
                onlySingleQuoteInData = false;
                break;
            }
            if (data[i] === "'".charCodeAt(0)) {
                onlySingleQuoteInData = true;
            }
        }
        if (onlySingleQuoteInData) {
            return ['"', DOUBLEQUOTE_SEQUENCE];
        }
        return ["'", SINGLEQUOTE_SEQUENCE];
    }

    /**
     * @param {Uint8Array} data
     * @param {object} sequences
     * @returns {string}
     */
    escape(data, sequences) {
        let output = "";
        for (let i = 0; i < data.length; i++) {
            output +=
                sequences[data[i]] ||
                (
                    (data[i] < 0x20 || data[i] > 0x7e) ?
                        "\\x" + data[i].toString(16).padStart(2, 0) :
                        String.fromCharCode(data[i])
                );
        }
        return output;
    }
}

const SINGLEQUOTE_SEQUENCE = {
    0x27: "\\'"
};

const DOUBLEQUOTE_SEQUENCE = {
    0x22: '\\"'
};

const COMMON_SEQUENCES = {
    0x08: "\\b",
    0x09: "\\t",
    0x0a: "\\n",
    0x0b: "\\v",
    0x0c: "\\f",
    0x0d: "\\r",
    0x5c: "\\\\"
};

// https://en.wikipedia.org/wiki/Escape_sequences_in_C
const C_EXTRA_SEQUENCES = {
    0x07: "\\a"
};

// https://golang.org/ref/spec#Rune_literals
const GO_EXTRA_SEQUENCES = {
    0x07: "\\a"
};

// https://docs.python.org/3/reference/lexical_analysis.html#string-and-bytes-literals
const PYTHON_EXTRA_SEQUENCES = {
    0x07: "\\a"
};

export default ToByteStringLiteral;
