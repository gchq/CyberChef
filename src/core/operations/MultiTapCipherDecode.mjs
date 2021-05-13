/**
 * @author Necron3574 [kaustubhbm3574@gmail.com]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Utils from "../Utils.mjs";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Multi Tap Cipher Decode operation
 */
class MultiTapCipherDecode extends Operation {

    /**
     * MultiTapCipherDecode constructor
     */
    constructor() {
        super();

        this.name = "Multi Tap Cipher Decode";
        this.module = "Default";
        this.description = "It is a simple substitution cipher which substitutes the alphabets to their corresponding taps on a mobile phone.<br><br>e.g. <code>adg</code> becomes <code>2-3-4</code>";
        this.infoURL = "https://wikipedia.org/wiki/Multi-tap";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Delimiter",
                type: "option",
                value: ["Hyphen","Space", "Comma", "Semi-colon", "Colon", "Line feed"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if(input.length == 0)
          return "";
        const delim = Utils.charRep(args[0] || "Hyphen");
        var emap = {"2":"A","22":"B","222":"C","3":"D","33":"E","333":"F","4":"G","44":"H","444":"I","5":"J","55":"K","555":"L","6":"M","66":"N","666":"O","7":"P","77":"Q","777":"R","7777":"S","8":"T","88":"U","888":"V","9":"W","99":"X","999":"Y","9999":"Z"," ":" "}
        var enc_list = input.split(delim);
        var plaintext = "";
        for(let i=0;i<enc_list.length;i++){
            if(emap[enc_list[i]] == undefined)
                throw new OperationError("Invalid Input\nThe numbers must range from 2-9 and must be separated by the delimiter chosen");
            plaintext += emap[enc_list[i]];
        }
        return plaintext;
    }
}

export default MultiTapCipherDecode;
