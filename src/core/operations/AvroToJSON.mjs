/**
 * @author jarrodconnolly [jarrod@nestedquotes.ca]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import avro from "avsc";

/**
 * Avro to JSON operation
 */
class AvroToJSON extends Operation {

    /**
     * AvroToJSON constructor
     */
    constructor() {
        super();

        this.name = "Avro to JSON";
        this.module = "Avro";
        this.description = "Converts Avro encoded data into JSON.";
        this.infoURL = "https://avro.apache.org/docs/current/spec.html";
        this.inputType = "ArrayBuffer";
        this.outputType = "JSON";
        this.args = [{
            name: "Force Valid JSON",
            type: "boolean",
            value: true
        }];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    run(input, args) {
        const self = this;
        if (input.byteLength <= 0) {
            throw new OperationError("Please provide an input.");
        }

        const forceJSON = args[0];

        return new Promise((resolve, reject) => {
            const result = [];
            const inpArray = new Uint8Array(input);
            const decoder = new avro.streams.BlockDecoder();

            decoder
                .on("data", function (obj) {
                    result.push(obj);
                })
                .on("error", function () {
                    reject(new OperationError("Error parsing Avro file."));
                })
                .on("end", function () {
                    if (forceJSON) {
                        self.presentType = "JSON";
                        self.outputType = "JSON";
                        resolve(result.length === 1 ? result[0] : result);
                    } else {
                        self.presentType = "string";
                        self.outputType = "string";
                        const data = result.reduce((result, current) => result + JSON.stringify(current) + "\n", "");
                        resolve(data);
                    }
                });

            decoder.write(inpArray);
            decoder.end();
        });
    }
}

export default AvroToJSON;
