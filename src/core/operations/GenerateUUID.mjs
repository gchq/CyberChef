/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import * as uuid from "uuid";
import OperationError from "../errors/OperationError.mjs";
/**
 * Generate UUID operation
 */
class GenerateUUID extends Operation {

    /**
     * GenerateUUID constructor
     */
    constructor() {
        super();

        this.name = "Generate UUID";
        this.module = "Crypto";
        this.description = "Generates an RFC 9562 (formerly RFC 4122) compliant Universally Unique Identifier (UUID), also known as a Globally Unique Identifier (GUID).<br><br>A version 4 UUID relies on random numbers, in this case generated using <code>uuid</code> package";
        this.infoURL = "https://wikipedia.org/wiki/Universally_unique_identifier";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "UUID Version",
                type: "option",
                value: [
                    "v1", "v3", "v4", "v5", "v6", "v7",
                ]
            },
            {
                name: "UUID namespace (valid for v3 and v5)",
                type: "string",
                value: "1b671a64-40d5-491e-99b0-da01ff1f3341"
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [version, namespace] = args;
        const hasDesiredVersion = typeof uuid[version] === "function";
        if (!hasDesiredVersion) throw new OperationError("Invalid UUID version");

        const versionThatRequiresNamespace = ["v3", "v5"];

        const requiresNamespace = versionThatRequiresNamespace.includes(version);
        if (!requiresNamespace) return uuid[version]();

        const hasValidNamespace = typeof namespace === "string" && uuid.validate(namespace);
        if (!hasValidNamespace) throw new OperationError("Invalid UUID namespace");

        return uuid[version](input, namespace);
    }

}

export default GenerateUUID;
