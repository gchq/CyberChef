/**
 * @author Danh4 [dan.h4@ncsc.gov.uk]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { encode } from "cbor2";
import { sortCoreDeterministic } from "cbor2/sorts";

/**
 * CBOR Encode operation
 */
class CBOREncode extends Operation {

    /**
     * CBOREncode constructor
     */
    constructor() {
        super();

        this.name = "CBOR Encode";
        this.module = "Serialise";
        this.description = "Concise Binary Object Representation (CBOR) is a binary data serialization format loosely based on JSON. Like JSON it allows the transmission of data objects that contain name–value pairs, but in a more concise manner. This increases processing and transfer speeds at the cost of human readability. It is defined in IETF RFC 8949.";
        this.infoURL = "https://wikipedia.org/wiki/CBOR";
        this.inputType = "JSON";
        this.outputType = "ArrayBuffer";
        this.args = [];
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        return new Uint8Array(encode(input, {sortKeys: sortCoreDeterministic})).buffer;
    }

}

export default CBOREncode;
