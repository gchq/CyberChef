/**
 * @author ThePlayer372-FR []
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import CryptoApi from "crypto-api/src/crypto-api.mjs";
import Utils from "../Utils.mjs";
import { toBase64, fromBase64 } from "../lib/Base64.mjs";

/**
 * Flask Session Verify operation
 */
class FlaskSessionVerify extends Operation {
    /**
     * FlaskSessionVerify constructor
    */
    constructor() {
        super();

        this.name = "Flask Session Verify";
        this.module = "Crypto";
        this.description = "Verifies the HMAC signature of a Flask session cookie (itsdangerous) generated.";
        this.inputType = "string";
        this.outputType = "JSON";
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
            },
            {
                name: "View TimeStamp",
                type: "boolean",
                value: true
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

        input = input.trim();

        const parts = input.split(".");

        if (parts.length !== 3) {
            throw new OperationError("Invalid Flask token format. Expected payload.timestamp.signature");
        }

        const data = Utils.convertToByteString(parts[0] + "." + parts[1], "utf8");


        const derivedKey = CryptoApi.getHmac(key, CryptoApi.getHasher(algorithm));
        derivedKey.update(salt);

        const sign = CryptoApi.getHmac(derivedKey.finalize(), CryptoApi.getHasher(algorithm));
        sign.update(data);

        const payloadB64 = parts[0];
        const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

        const time = parts[1];

        const timeB64 = time.replace(/-/g, "+").replace(/_/g, "/");
        const binary = fromBase64(timeB64);
        const bytes = new Uint8Array(4);
        for (let i = 0; i < 4; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const view = new DataView(bytes.buffer);
        const timestamp = view.getInt32(0, false);

        let payloadJson;
        try {
            payloadJson = fromBase64(padded);
        } catch (e) {
            throw new OperationError("Invalid Base64 payload");
        }

        const signB64 = toBase64(sign.finalize());
        const sign64 = signB64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

        if (sign64 !== parts[2]) {
            throw new OperationError("Invalid signature!");
        }

        try {
            const decoded = JSON.parse(payloadJson);
            if (!args[3]) {
                return {
                    valid: true,
                    payload: decoded,
                };
            } else {
                return {
                    valid: true,
                    payload: decoded,
                    timestamp: timestamp
                };
            }
        } catch (e) {
            throw new OperationError("Unable to decode JSON payload: " + e.message);
        }

    }
}


export default FlaskSessionVerify;
