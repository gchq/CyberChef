/**
 * @author Dachande663 [dachande663@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";

/**
 * HaversineDistance operation
 */
class HaversineDistance extends Operation {

    /**
     * HaversineDistance constructor
     */
    constructor() {
        super();

        this.name = "Haversine distance";
        this.module = "Default";
        this.description = "Returns the distance between two pairs of GPS latitude and longitude co-ordinates in metres.<br><br>e.g. <code>51.487263,-0.124323, 38.9517,-77.1467</code>";
        this.infoURL = "https://wikipedia.org/wiki/Haversine_formula";
        this.inputType = "string";
        this.outputType = "number";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {number}
     */
    run(input, args) {

        const values = input.match(/^(-?\d+(\.\d+)?), ?(-?\d+(\.\d+)?), ?(-?\d+(\.\d+)?), ?(-?\d+(\.\d+)?)$/);
        if (!values) {
            throw new OperationError("Input must in the format lat1, lng1, lat2, lng2");
        }

        const lat1 = parseFloat(values[1]);
        const lng1 = parseFloat(values[3]);
        const lat2 = parseFloat(values[6]);
        const lng2 = parseFloat(values[8]);

        const TO_RAD = Math.PI / 180;
        const dLat = (lat2-lat1) * TO_RAD;
        const dLng = (lng2-lng1) * TO_RAD;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * TO_RAD) * Math.cos(lat2 * TO_RAD) * Math.sin(dLng/2) * Math.sin(dLng/2);
        const metres = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return metres;

    }

}

export default HaversineDistance;
