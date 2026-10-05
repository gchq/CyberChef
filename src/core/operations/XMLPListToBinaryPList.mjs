/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import xmldom from "@xmldom/xmldom";
import { buildBinary, parse } from "plist";

if (typeof globalThis.DOMParser === "undefined") {
    globalThis.DOMParser = xmldom.DOMParser;
}

/**
 * XML P-list to Binary P-list operation
 */
class XMLPListToBinaryPList extends Operation {

    /**
     * XMLPListToBinaryPList constructor
     */
    constructor() {
        super();

        this.name = "XML P-list to Binary P-list";
        this.module = "Default";
        this.description = "Converts an XML p-list into a binary p-list.<br><br>A dictionary with a single key <code>UID</code> is written as a binary UID object.";
        this.infoURL = "https://wikipedia.org/wiki/Property_list";
        this.inputType = "string";
        this.outputType = "ArrayBuffer";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        try {
            const bytes = buildBinary(parse(input));
            return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new OperationError(message);
        }
    }

}

export default XMLPListToBinaryPList;
