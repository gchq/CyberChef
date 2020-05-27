/**
 * @author dmfj [dominic@dmfj.io]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import BSON from "bson";

/**
 * Parse ObjectID timestamp operation
 */
class ParseObjectIDTimestamp extends Operation {

    /**
     * ParseObjectIDTimestamp constructor
     */
    constructor() {
        super();

        this.name = "Parse ObjectID timestamp";
        this.module = "Serialise";
        this.description = "Parse timestamp from MongoDB/BSON ObjectID hex string.";
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

export default ParseObjectIDTimestamp;
