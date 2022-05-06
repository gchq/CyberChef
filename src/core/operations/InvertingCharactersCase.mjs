/**
 * @author Sichej [edoardo.sichelli@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Inverting characters case operation
 */
class InvertingCharactersCase extends Operation {

    /**
     * InvertingCharactersCase constructor
     */
    constructor() {
        super();

        this.name = "Inverting characters case";
        this.module = "Default";
        this.description = "Inverting characters case <code>vgHPCYbcyxnLnJqGBwvHBNmGC29TzxrOAw5NlG==</code> becomes <code>VGhpcyBCYXNlNjQgbWVhbnMgc29tZXRoaW5nLg==</code>";
        this.infoURL = "";
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
        var result = "";
        for(var i = 0; i < input.length; i++){
            result += this.checkAndChangeCase(input[i]);
        }
        return result;
    }

    /**
     * Check if a character is Uppercase or Lowercase 
     * and returns the opposite
     */
    checkAndChangeCase(character){
        try {
            if(character.charCodeAt(0) > 64 && character.charCodeAt(0) < 91)
                return character.toLowerCase();
            else if (character.charCodeAt(0) > 96 && character.charCodeAt(0) < 123)
                return character.toUpperCase();
            else
                return character;
        } catch (error) {
            throw new OperationError("Error, something went wrong");
        }
    }

}

export default InvertingCharactersCase;
