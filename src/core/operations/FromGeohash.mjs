/**
 * @author gchq77703 []
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import geohash from "ngeohash";

/**
 * From Geohash operation
 */
class FromGeohash extends Operation {

    /**
     * FromGeohash constructor
     */
    constructor() {
        super();

        this.name = "From Geohash";
        this.module = "Default";
        this.description = "Converts Geohash strings into Lat / Long coordinates.  For example, <code>ww8p1r4t8</code> becomes <code>37.8324,112.5584</code>.";
        this.infoURL = "https://en.wikipedia.org/wiki/Geohash";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        return input.split("\n").map(line => {
            const coords = geohash.decode(line);
            return [coords.latitude, coords.longitude].join(",");
        }).join("\n");
    }

}

export default FromGeohash;
