/**
 * @author gchq77703 []
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import jwt from "jsonwebtoken";
import OperationError from "../errors/OperationError.mjs";

/**
 * JWT Decode operation
 */
class JWTDecode extends Operation {

    /**
     * JWTDecode constructor
     */
    constructor() {
        super();

        this.name = "JWT Decode";
        this.module = "Crypto";
        this.description = "Decodes a JSON Web Token <b>without</b> checking whether the provided secret / private key is valid. Use 'JWT Verify' to check if the signature is valid as well.";
        this.infoURL = "https://wikipedia.org/wiki/JSON_Web_Token";
        this.inputType = "string";
        this.outputType = "JSON";
        this.args = [
            {
                name: "Include header",
                type: "boolean",
                value: false
            }
        ];
        this.checks = [
            {
                pattern: "^ey([A-Za-z0-9_-]+)\\.ey([A-Za-z0-9_-]+)\\.([A-Za-z0-9_-]+)$",
                flags: "",
                args: []
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    run(input, args) {
        try {
            const headerInclude = args[0];

            const decoded = jwt.decode(input, {
                json: true,
                complete: true
            });
            if (headerInclude) {
                return {header: decoded.header, payload: decoded.payload};
            } else {
                return decoded.payload;
            }
        } catch (err) {
            throw new OperationError(err);
        }
    }

}

export default JWTDecode;
