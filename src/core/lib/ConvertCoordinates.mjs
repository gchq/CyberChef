/**
 * Co-ordinate conversion resources.
 *
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import geohash from "ngeohash";
import geodesy from "geodesy";

/**
 * Co-ordinate formats
 */
export const FORMATS = [
    "Degrees Minutes Seconds",
    "Degrees Decimal Minutes",
    "Decimal Degrees",
    "Geohash",
    "Military Grid Reference System",
    "Ordnance Survey National Grid",
    "Universal Transverse Mercator"
];

/**
 * Formats that should be passed to Geodesy module as-is
 * Spaces are still removed
 */
const NO_CHANGE = [
    "Geohash",
    "Military Grid Reference System",
    "Ordnance Survey National Grid",
    "Universal Transverse Mercator",
];

/**
 * Convert a given latitude and longitude into a different format.
 * @param {string} input - Input string to be converted
 * @param {string} inFormat - Format of the input coordinates
 * @param {string} inDelim - The delimiter splitting the lat/long of the input
 * @param {string} outFormat - Format to convert to
 * @param {string} outDelim - The delimiter to separate the output with
 * @param {string} includeDir - Whether or not to include the compass direction in the output
 * @param {number} precision - Precision of the result
 * @returns {string} A formatted string of the converted co-ordinates
 */
export function convertCoordinates (input, inFormat, inDelim, outFormat, outDelim, includeDir, precision) {
    let isPair = false,
        split,
        latlon,
        conv,
        inLatDir,
        inLongDir;

    if (inDelim === "Auto") {
        inDelim = findDelim(input);
    } else {
        inDelim = realDelim(inDelim);
    }
    if (inFormat === "Auto") {
        inFormat = findFormat(input, inDelim);
        if (inFormat === null) {
            throw "Unable to detect the input format automatically.";
        }
    }
    if (inDelim === null && !inFormat.includes("Direction")) {
        throw "Unable to detect the input delimiter automatically.";
    }
    outDelim = realDelim(outDelim);

    if (!NO_CHANGE.includes(inFormat)) {
        split = input.split(inDelim);
        if (split.length > 1) {
            isPair = true;
        }
    } else {
        input = input.replace(inDelim, "");
        isPair = true;
    }

    if (inFormat.includes("Degrees")) {
        [inLatDir, inLongDir] = findDirs(input, inDelim);
    }

    if (inFormat === "Geohash") {
        const hash = geohash.decode(input.replace(/[^A-Za-z0-9]/g, ""));
        latlon = new geodesy.LatLonEllipsoidal(hash.latitude, hash.longitude);
    } else if (inFormat === "Military Grid Reference System") {
        const utm = geodesy.Mgrs.parse(input.replace(/[^A-Za-z0-9]/g, "")).toUtm();
        latlon = utm.toLatLonE();
    } else if (inFormat === "Ordnance Survey National Grid") {
        const osng = geodesy.OsGridRef.parse(input.replace(/[^A-Za-z0-9]/g, ""));
        latlon = geodesy.OsGridRef.osGridToLatLon(osng);
    } else if (inFormat === "Universal Transverse Mercator") {
        if (/^[\d]{2}[A-Za-z]/.test(input)) {
            input = input.slice(0, 2) + " " + input.slice(2);
        }
        const utm = geodesy.Utm.parse(input);
        latlon = utm.toLatLonE();
    } else if (inFormat === "Degrees Minutes Seconds") {
        if (isPair) {
            split[0] = split[0].replace(/[NnEeSsWw]/g, "").trim();
            split[1] = split[1].replace(/[NnEeSsWw]/g, "").trim();
            const splitLat = split[0].split(/[°′″'"\s]/g),
                splitLong = split[1].split(/[°′″'"\s]/g);

            if (splitLat.length >= 3 && splitLong.length >= 3) {
                const lat = convDMSToDD(parseFloat(splitLat[0]), parseFloat(splitLat[1]), parseFloat(splitLat[2]), 10);
                const long = convDMSToDD(parseFloat(splitLong[0]), parseFloat(splitLong[1]), parseFloat(splitLong[2]), 10);
                latlon = new geodesy.LatLonEllipsoidal(lat.degrees, long.degrees);
            }
        } else {
            // Create a new latlon object anyway, but we can ignore the lon value
            split[0] = split[0].replace(/[NnEeSsWw]/g, "").trim();
            const splitLat = split[0].split(/[°′″'"\s]/g);
            if (splitLat.length >= 3) {
                const lat = convDMSToDD(parseFloat(splitLat[0]), parseFloat(splitLat[1]), parseFloat(splitLat[2]));
                latlon = new geodesy.LatLonEllipsoidal(lat.degrees, lat.degrees);
            }
        }
    } else if (inFormat === "Degrees Decimal Minutes") {
        if (isPair) {
            const splitLat = splitInput(split[0]);
            const splitLong = splitInput(split[1]);
            if (splitLat.length !== 2 || splitLong.length !== 2) {
                throw "Invalid co-ordinate format for Degrees Decimal Minutes.";
            }
            const lat = convDDMToDD(splitLat[0], splitLat[1], 10);
            const long = convDDMToDD(splitLong[0], splitLong[1], 10);
            latlon = new geodesy.LatLonEllipsoidal(lat.degrees, long.degrees);
        } else {
            const splitLat = splitInput(input);
            if (splitLat.length !== 2) {
                throw "Invalid co-ordinate format for Degrees Decimal Minutes.";
            }
            const lat = convDDMToDD(splitLat[0], splitLat[1], 10);
            latlon = new geodesy.LatLonEllipsoidal(lat.degrees, lat.degrees);
        }
    } else if (inFormat === "Decimal Degrees") {
        if (isPair) {
            const splitLat =  splitInput(split[0]);
            const splitLong = splitInput(split[1]);
            if (splitLat.length !== 1 || splitLong.length !== 1) {
                throw "Invalid co-ordinate format for Decimal Degrees.";
            }
            latlon = new geodesy.LatLonEllipsoidal(splitLat[0], splitLong[0]);
        } else {
            const splitLat = splitInput(split[0]);
            if (splitLat.length !== 1) {
                throw "Invalid co-ordinate format for Decimal Degrees.";
            }
            latlon = new geodesy.LatLonEllipsoidal(splitLat[0], splitLat[0]);
        }
    } else {
        throw "Invalid input co-ordinate format selected.";
    }

    // Everything is now a geodesy latlon object
    if (outFormat === "Decimal Degrees") {
        conv = latlon.toString("d", precision);
        if (!isPair) {
            conv = conv.split(",")[0];
        }
    } else if (outFormat === "Degrees Decimal Minutes") {
        conv = latlon.toString("dm", precision);
        if (!isPair) {
            conv = conv.split(",")[0];
        }
    } else if (outFormat === "Degrees Minutes Seconds") {
        conv = latlon.toString("dms", precision);
        if (!isPair) {
            conv = conv.split(",")[0];
        }
    } else if (outFormat === "Geohash") {
        conv = geohash.encode(latlon.lat.toString(), latlon.lon.toString(), precision);
    } else if (outFormat === "Military Grid Reference System") {
        const utm = latlon.toUtm();
        const mgrs = utm.toMgrs();
        conv = mgrs.toString(precision);
    } else if (outFormat === "Ordnance Survey National Grid") {
        const osng = geodesy.OsGridRef.latLonToOsGrid(latlon);
        if (osng.toString() === "") {
            throw "Could not convert co-ordinates to OS National Grid. Are the co-ordinates in range?";
        }
        conv = osng.toString(precision);
    } else if (outFormat === "Universal Transverse Mercator") {
        const utm = latlon.toUtm();
        conv = utm.toString(precision);
    }

    if (conv === undefined) {
        throw "Error converting co-ordinates.";
    }
    if (outFormat.includes("Degrees")) {
        let [latDir, longDir] = findDirs(conv, outDelim);
        if (inLatDir !== undefined) {
            latDir = inLatDir;
        }
        if (inLongDir !== undefined) {
            longDir = inLongDir;
        }
        // DMS/DDM/DD
        conv = conv.replace(", ", outDelim);
        // Remove any directions from the current string,
        // so we can put them where we want them
        conv = conv.replace(/[NnEeSsWw]/g, "");
        if (includeDir !== "None") {
            let outConv = "";
            if (!isPair) {
                if (includeDir === "Before") {
                    outConv += latDir + " " + conv;
                } else {
                    outConv += conv + " " + latDir;
                }
            } else {
                const splitConv = conv.split(outDelim);
                if (splitConv.length === 2) {
                    if (includeDir === "Before") {
                        outConv += latDir + " ";
                    }
                    outConv += splitConv[0];
                    if (includeDir === "After") {
                        outConv += " " + latDir;
                    }
                    outConv += outDelim;
                    if (includeDir === "Before") {
                        outConv += longDir + " ";
                    }
                    outConv += splitConv[1];
                    if (includeDir === "After") {
                        outConv += " " + longDir;
                    }
                }
            }
            conv = outConv;
        }
    }

    return conv;
}

/**
 * Split up the input using a space or degrees signs, and sanitise the result
 * @param {string} input - The input data to be split
 * @returns {number[]} An array of the different items in the string, stored as floats
 */
function splitInput (input){
    const split = [];

    input.split(/[°′″'"\s]/).forEach(item => {
        // Remove any character that isn't a digit
        item = item.replace(/[^0-9.-]/g, "");
        if (item.length > 0){
            split.push(parseFloat(item));
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
 * Finds and returns the compass directions in an input string
 * @param {string} input - The input co-ordinates containing the direction
 * @param {string} delim - The delimiter separating latitide and longitude
 * @returns {string[]} String array containing the latitude and longitude directions
 */
export function findDirs(input, delim) {
    const upperInput = input.toUpperCase();
    const dirExp = new RegExp(/[NESW]/g);

    const dirs = upperInput.match(dirExp);

    if (dirExp.test(upperInput)) {
        // If there's actually compass directions in the string
        if (dirs.length <= 2 && dirs.length >= 1) {
            if (dirs.length === 2) {
                return [dirs[0], dirs[1]];
            } else {
                return [dirs[0], ""];
            }
        }
    }
    // Nothing was returned, so guess the directions
    let lat = upperInput,
        long,
        latDir = "",
        longDir = "";
    if (!delim.includes("Direction")) {
        if (upperInput.includes(delim)) {
            const split = upperInput.split(delim);
            if (split.length > 1) {
                if (split[0] === "") {
                    lat = split[1];
                } else {
                    lat = split[0];
                }
                if (split.length > 2) {
                    if (split[2] !== "") {
                        long = split[2];
                    }
                }
            }
        }
    } else {
        const split = upperInput.split(dirExp);
        if (split.length > 1) {
            if (split[0] === "") {
                lat = split[1];
            } else {
                lat = split[0];
            }
            if (split.length > 2) {
                if (split[2] !== "") {
                    long = split[2];
                }
            }
        }
    }
    if (lat) {
        lat = parseFloat(lat);
        if (lat < 0) {
            latDir = "S";
        } else {
            latDir = "N";
        }
    }
    if (long) {
        long = parseFloat(long);
        if (long < 0) {
            longDir = "W";
        } else {
            longDir = "E";
        }
    }

    return [latDir, longDir];
}

/**
 * Detects the co-ordinate format of the input data
 * @param {string} input - The input data whose format we need to detect
 * @param {string} delim - The delimiter separating the data in input
 * @returns {string} The input format
 */
export function findFormat (input, delim) {
    let testData;
    const mgrsPattern = new RegExp(/^[0-9]{2}\s?[C-HJ-NP-X]{1}\s?[A-HJ-NP-Z][A-HJ-NP-V]\s?[0-9\s]+/),
        osngPattern = new RegExp(/^[STNHO][A-HJ-Z][0-9]+$/),
        geohashPattern = new RegExp(/^[0123456789BCDEFGHJKMNPQRSTUVWXYZ]+$/),
        utmPattern = new RegExp(/^[0-9]{2}\s?[C-HJ-NP-X]\s[0-9\.]+\s?[0-9\.]+$/),
        degPattern = new RegExp(/[°'"]/g);
    input = input.trim();
    if (delim !== null && delim.includes("Direction")) {
        const split = input.split(/[NnEeSsWw]/);
        if (split.length > 1) {
            if (split[0] === "") {
                testData = split[1];
            } else {
                testData = split[0];
            }
        }
    } else if (delim !== null && delim !== "") {
        if (input.includes(delim)) {
            const split = input.split(delim);
            if (split.length > 1) {
                if (split[0] === "") {
                    testData = split[1];
                } else {
                    testData = split[0];
                }
            }
        } else {
            testData = input;
        }
    }

    // Test MGRS and Geohash
    if (!degPattern.test(input)) {
        const filteredInput = input.toUpperCase();
        const isMgrs = mgrsPattern.test(filteredInput);
        const isOsng = osngPattern.test(filteredInput);
        const isGeohash = geohashPattern.test(filteredInput);
        const isUtm = utmPattern.test(filteredInput);
        if (isMgrs && (isOsng || isGeohash)) {
            if (filteredInput.includes("I")) {
                // Only MGRS can have an i!
                return "Military Grid Reference System";
            }
        }
        if (isUtm) {
            return "Universal Transverse Mercator";
        }
        if (isOsng && isGeohash) {
            // Geohash doesn't have A, L or O, but OSNG does.
            const testExp = new RegExp(/[ALO]/g);
            if (testExp.test(filteredInput)) {
                return "Ordnance Survey National Grid";
            } else {
                return "Geohash";
            }
        }
        if (isMgrs) {
            return "Military Grid Reference System";
        }
        if (isOsng) {
            return "Ordnance Survey National Grid";
        }
        if (isGeohash) {
            return "Geohash";
        }
    }

    // Test DMS/DDM/DD formats
    if (testData !== undefined) {
        const split = splitInput(testData);
        switch (split.length){
            case 3:
                return "Degrees Minutes Seconds";
            case 2:
                return "Degrees Decimal Minutes";
            case 1:
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
    const delims = [",", ";", ":", " "];
    const testDir = input.match(/[NnEeSsWw]/g);
    if (testDir !== null && testDir.length > 0 && testDir.length < 3) {
        // Possibly contains a direction
        const splitInput = input.split(/[NnEeSsWw]/);
        if (splitInput.length <= 3 && splitInput.length > 0) {
            // If there's 3 splits (one should be empty), then assume we have directions
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
                // Don't want to try and convert more than 2 co-ordinates
                return delim;
            }
        }
    }
    return null;
}

/**
 * Gets the real string for a delimiter name.
 * @param {string} delim The delimiter to be matched
 * @returns {string}
 */
export function realDelim (delim) {
    return {
        "Auto":         "Auto",
        "Space":        " ",
        "\\n":          "\n",
        "Comma":        ",",
        "Semi-colon":   ";",
        "Colon":        ":"
    }[delim];
}
