/**
 * @author dolphinOnKeys [robin@weird.io]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Cetacean Cipher Encode operation
 */
class CetaceanCipherEncode extends Operation {

    /**
     * CetaceanCipherEncode constructor
     */
    constructor() {
        super();

        this.name = "Cetacean Cipher Encode";
        this.module = "Ciphers";
        this.description = "Converts any input into Cetacean Cipher. <br/><br/>e.g. <code>hi</code> becomes <code>EEEEEEEEEeeEeEEEEEEEEEEEEeeEeEEe</code>\"";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "string";
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        let result = [];
        let charArray = input.split('');

        charArray.map( ( character ) => {
            if ( character === ' ' ) {
                result.push( character );
            } else {
                const binaryArray = this.encodeToBinary( character ).split('');
                result.push( binaryArray.map(( str ) => str === '1' ? 'e' : 'E' ).join(''));
            }
        });

        return result.join('');
    }

    encodeToBinary( char, padding = 16 ) {
        return char.charCodeAt(0).toString(2).padStart( padding, '0');
    }
}

export default CetaceanCipherEncode;
