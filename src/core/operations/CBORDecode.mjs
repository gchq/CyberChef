/**
 * @author Danh4 [dan.h4@ncsc.gov.uk]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Cbor from "cbor";

/**
 * CBOR Decode operation
 */
class CBORDecode extends Operation {
    /**
     * CBORDecode constructor
     */
    constructor() {
        super();

        this.name = "CBOR Decode";
        this.module = "Serialise";
        this.description =
            "Concise Binary Object Representation (CBOR) is a binary data serialization format loosely based on JSON. Like JSON it allows the transmission of data objects that contain name–value pairs, but in a more concise manner. This increases processing and transfer speeds at the cost of human readability. It is defined in IETF RFC 8949.";
        this.infoURL = "https://wikipedia.org/wiki/CBOR";
        this.inputType = "ArrayBuffer";
        this.outputType = "JSON";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    run(input, args) {
        return Cbor.decodeFirstSync(Buffer.from(input).toString("hex"));
    }
}

export default CBORDecode;
