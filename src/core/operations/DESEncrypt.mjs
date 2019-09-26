/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";
import forge from "node-forge/dist/forge.min.js";

/**
 * DES Encrypt operation
 */
class DESEncrypt extends Operation {

    /**
     * DESEncrypt constructor
     */
    constructor() {
        super();

        this.name = "DES Encrypt";
        this.module = "Ciphers";
        this.description = "DES is a previously dominant algorithm for encryption, and was published as an official U.S. Federal Information Processing Standard (FIPS). It is now considered to be insecure due to its small key size.<br><br><b>Key:</b> DES uses a key length of 8 bytes (64 bits).<br>Triple DES uses a key length of 24 bytes (192 bits).<br><br>You can generate a password-based key using one of the KDF operations.<br><br><b>IV:</b> The Initialization Vector should be 8 bytes long. If not entered, it will default to 8 null bytes.<br><br><b>Padding:</b> In CBC and ECB mode, PKCS#7 padding will be used.";
        this.infoURL = "https://wikipedia.org/wiki/Data_Encryption_Standard";
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
                "name": "Mode",
                "type": "option",
                "value": ["CBC", "CFB", "OFB", "CTR", "ECB"]
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
            [,, mode, inputType, outputType] = args;
        var iv = Utils.convertToByteArray(args[1].string, args[1].option)

        if (key.length !== 8) {
            throw new OperationError(`Invalid key length: ${key.length} bytes

DES uses a key length of 8 bytes (64 bits).
Triple DES uses a key length of 24 bytes (192 bits).`);
        }

        input = Utils.convertToByteString(input, inputType);

        const cipher = forge.cipher.createCipher("DES-" + mode, key);

        if (mode === "CTR"){
            // Temp workaround until https://github.com/digitalbazaar/forge/issues/721 is fixed
            const blockSize = cipher.mode.blockSize
            var blockOutputs = forge.util.createBuffer();
            var numBlocks = input.length % blockSize === 0 ? input.length >> 3 : (input.length >> 3) + 1
            if (iv.length < blockSize) {
                var ivLen = iv.length
                for (var i=0; i < blockSize - ivLen; i++){
                    iv.unshift(0)
                }
            }
            for (var i=0; i < numBlocks; i++) {
                cipher.start({iv: iv})
                cipher.update(forge.util.createBuffer().fillWithByte(0,blockSize))
                blockOutputs.putBuffer(cipher.output)
                iv[iv.length-1] = (iv[iv.length-1] + 1) & 0xFFFFFFFF
            }

            var output = forge.util.createBuffer()
            for (var i=0; i < input.length; i++) {
                output.putByte(input.charCodeAt(i)^blockOutputs.getByte())
            }
            cipher.output=output
        } else {
            cipher.start({iv: iv});
            cipher.update(forge.util.createBuffer(input));
            cipher.finish();
        }

        return outputType === "Hex" ? cipher.output.toHex() : cipher.output.getBytes();
    }

}

export default DESEncrypt;
