/** 

* @author  

* @copyright  

* @license Apache-2.0 

*/ 

  

import Operation from "../Operation.mjs"; 

import Utils from "../Utils.mjs"; 

import forge from "node-forge"; 

  

/** 

* RC6 Encrypt operation 

*/ 

class RC6Encrypt extends Operation { 

  

    /** 

     * RC6Encrypt constructor 

     */ 

    constructor() { 

        super(); 

  

        this.name = "RC6 Encrypt"; 

        this.module = "Ciphers"; 

        this.description = "RC6 is a symmetric key block cipher derived from RC5. It was designed for high performance and security.<br><br><b>Key:</b> RC6 uses variable-length keys typically 128, 192, or 256 bits.<br><br><b>IV:</b> To run the cipher in CBC mode, the Initialization Vector should be 16 bytes long. If the IV is left blank, the cipher will run in ECB mode.<br><br><b>Padding:</b> In both CBC and ECB mode, PKCS#7 padding will be used."; 

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

  

        input = Utils.convertToByteString(input, inputType); 

  

        // RC6 encryption implementation (you will need to manually implement RC6 or use a library) 

        const cipher = new RC6Cipher(key);  // Replace with RC6 implementation 

  

        cipher.start(iv || null);  // Use IV for CBC mode or null for ECB mode 

        cipher.update(forge.util.createBuffer(input));  // Encrypt the input 

        cipher.finish();  // Complete encryption process 

  

        return outputType === "Hex" ? cipher.output.toHex() : cipher.output.getBytes();  // Return encrypted output in desired format 

    } 

} 

  

// Example RC6 cipher class (you will need to provide actual RC6 implementation) 

class RC6Cipher { 

    constructor(key) { 

        this.key = key; 

        // Initialize key schedule and other RC6 parameters 

    } 

  

    start(iv) { 

        // Initialize IV and prepare for encryption 

    } 

  

    update(buffer) { 

        // Perform RC6 encryption on the buffer 

    } 

  

    finish() { 

        // Finalize encryption 

    } 

  

    get output() { 

        // Return the encrypted data 

        return { 

            toHex: () => { /* return encrypted data in hex */ }, 

            getBytes: () => { /* return encrypted data as bytes */ } 

        }; 

    } 

} 

  

export default RC6Encrypt; 