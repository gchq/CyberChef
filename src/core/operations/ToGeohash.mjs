/**
 * @author gchq77703 []
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import geohash from "ngeohash";

/**
 * To Geohash operation
 */
class ToGeohash extends Operation {

    /**
     * ToGeohash constructor
     */
    constructor() {
        super();

        this.name = "To Geohash";
        this.module = "Hashing";
        this.description = "Converts Lat/Long coordinates into a Geohash string.  For example, <code>37.8324,112.5584</code> becomes <code>ww8p1r4t8</code>.";
        this.infoURL = "https://wikipedia.org/wiki/Geohash";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Precision",
                type: "number",
                value: 9
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [precision] = args;

        return input.split("\n").map(line => {
            line = line.replace(/ /g, "");
            if (line === "") return "";
            return geohash.encode(...line.split(",").map(num => parseFloat(num)), precision);
        }).join("\n");
    }

}

export default ToGeohash;
