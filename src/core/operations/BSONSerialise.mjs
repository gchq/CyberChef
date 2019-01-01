/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import bson from "bson";
import OperationError from "../errors/OperationError";

/**
 * BSON serialise operation
 */
class BSONSerialise extends Operation {

    /**
     * BSONSerialise constructor
     */
    constructor() {
        super();

        this.name = "BSON serialise";
        this.module = "BSON";
        this.description = "BSON is a computer data interchange format used mainly as a data storage and network transfer format in the MongoDB database. It is a binary form for representing simple data structures, associative arrays (called objects or documents in MongoDB), and various data types of specific interest to MongoDB. The name 'BSON' is based on the term JSON and stands for 'Binary JSON'.<br><br>Input data should be valid JSON.";
        this.infoURL = "https://wikipedia.org/wiki/BSON";
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
        if (!input) return new ArrayBuffer();

        try {
            const data = JSON.parse(input);
            return bson.serialize(data).buffer;
        } catch (err) {
            throw new OperationError(err.toString());
        }
    }

}

export default BSONSerialise;
