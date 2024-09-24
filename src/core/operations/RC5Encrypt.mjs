 

/** 

* @author  

* @license Apache-2.0 

*/ 

  

import Operation from "../Operation.mjs"; 

import Utils from "../Utils.mjs"; 

import forge from "node-forge"; 

  

/** 

* RC5 Encrypt operation 

*/ 

class RC5Encrypt extends Operation { 

  

    /** 

     * RC5Encrypt constructor 

     */ 

    constructor() { 

        super(); 

  

        this.name = "RC5 Encrypt"; 

        this.module = "Ciphers"; 

        this.description = "RC5 is a symmetric-key block cipher designed by Ron Rivest in 1994. 'RC' stands for 'Rivest Cipher'.<br><br><b>Key:</b> RC5 uses a variable size key.<br><br>You can generate a password-based key using one of the KDF operations.<br><br><b>IV:</b> To run the cipher in CBC mode, the Initialization Vector should be 8 bytes long. If the IV is left blank, the cipher will run in ECB mode.<br><br><b>Padding:</b> In both CBC and ECB mode, PKCS#7 padding will be used."; 

        this.infoURL = "https://en.wikipedia.org/wiki/RC5"; 

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

            [,, inputType, outputType] = args, 

            cipher = forge.rc5.createEncryptionCipher(key, 12);  // Default 12 rounds 

  

        input = Utils.convertToByteString(input, inputType); 

  

        cipher.start(iv || null); 

        cipher.update(forge.util.createBuffer(input)); 

        cipher.finish(); 

  

        return outputType === "Hex" ? cipher.output.toHex() : cipher.output.getBytes(); 

    } 

  

} 

  

export default RC5Encrypt; 