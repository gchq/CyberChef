/**
 * @author ThePlayer372-FR []
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { fromBase64 } from "../lib/Base64.mjs"

/**
 * Flask Session Decode operation
 */
class FlaskSessionDecode extends Operation {
    /**
     * FlaskSessionDecode constructor
    */
    constructor() {
        super();

        this.name = "Flask Session Decode"; 
        this.module = "Crypto";
        this.description = "Decodes the payload of a Flask session cookie (itsdangerous) into JSON.";        
        this.inputType = "string";
        this.outputType = "JSON";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {Object[]}
     */
    run(input, args) {
        input = input.trim();
        const parts = input.split(".");
        if (parts.length !== 3) {
            throw new OperationError("Invalid Flask token format. Expected payload.timestamp.signature");        
        }

        const payloadB64 = parts[0];

        const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
        let payloadJson;
        try {
            payloadJson = fromBase64(padded);
        } catch (e) {
            throw new OperationError("Invalid Base64 payload");
        }

        try {
            const data = JSON.parse(payloadJson);
            return data;
        } catch (e) {
            throw new OperationError("Unable to decode JSON payload: " + e.message);
        }
    }
}

export default FlaskSessionDecode;
