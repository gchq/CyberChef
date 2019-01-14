/**
 * Co-ordinate conversion resources.
 *
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import geohash from "ngeohash";
import mgrs from "mgrs";

/**
 * Co-ordinate formats
 */
export const FORMATS = [
    "Degrees Minutes Seconds",
    "Degrees Decimal Minutes",
    "Decimal Degrees",
    "Geohash",
    "Military Grid Reference System"
];

/**
 * Convert a given latitude and longitude into a different format.
 * @param {string} inLat - Input latitude to be converted. Use this for supplying single values for conversion (e.g. geohash)
 * @param {string} inLong - Input longitude to be converted
 * @param {string} inFormat - Format of the input coordinates
 * @param {string} outFormat - Format to convert to
 * @param {number} precision - Precision of the result
 * @returns {string[]} Array containing the converted latitude and longitude
 */
export function convertCoordinates (inLat, inLong, inFormat, outFormat, precision) {
    let convLat = inLat;
    let convLong = inLong;
    if (inFormat === "Geohash") {
        const hash = geohash.decode(inLat);
        convLat = hash.latitude.toString();
        convLong = hash.longitude.toString();
    } else if (inFormat === "Military Grid Reference System") {
        const result = mgrs.toPoint(inLat.replace(" ", ""));
        convLat = result[1];
        convLong = result[0];
    } else {
        convLat = convertSingleCoordinate(inLat, inFormat, "Decimal Degrees", 15).split("°");
        convLong = convertSingleCoordinate(inLong, inFormat, "Decimal Degrees", 15).split("°");
    }

    // Convert Geohash and MGRS here, as they need both the lat and long values
    if (outFormat === "Geohash") {
        convLat = geohash.encode(parseFloat(convLat), parseFloat(convLong), precision);
    } else if (outFormat === "Military Grid Reference System") {
        convLat = mgrs.forward([parseFloat(convLong), parseFloat(convLat)], precision);
    } else {
        convLat = convertSingleCoordinate(convLat.toString(), "Decimal Degrees", outFormat, precision);
        convLong = convertSingleCoordinate(convLong.toString(), "Decimal Degrees", outFormat, precision);
    }

    return [convLat, convLong];
}

/**
 * @param {string} input - The input co-ordinate to be converted
 * @param {string} inFormat - The format of the input co-ordinates
 * @param {string} outFormat - The format which input should be converted to
 * @param {boolean} returnRaw - When true, returns the raw float instead of a String
 * @returns {string|{Object}} The converted co-ordinate result, as either the raw object or a formatted string
 */
export function convertSingleCoordinate (input, inFormat, outFormat, precision, returnRaw = false){
    let converted;
    precision = Math.pow(10, precision);
    const convData = splitInput(input);
    // Convert everything to decimal degrees first
    switch (inFormat) {
        case "Degrees Minutes Seconds":
            if (convData.length < 3) {
                throw "Invalid co-ordinates format.";
            }
            converted = convDMSToDD(convData[0], convData[1], convData[2], precision);
            break;
        case "Degrees Decimal Minutes":
            if (convData.length < 2) {
                throw "Invalid co-ordinates format.";
            }
            converted = convDDMToDD(convData[0], convData[1], precision);
            break;
        case "Decimal Degrees":
            if (convData.length < 1) {
                throw "Invalid co-ordinates format.";
            }
            converted = convDDToDD(convData[0], precision);
            break;
        default:
            throw "Unknown input format selection.";
    }

    // Convert from decimal degrees to the output format
    switch (outFormat) {
        case "Decimal Degrees":
            break;
        case "Degrees Minutes Seconds":
            converted = convDDToDMS(converted.degrees);
            break;
        case "Degrees Decimal Minutes":
            converted = convDDToDDM(converted.degrees, precision);
            break;
        default:
            throw "Unknown output format selection.";
    }
    if (returnRaw) {
        return converted;
    } else {
        return converted.string;
    }
}

/**
 * Split up the input using a space, and sanitise the result
 * @param {string} input - The input data to be split
 * @returns {number[]} An array of the different items in the string, stored as floats
 */
function splitInput (input){
    const split = [];

    input.split(" ").forEach(item => {
        // Remove any character that isn't a digit
        item = item.replace(/[^0-9.-]/g, "");
        if (item.length > 0){
            split.push(parseFloat(item, 10));
        }
    });
    return split;
}

/**
 * Convert Degrees Minutes Seconds to Decimal Degrees
 * @param {number} degrees - The degrees of the input co-ordinates
 * @param {number} minutes - The minutes of the input co-ordinates
 * @param {number} seconds - The seconds of the input co-ordinates
 * @param {number} precision - The precision the result should be rounded to
 * @returns {{string: string, degrees: number}} An object containing the raw converted value (obj.degrees), and a formatted string version (obj.string)
 */
function convDMSToDD (degrees, minutes, seconds, precision){
    const converted = new Object();
    converted.degrees = degrees + (minutes / 60) + (seconds / 3600);
    converted.string = (Math.round(converted.degrees * precision) / precision) + "°";
    return converted;
}

/**
 * Convert Decimal Degrees Minutes to Decimal Degrees
 * @param {number} degrees - The input degrees to be converted
 * @param {number} minutes - The input minutes to be converted
 * @param {number} precision - The precision which the result should be rounded to
 * @returns {{string: string, degrees: number}} An object containing the raw converted value (obj.degrees), and a formatted string version (obj.string)
 */
function convDDMToDD (degrees, minutes, precision) {
    const converted = new Object();
    converted.degrees = degrees + minutes / 60;
    converted.string = ((Math.round(converted.degrees * precision) / precision) + "°");
    return converted;
}

/**
 * Convert Decimal Degrees to Decimal Degrees
 * Doesn't affect the input, just puts it into an object
 * @param {number} degrees - The input degrees to be converted
 * @param {number} precision - The precision which the result should be rounded to
 * @returns {{string: string, degrees: number}} An object containing the raw converted value (obj.degrees), and a formatted string version (obj.string)
 */
function convDDToDD (degrees, precision) {
    const converted = new Object();
    converted.degrees = degrees;
    converted.string = Math.round(converted.degrees * precision) / precision + "°";
    return converted;
}

/**
 * Convert Decimal Degrees to Degrees Minutes Seconds
 * @param {number} decDegrees - The input data to be converted
 * @returns {{string: string, degrees: number, minutes: number, seconds: number}} An object containing the raw converted value as separate numbers (.degrees, .minutes, .seconds), and a formatted string version (obj.string)
 */
function convDDToDMS (decDegrees) {
    const degrees = Math.floor(decDegrees);
    const minutes = Math.floor(60 * (decDegrees - degrees));
    const seconds = Math.round(3600 * (decDegrees - degrees) - 60 * minutes);

    const converted = new Object();
    converted.degrees = degrees;
    converted.minutes = minutes;
    converted.seconds = seconds;
    converted.string = degrees + "° " + minutes + "' " + seconds + "\"";
    return converted;
}

/**
 * Convert Decimal Degrees to Degrees Decimal Minutes
 * @param {number} decDegrees - The input degrees to be converted
 * @param {number} precision - The precision the input data should be rounded to
 * @returns {{string: string, degrees: number, minutes: number}} An object containing the raw converted value as separate numbers (.degrees, .minutes), and a formatted string version (obj.string)
 */
function convDDToDDM (decDegrees, precision) {
    const degrees = Math.floor(decDegrees);
    const minutes = decDegrees - degrees;
    const decMinutes = Math.round((minutes * 60) * precision) / precision;

    const converted = new Object();
    converted.degrees = degrees;
    converted.minutes = decMinutes;
    converted.string = degrees + "° " + decMinutes + "'";
    return converted;
}

/**
 * 
 * @param {string} input - The input data whose format we need to detect
 * @param {string} delim - The delimiter separating the data in input
 * @returns {string} The input format
 */
export function findFormat (input, delim) {
    input = input.trim();
    let testData;
    if (delim.includes("Direction")) {
        const split = input.split(/[NnEeSsWw]/);
        if (split.length > 0) {
            if (split[0] === "") {
                // Direction Preceding
                testData = split[1];
            } else {
                // Direction Following
                testData = split[0];
            }
        }
    } else if (delim !== "") {
        const split = input.split(delim);
        if (!input.includes(delim)) {
            testData = input;
        }
        if (split.length > 0) {
            if (split[0] !== "") {
                testData = split[0];
            } else if (split.length > 1) {
                testData = split[1];
            }
        }
    }

    // Test MGRS and Geohash
    if (input.split(" ").length <= 1) {
        const filteredInput = input.replace(/[^A-Za-z0-9]/, "").toUpperCase();
        const mgrsPattern = new RegExp(/^[0-9]{2}[C-HJ-NP-X]{2}[A-Z]+/);
        const geohashPattern = new RegExp(/^[0123456789BCDEFGHJKMNPQRSTUVWXYZ]+$/);
        log.error(filteredInput);
        if (mgrsPattern.test(filteredInput)) {
            return "Military Grid Reference System";
        } else if (geohashPattern.test(filteredInput)) {
            return "Geohash";
        }
    }

    // Test DMS/DDM/DD formats
    if (testData !== undefined) {
        const split = splitInput(testData);
        if (split.length === 3) {
            // DMS
            return "Degrees Minutes Seconds";
        } else if (split.length === 2) {
            // DDM
            return "Degrees Decimal Minutes";
        } else if (split.length === 1) {
            return "Decimal Degrees";
        }
    }
    return null;
}

/**
 * Automatically find the delimeter type from the given input
 * @param {string} input
 * @returns {string} Delimiter type
 */
export function findDelim (input) {
    input = input.trim();
    const delims = [",", ";", ":"];
    // Direction
    const testDir = input.match(/[NnEeSsWw]/g);
    if (testDir !== null && testDir.length > 0 && testDir.length < 3) {
        // Possible direction
        const splitInput = input.split(/[NnEeSsWw]/);
        if (splitInput.length <= 3 && splitInput.length > 0) {
            // One of the splits should be an empty string
            if (splitInput[0] === "") {
                return "Direction Preceding";
            } else if (splitInput[splitInput.length - 1] === "") {
                return "Direction Following";
            }
        }
    }

    // Loop through the standard delimiters, and try to find them in the input
    for (let i = 0; i < delims.length; i++) {
        const delim = delims[i];
        if (input.includes(delim)) {
            const splitInput = input.split(delim);
            if (splitInput.length <= 3 && splitInput.length > 0) {
                return delim;
            }
        }
    }
    return null;
}
