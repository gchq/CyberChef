/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * GenerateCurrentEpoch operation
 */
class GenerateCurrentEpoch extends Operation {

    /**
     * GenerateCurrentEpoch constructor
     */
    constructor() {
        super();

        this.name = "Generate Current Epoch";
        this.module = "Default";
        this.description = "Generates the current time(in seconds/milliseconds) since the UNIX epoch.";
        this.infoURL = "https://wikipedia.org/wiki/Unix_time";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Granularity",
                type: "option",
                value: ["Milliseconds", "Seconds"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (args[0] === "Milliseconds")
            return (new Date()).getTime().toString();
        else
            return Math.round((new Date()).getTime() / 1000).toString();
    }

}

export default GenerateCurrentEpoch;
