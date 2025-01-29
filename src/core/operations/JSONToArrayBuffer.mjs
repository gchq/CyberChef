/**
 * @author Configured Things Ltd. [getconfigured@configuredthings.com]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * JSON to ArrayBuffer operation
 */
class JSONToArrayBuffer extends Operation {

    /**
     * JSONToArrayBuffer constructor
     */
    constructor() {
        super();

        this.name = "JSON to ArrayBuffer";
        this.module = "Default";
        this.description = "Serialises a JSON object to an ArrayBuffer";
        this.infoURL = ""; // Usually a Wikipedia link. Remember to remove localisation (i.e. https://wikipedia.org/etc rather than https://en.wikipedia.org/etc)
        this.inputType = "JSON";
        this.outputType = "ArrayBuffer";
        this.args = [
        ];
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        const messageStr = JSON.stringify(input);
        const textEncoder = new TextEncoder();
        const messageAb = textEncoder.encode(messageStr).buffer;
        return messageAb;
    }

}

export default JSONToArrayBuffer;
