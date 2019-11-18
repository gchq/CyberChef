/**
 * @author masq [github.cyberchef@masq.cc]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * To Case Insensitive Regex operation
 */
class ToCaseInsensitiveRegex extends Operation {

    /**
     * ToCaseInsensitiveRegex constructor
     */
    constructor() {
        super();

        this.name = "To Case Insensitive Regex";
        this.module = "Default";
        this.description = "Converts a case-sensitive regex string into a case-insensitive regex string in case the i flag is unavailable to you.<br><br>e.g. <code>Mozilla/[0-9].[0-9] .*</code> becomes <code>[mM][oO][zZ][iI][lL][lL][aA]/[0-9].[0-9] .*</code>";
        this.infoURL = "https://wikipedia.org/wiki/Regular_expression";
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
        /**
         * Simulates look behind behaviour since javascript doesn't support it.
         *
         * @param {string} input
         * @returns {string}
         */
        function preProcess(input) {
            let result = "";
            for (let i = 0; i < input.length; i++) {
                const temp = input.charAt(i);
                if (temp.match(/[a-zA-Z]/g) && (input.charAt(i-1) !== "-") && (input.charAt(i+1) !== "-"))
                    result += "[" + temp.toLowerCase() + temp.toUpperCase() + "]";
                else
                    result += temp;
            }
            return result;
        }

        input = preProcess(input);

        // Example: [a-z] -> [a-zA-Z]
        input = input.replace(/[a-z]-[a-z]/g, m => `${m}${m[0].toUpperCase()}-${m[2].toUpperCase()}`);
        
        // Example: [a-z] -> [a-zA-Z]
        input = input.replace(/[A-Z]-[A-Z]/g, m => `${m}${m[0].toLowerCase()}-${m[2].toLowerCase()}`);
        
        // Example: [H-d] -> [A-DH-dh-z]
        input = input.replace(/[A-Z]-[a-z]/g, m => `A-${m[2].toUpperCase()}${m}${m[0].toLowerCase()}-z`);
        
        // Example: [!-D] -> [!-Da-d]
        input = input.replace(/[ -@]-[A-Z]/g, m => `${m}a-${m[2].toLowerCase()}`);
        
        // Example: [%-^] -> [%-^a-z]
        input = input.replace(/[ -@]-[[-`]/g, m => `${m}a-z`);
        
        // Example: [K-`] -> [K-`k-z]
        input = input.replace(/[A-Z]-[[-`]/g, m => `${m}${m[0].toLowerCase()}-z`);
        
        // Example: [[-}] -> [[-}A-Z]
        input = input.replace(/[[-`]-[{-~]/g, m => `${m}A-Z`);
        
        // Example: [b-}] -> [b-}B-Z]
        input = input.replace(/[a-z]-[{-~]/g, m => `${m}${m[0].toUpperCase()}-Z`);
        
        // Example: [<-j] -> [<-z]
        input = input.replace(/[ -@]-[a-z]/g, m => `${m[0]}-z`);
        
        // Example: [^-j] -> [A-J^-j]
        input = input.replace(/[[-`]-[a-z]/g, m => `A-${m[2].toUpperCase()}${m}`);
        return input;
    }
}

export default ToCaseInsensitiveRegex;
