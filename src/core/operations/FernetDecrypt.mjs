/**
 * @author Karsten Silkenbäumer [github.com/kassi]
 * @copyright Karsten Silkenbäumer 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import fernet from "fernet";

/**
 * FernetDecrypt operation
 */
class FernetDecrypt extends Operation {
    /**
     * FernetDecrypt constructor
     */
    constructor() {
        super();

        this.name = "Fernet Decrypt";
        this.module = "Default";
        this.description
            = "Fernet is a symmetric encryption method which makes sure that the message encrypted cannot be manipulated/read without the key. It uses URL safe encoding for the keys. Fernet uses 128-bit AES in CBC mode and PKCS7 padding, with HMAC using SHA256 for authentication. The IV is created from os.random().<br><br><b>Key:</b> The key must be 32 bytes (256 bits) encoded with Base64.";
        this.infoURL = "https://asecuritysite.com/encryption/fer";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Key",
                "type": "string",
                "value": ""
            }
        ];
        this.patterns = [
            {
                match: "^[A-Z\\d\\-_=]{20,}$",
                flags: "i",
                args: []
            }
        ];
    }
    /**
     * @param {String} input
     * @param {Object[]} args
     * @returns {String}
     */
    run(input, args) {
        const [secretInput] = args;
        try {
            const secret = new fernet.Secret(secretInput);
            const token = new fernet.Token({
                secret: secret,
                token: input,
                ttl: 0
            });
            return token.decode();
        } catch (err) {
            throw new OperationError(err);
        }
    }
}

export default FernetDecrypt;
