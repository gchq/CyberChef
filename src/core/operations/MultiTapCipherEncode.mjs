/**
 * @author Necron3574 [kaustubhbm3574@gmail.com]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import { getMultiTapMap } from "../lib/Ciphers.mjs";
import OperationError from "../errors/OperationError.mjs";
/**
 * Multi Tap Cipher Encode operation
 */
class MultiTapCipherEncode extends Operation {

    /**
     * MultiTapCipherEncode constructor
     */
    constructor() {
        super();

        this.name = "Multi Tap Cipher Encode";
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
            },
            {
              name : "Representation of Space",
              type: "option",
              value: ["Hash","Period","Percent","Ampersand"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
      const delim = Utils.charRep(args[0] || "Hyphen");
      const space_delim = Utils.charRep(args[1] || "Hash");
      var emap = getMultiTapMap(1,space_delim);
      var plaintext = input.toUpperCase();
      var ciphertext = "";
      for(let i=0;i<plaintext.length;++i){
          if(emap[plaintext.charAt(i)] == undefined)
            throw new OperationError("The input must be only alphabets");
          ciphertext += emap[plaintext.charAt(i)];
          if(i!=plaintext.length-1)
              ciphertext += delim;
      }
      return ciphertext;
    }
}

export default MultiTapCipherEncode;
