/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";

/**
 * Strip HTTP headers operation
 */
class StripHTTPHeaders extends Operation {

    /**
     * StripHTTPHeaders constructor
     */
    constructor() {
        super();

        this.name = "Strip HTTP headers";
        this.module = "Default";
        this.description = "Removes HTTP headers from a request or response by looking for the first instance of a double newline.";
        this.infoURL = "https://wikipedia.org/wiki/Hypertext_Transfer_Protocol#Message_format";
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
        let headerEnd = input.indexOf("\r\n\r\n");
        headerEnd = (headerEnd < 0) ? input.indexOf("\n\n") + 2 : headerEnd + 4;

        return (headerEnd < 2) ? input : input.slice(headerEnd, input.length);
    }

}

export default StripHTTPHeaders;
