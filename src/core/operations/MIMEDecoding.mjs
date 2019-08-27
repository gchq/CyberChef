/**
 * @author mshwed [m@ttshwed.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import Utils from "../Utils";
import { fromBase64 } from "../lib/Base64";

/**
 * MIME Decoding operation
 */
class MIMEDecoding extends Operation {

    /**
     * MIMEDecoding constructor
     */
    constructor() {
        super();

        this.name = "MIME Decoding";
        this.module = "Default";
        this.description = "";
        this.infoURL = "";
        this.inputType = "byteArray";
        this.outputType = "string";
        this.args = [
            /* Example arguments. See the project wiki for full details.
            {
                name: "First arg",
                type: "string",
                value: "Don't Panic"
            },
            {
                name: "Second arg",
                type: "number",
                value: 42
            }
            */
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {

        let mimeEncodedText = Utils.byteArrayToUtf8(input)

        // const encodedWordRegex = /(\=\?)(.*?)(\?\=)/g;

        // let encodedWords = mimeEncodedText.match(encodedWordRegex);

        let parsedString = "";
        let currentPos = 0;
        let pastPosition = 0;
        while (currentPos >= 0) {
            
            // Find starting text
            currentPos = mimeEncodedText.indexOf("=?", pastPosition);
            console.log('CURRENT POSITION', currentPos);
            if (currentPos < 0) break;

            // Add existing unparsed string
            let fillerText = mimeEncodedText.substring(pastPosition, currentPos);
            console.log("PROCESSING RANGE", pastPosition, ' ' ,currentPos)
            console.log('FILLER TEXT: ', fillerText);
            if (fillerText.indexOf('\r') > 0) console.log('CR detected', fillerText.indexOf('\r'));
            if (fillerText.indexOf('\n') > 0) console.log('LF detected', fillerText.indexOf('\n'));
            if (fillerText.indexOf('\r\n') > 0) console.log('CRLF detected', fillerText.indexOf('\r\n'));
            if (fillerText.indexOf('\x20') > 0) console.log('SPACE detected', fillerText.indexOf('\x20'));
            
            if (fillerText !== '\r\n')
                parsedString += fillerText

            pastPosition = currentPos;

            // find ending text
            currentPos = mimeEncodedText.indexOf("?=", pastPosition);

            // Process block
            let encodedTextBlock = mimeEncodedText.substring(pastPosition + 2, currentPos);
            pastPosition = currentPos + 2;

            parsedString += this.parseEncodedWord(encodedTextBlock);
        }

        return parsedString;
        // let cleansedWord;
        // for (let word of encodedWords) {
        //     cleansedWord = word.replace('=?', '').replace('?=', '').split('?');
        //     let charset = cleansedWord[0];
        //     let encoding = cleansedWord[1];
        //     let encodedText = cleansedWord[2];

        //     if (encoding.toLowerCase() === 'b') {
        //         encodedText = fromBase64(encodedText);
        //     }

        //     console.log(cleansedWord);
        // }


        throw new OperationError("Test");
    }

    parseEncodedWord(encodedWord) {
        let [charset, encoding, encodedBlock] = encodedWord.split('?');

        console.log('CURRENT BLOCK TO PROCESS', encodedBlock);
        console.log('CURRENT CHARSET', charset);

        let encodedText = '';
        if (encoding.toLowerCase() === 'b') {
            encodedText = fromBase64(encodedBlock);
        } else {
            encodedText = encodedBlock;
        }

        return encodedText;
    }

}

export default MIMEDecoding;
