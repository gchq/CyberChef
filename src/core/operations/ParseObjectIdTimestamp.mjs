/**
 * @author dmfj [dominic@dmfj.io]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import BSON from "bson";

/**
 * Parse ObjectId timestamp operation
 */
class ParseObjectIdTimestamp extends Operation {

    /**
     * ParseObjectIdTimestamp constructor
     */
    constructor() {
        super();

        this.name = "Parse ObjectId timestamp";
        this.module = "Default";
        this.description = "Parse timestamp from MongoDB/BSON ObjectId hex string.";
        this.infoURL = "https://docs.mongodb.com/manual/reference/method/ObjectId.getTimestamp/";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        try {
            const objectId = new BSON.ObjectID(input);
            return objectId.getTimestamp().toISOString();
        } catch (err) {
            throw new OperationError(err);
        }
    }

}

export default ParseObjectIdTimestamp;
