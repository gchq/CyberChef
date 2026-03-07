/**
 * Decrypts ETH keystore files, given the password.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import JSSHA3 from "js-sha3";
import Utils from "../Utils.mjs";
import {fromHex} from "../lib/Hex.mjs";
import scryptsy from "scryptsy";
import { isWorkerEnvironment } from "../Utils.mjs";
import forge from "node-forge";


/**
 * JPath expression operation
*/
class DecryptKeystoreFile extends Operation {

    /**
     * Decrypt Keystore constructor
     */
    constructor() {
        super();

        this.name = "Decrypt Keystore File";
        this.module = "Crypto";
        this.description = "Attempts to decrypt the given ETH keystore file, with the passed in password. Will return the private key if successful, error out if not.";
        this.inputType = "string";
        this.outputType = "string";
        this.infoURL = "https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition";
        this.args = [
            {
                name: "password",
                type: "string",
                value: ""
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const password = args[0];
        let jsonObj, dkey;
        // We parse the JSON object first and throw an error if its not JSON.
        try {
            jsonObj = JSON.parse(input);
        } catch (err) {
            throw new OperationError(`Invalid input, not JSON. Data: ${err.message}`);
        }

        // We then check for a crypto property, and that crypto should have a kdf and kdfparams property.
        if (!Object.prototype.hasOwnProperty.call(jsonObj, "crypto") || !Object.prototype.hasOwnProperty.call(jsonObj.crypto, "kdfparams") || !Object.prototype.hasOwnProperty.call(jsonObj.crypto, "kdf")) {
            throw new OperationError(`Error. Invalid JSON blob, missing either a crypto, crypto.kdf or crypto.kdfparams object.`);
        }
        const kdfParams = jsonObj.crypto.kdfparams;
        const kdfType = jsonObj.crypto.kdf;

        // We compute the kdf.
        if (kdfType === "scrypt") {
            try {
                // We compute the salt, and the compute the scrypt.
                const salt = Buffer.from(Utils.convertToByteArray(kdfParams.salt, "hex"));
                const data = scryptsy(password, salt, kdfParams.n,  kdfParams.r, kdfParams.p, kdfParams.dklen,
                    p =>{
                        if (isWorkerEnvironment()) self.sendStatusMessage(`Progress: ${p.percent.toFixed(0)}%`);
                    });
                // Result of the SCRYPT in hex.
                dkey = data.toString("hex");
            } catch (err) {
                throw new OperationError("Error: " + err.toString());
            }
        } else if (kdfType === "pbkdf2") {
            // If the kdf is PBKDF2, we check to make sure it has a prf property, and that property is hmac-sha256
            if (!Object.prototype.hasOwnProperty.call(kdfParams, "prf") || kdfParams.prf !== "hmac-sha256") {
                throw new OperationError(`Error with PBKDF2. Either HMAC function not present, or is not hmac-sha256. It is: ` + JSON.stringify(kdfParams));
            }
            // We compute the pbkdf2 and cast to hex.
            const iterations = kdfParams.c;
            const keyLength = kdfParams.dklen;
            const salt = Utils.convertToByteString(kdfParams.salt, "hex");
            dkey = forge.util.bytesToHex(forge.pkcs5.pbkdf2(password, salt, iterations, keyLength, "sha256"));

        } else {
            // If there's a different KDF, we err out.
            throw new OperationError("We don't support KDF type " + kdfType + " ... yet.");
        }

        const mackey = dkey.slice(-32,);
        const decryptionkey = dkey.slice(0, 32);
        const ciphertext = jsonObj.crypto.ciphertext;
        const hmac = jsonObj.crypto.mac;
        const algo = JSSHA3.keccak256;

        const testmac = algo(fromHex(mackey + ciphertext, "hex"));
        if (testmac === hmac) {
            // If the MAC passes, we can decrypt.
            // We check for the right data to decrypt.
            if (!Object.prototype.hasOwnProperty.call(jsonObj.crypto, "cipherparams") || !Object.prototype.hasOwnProperty.call(jsonObj.crypto.cipherparams, "iv")) {
                throw new OperationError("We are missing needed cipherparams and IV.");
            }
            if (!Object.prototype.hasOwnProperty.call(jsonObj.crypto, "ciphertext") || !Object.prototype.hasOwnProperty.call(jsonObj.crypto.cipherparams, "iv")) {
                throw new OperationError("We are the ciphertext");
            }
            // We grab the key, and IV, and ciphertext
            const key = Utils.convertToByteString(decryptionkey, "hex");
            const iv = Utils.convertToByteString(jsonObj.crypto.cipherparams.iv, "hex");
            const cipherinput =  Utils.convertToByteString(jsonObj.crypto.ciphertext, "hex");
            // We  create the decryptor.
            const decipher = forge.cipher.createDecipher("AES-CTR", key);
            // We do the decryption.
            decipher.start({
                iv: iv.length === 0 ? "" : iv,
                tag:  undefined,
                additionalData: undefined
            });
            decipher.update(forge.util.createBuffer(cipherinput));
            const result = decipher.finish();
            if (result) {
                return decipher.output.toHex();
            } else {
                throw new OperationError("Unable to decrypt keystore with these parameters.");
            }
        } else {
            // In this case the MAC failed so we error out.
            throw new OperationError("MAC error. We got: " + testmac + " , but we wanted. " + hmac);
        }
    }

}

export default DecryptKeystoreFile;
