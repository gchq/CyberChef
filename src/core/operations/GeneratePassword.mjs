/**
 * @author 0xff1ce [github.com/0xff1ce]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Generate Password operation
 */
class GeneratePassword extends Operation {

    /**
     * GenPassword constructor
     */
    constructor() {
        super();

        this.name = "Generate Password";
        this.module = "Default";
        this.description = "Generate a random password based on specified length, and optional inclusion of symbols and numbers.<br><br>This tool is intended to create random passwords for various use cases; however, it does not guarantee absolute security or protection against advanced attacks.<br><br>Users are advised to combine this tool with best practices in password management, including the use of password managers, and to follow security guidelines to ensure the strength and safety of their passwords.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Length",
                "type": "number",
                "value": "24",
            },
            {
                "name": "Symbols",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Numbers",
                "type": "boolean",
                "value": false
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const len = args[0];
        const symbols = args[1];
        const numbers = args[2];
    
        const baseAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowerAlphabet = baseAlphabet.toLowerCase();
        const symbolSet = "!@#$%^&*()-=_+|'\"";
        const numberSet = "123456789";
    
        let alphabet = baseAlphabet + lowerAlphabet;
        alphabet += symbols ? symbolSet : "";
        alphabet += numbers ? numberSet : "";
    
        const resultArray = new Array(len);
        for (let i = 0; i < len; i++) {
            resultArray[i] = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        }
    
        return resultArray.join('');
    }

}

export default GeneratePassword;
