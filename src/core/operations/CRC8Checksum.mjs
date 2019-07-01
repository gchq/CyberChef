/**
 * @author mshwed [m@ttshwed.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";

/**
 * CRC-8 Checksum operation
 */
class CRC8Checksum extends Operation {

    /**
     * CRC8Checksum constructor
     */
    constructor() {
        super();

        this.name = "CRC-8 Checksum";
        this.module = "Crypto";
        this.description = "";
        this.infoURL = "";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
              "name": "Algorithm",
              "type": "option",
              "value": [
                  "CRC-8"
              ]  
            }
        ]
    }

    calculateCRC8(algorithmName, polynomial, initializationValue, refIn, refOut, xorOut, check) {
        let initializationValue = this.reverseBits();

        return crc;
    }

    /**
     * For an 8 bit initialization value reverse the bits. 
     * 
     * @param input 
     */
    reverseBits(input) {
        let reflectedBits = input.toString(2).split('');
        for (let i = 0; i < hashSize / 2; i++) {
            let x = reflectedBits[i];
            reflectedBits[i] = reflectedBits[hashSize - i - 1];
            reflectedBits[hashSize - i - 1] = x;
        }

        return parseInt(reflectedBits.join(''));
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const algorithm = args[0];

        if (algorithm === "CRC-8") {
            return this.calculateCRC8(algorithm, 0x7, 0x0, false, false, 0x0, 0xF4)
        }

        return "";
    }

}

const hashSize = 8;

// const CRC8AlgoParameters = {
//     'CRC8'
// }

export default CRC8Checksum;
