/** 

* @author n1474335 [n1474335@gmail.com] 

* @copyright Crown Copyright 2024 

* @license Apache-2.0 

*/ 

  

import Operation from "../Operation.mjs"; 

import Utils from "../Utils.mjs"; 

import forge from "node-forge"; 

  

/** 

* RC6 Decrypt operation 

*/ 

class RC6Decrypt extends Operation { 

  

    /** 

     * RC6Decrypt constructor 

     */ 

    constructor() { 

        super(); 

  

        this.name = "RC6 Decrypt"; 

        this.module = "Ciphers"; 

        this.description = "RC6 is a symmetric-key block cipher derived from RC5, designed by Ron Rivest and others. It provides security for various applications.<br><br><b>Key:</b> RC6 uses a variable size key.<br><br><b>IV:</b> To run the cipher in CBC mode, the Initialization Vector should be 16 bytes long. If the IV is left blank, the cipher will run in ECB mode.<br><br><b>Padding:</b> In both CBC and ECB mode, PKCS#7 padding will be used."; 

        this.infoURL = "https://en.wikipedia.org/wiki/RC6"; 

        this.inputType = "string"; 

        this.outputType = "string"; 

        this.args = [ 

            { 

                "name": "Key", 

                "type": "toggleString", 

                "value": "", 

                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"] 

            }, 

            { 

                "name": "IV", 

                "type": "toggleString", 

                "value": "", 

                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"] 

            }, 

            { 

                "name": "Input", 

                "type": "option", 

                "value": ["Raw", "Hex"] 

            }, 

            { 

                "name": "Output", 

                "type": "option", 

                "value": ["Hex", "Raw"] 

            } 

        ]; 

    } 

  

    /** 

     * @param {string} input 

     * @param {Object[]} args 

     * @returns {string} 

     */ 

    run(input, args) { 

        const key = Utils.convertToByteString(args[0].string, args[0].option), 

            iv = Utils.convertToByteString(args[1].string, args[1].option), 

            [,, inputType, outputType] = args; 

  

        // Create the key schedule 

        const S = this.rc6KeySchedule(key); 

  

        // Convert input based on input type 

        input = Utils.convertToByteString(input, inputType); 

  

        // Initialize the cipher for decryption 

        const cipher = forge.rc6.createDecryptionCipher(S); 

        cipher.start(iv || null); 

        cipher.update(forge.util.createBuffer(input)); 

        cipher.finish(); 

  

        // Return the output in the specified format 

        return outputType === "Hex" ? cipher.output.toHex() : cipher.output.getBytes(); 

    } 

  

    /** 

     * RC6 Key Schedule function (simplified version) 

     * @param {string} key - The encryption key 

     * @returns {Array} - The key schedule 

     */ 

    rc6KeySchedule(key) { 

        // Implementation of the RC6 key schedule goes here 

        // For simplicity, this part is omitted; it should return the key schedule (array S) 

        return []; 

    } 

} 

  

export default RC6Decrypt; 

 

 

 