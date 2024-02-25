/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import bson from "bson";
import OperationError from "../errors/OperationError.mjs";

/**
 * BSON deserialise operation
 */
class BSONDeserialise extends Operation {
    /**
     * BSONDeserialise constructor
     */
    constructor() {
        super();

        this.name = "BSON deserialise";
        this.module = "Serialise";
        this.description =
            "BSON is a computer data interchange format used mainly as a data storage and network transfer format in the MongoDB database. It is a binary form for representing simple data structures, associative arrays (called objects or documents in MongoDB), and various data types of specific interest to MongoDB. The name 'BSON' is based on the term JSON and stands for 'Binary JSON'.<br><br>Input data should be in a raw bytes format.";
        this.infoURL = "https://wikipedia.org/wiki/BSON";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (!input.byteLength) return "";

        try {
            const data = bson.deserialize(new Buffer(input));
            return JSON.stringify(data, null, 2);
        } catch (err) {
            throw new OperationError(err.toString());
        }
    }
}

export default BSONDeserialise;
