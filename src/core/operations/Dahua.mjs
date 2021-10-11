/**
 * @author Oscar Molnar [tymscar@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import crypto from 'crypto';

/**
 * Dahua operation
 */
class Dahua extends Operation {

    /**
     * Dahua constructor
     */
    constructor() {
        super();

        this.name = "Dahua";
        this.module = "Crypto";
        this.description = "Dahua is a hashing standard used on many DVRs and network cameras.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * Compresses the input into the final ascii array
     * 
     * @param {Number[]} input
     * @returns {String[]}
     */
    compressor(input) {
        let j=0, i =0
        let output = Array(8).fill('')
        while (i<input.length){
            output[j] = (input[i] + input[i+1]) % 62
            if(output[j] < 10){
                output[j] += 48
            } else if(output[j] < 36){
                output[j] += 55
            } else {
                output[j] += 61
            }
            i+=2
            j+=1
        }
        return output
    }
    
    /**
     * Calculate the Dahua hash of an input
     * 
     * @param {string} input
     * @returns {string}
     */
    dhash(input){
        const md5Hash = crypto.createHash('md5').update(input)
        const crypt = [...md5Hash.digest()]
        const compressed = this.compressor(crypt)
        const answer = compressed.map((character)=>String.fromCharCode(character))
        return answer.join('')
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        return this.dhash(input);
    }

}

export default Dahua;
