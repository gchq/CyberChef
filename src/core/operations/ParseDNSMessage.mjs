/**
 * @author Minghang Chen [chen@minghang.dev]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { Message } from "@dnspect/dns-ts";

/**
 * Parse DNS Message operation
 */
class ParseDNSMessage extends Operation {
    /**
     * ParseDNSMessage constructor
     */
    constructor() {
        super();

        this.name = "Parse DNS Message";
        this.module = "Default";
        this.description = "Parse the DNS wireformat binary of a DNS message and return a text representation";
        this.infoURL = "https://en.wikipedia.org/wiki/Domain_Name_System#DNS_message_format";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [{
            "name": "Output format",
            "type": "option",
            "value": ["dig-like", "dns-json"]
        }];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const format = args[0];
        let msg;
        try {
            msg = Message.unpack(input);
        } catch (e) {
            throw new OperationError(`Malformed DNS message: ${e}`);
        }

        switch (format) {
            case "dig-like": return msg.toString();
            case "dns-json": return JSON.stringify(msg.toJsonObject(), null, 2);
            default: throw new OperationError(`Unsupported output format: ${format}`);
        }
    }
}

export default ParseDNSMessage;
