/**
 * @author David Tomaschik [dwt@google.com]
 * @copyright Google LLC 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Extract a URI to JSON Operation
 */
class ExtractURI extends Operation {
    /**
     * ExtractURI Constructor
     */
    constructor() {
        super();

        this.name = "Extract URI";
        this.module = "URL";
        this.description = "Extract components of URI to JSON for further processing.";
        this.infoURL = "https://wikipedia.org/wiki/Uniform_Resource_Identifier";
        this.inputType = "string";
        this.outputType = "JSON";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    run(input, args) {
        const uri = new URL(input);
        const pieces = {};
        // Straight copy some attributes
        [
            "hash",
            "hostname",
            "password",
            "pathname",
            "port",
            "protocol",
            "username"
        ].forEach((name) => {
            if (uri[name]) pieces[name] = uri[name];
        });
        // Now handle query params
        const params = uri.searchParams;
        if (params.size) {
            pieces.query = {};
            for (const name of params.keys()) {
                const values = params.getAll(name);
                if (values.length > 1) {
                    pieces.query[name] = values;
                } else {
                    pieces.query[name] = values[0];
                }
            }
        }
        return pieces;
    }
};

export default ExtractURI;
