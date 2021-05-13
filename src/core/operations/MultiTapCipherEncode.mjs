/**
 * @author Necron3574 [kaustubhbm3574@gmail.com]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
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
      var emap = {"A" :"2","B":"22","C":"222","D":"3","E":"33","F":"333","G":"4","H":"44","I":"444","J":"5","K":"55","L":"555","M":"6","N":"66","O":"666","P":"7","Q":"77","R":"777","S":"7777","T":"8","U":"88","V":"888","W":"9","X":"99","Y":"999","Z":"9999"," ":" "};
      input = input.toUpperCase();
      var plaintext = "";
      for(let i= 0;i<input.length;i++){
          if(input.charAt(i) != ' ')
              plaintext += input.charAt(i);
      }
      var ciphertext = "";
      for(let i=0;i<plaintext.length;++i){
          if(emap[plaintext.charAt(i)] == undefined)
            throw new OperationError("The input must be only alphabets");
          ciphertext += emap[plaintext.charAt(i)];
          if(i!=plaintext.length)
              ciphertext += delim;
      }
      return ciphertext.substring(0,ciphertext.length-1);
    }
}

export default MultiTapCipherEncode;
