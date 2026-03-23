/**
 * @author ThePlayer372-FR []
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import { toBase64 } from "../lib/Base64.mjs";
import OperationError from "../errors/OperationError.mjs";
import { getHashFunction } from "../lib/Hash.mjs";
import { hmac } from "@noble/hashes/hmac";

/**
 * Flask Session Sign operation
 */
class FlaskSessionSign extends Operation {
    /**
     * FlaskSessionSign constructor
    */
    constructor() {
        super();

        this.name = "Flask Session Sign";
        this.module = "Crypto";
        this.description = "Signs a JSON payload to produce a Flask session cookie (itsdangerous HMAC).";
        this.inputType = "JSON";
        this.outputType = "string";
        this.args = [
            {
                name: "Key",
                type: "toggleString",
                value: "",
                toggleValues: ["Hex", "Decimal", "Binary", "Base64", "UTF8", "Latin1"]
            },
            {
                name: "Salt",
                type: "toggleString",
                value: "cookie-session",
                toggleValues: ["UTF8", "Hex", "Decimal", "Binary", "Base64", "Latin1"]
            },
            {
                name: "Algorithm",
                type: "option",
                value: ["sha1", "sha256"],
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (!args[0].string) {
            throw new OperationError("Secret key required");
        }
        const key = Utils.convertToByteString(args[0].string, args[0].option);
        const salt = Utils.convertToByteString(args[1].string || "cookie-session", args[1].option);
        const algorithm = args[2] || "sha1";
        const hashFn = getHashFunction(algorithm);

        const payloadB64 = toBase64(Utils.strToByteArray(JSON.stringify(input)));
        const payload = payloadB64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

        // Derive key: HMAC(secret, salt)
        const keyBytes = new Uint8Array(Utils.strToArrayBuffer(key));
        const saltBytes = new Uint8Array(Utils.strToArrayBuffer(salt));
        const derivedKeyBytes = hmac(hashFn, keyBytes, saltBytes);

        const currentTimeStamp = Math.ceil(Date.now() / 1000);
        const buffer = new ArrayBuffer(4);
        const view = new DataView(buffer);
        view.setInt32(0, currentTimeStamp, false);
        const bytes = new Uint8Array(buffer);
        let binary = "";
        bytes.forEach(b => binary += String.fromCharCode(b));
        const timeB64 = toBase64(Utils.strToByteArray(binary));
        const time = timeB64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

        const data = Utils.convertToByteString(payload + "." + time, "utf8");
        const dataBytes = new Uint8Array(Utils.strToArrayBuffer(data));

        // Sign: HMAC(derivedKey, data)
        const signBytes = hmac(hashFn, derivedKeyBytes, dataBytes);

        // Convert Uint8Array back to byte string for toBase64
        let signStr = "";
        signBytes.forEach(b => signStr += String.fromCharCode(b));
        const signB64 = toBase64(Utils.strToByteArray(signStr));
        const sign64 = signB64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

        return payload + "." + time + "." + sign64;
    }
}


export default FlaskSessionSign;
