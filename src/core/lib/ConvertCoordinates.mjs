/**
 * Co-ordinate conversion resources.
 *
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";
import geohash from "ngeohash";
/*
Currently unable to update to geodesy v2 as we cannot load .js modules into a .mjs file.
When we do update, imports will look like this:

import LatLonEllipsoidal from "geodesy/latlon-ellipsoidal.js";
import Mgrs from "geodesy/mgrs.js";
import OsGridRef from "geodesy/osgridref.js";
import Utm from "geodesy/utm.js";
*/
import geodesy from "geodesy";
const LatLonEllipsoidal = geodesy.LatLonEllipsoidal,
    Mgrs = geodesy.Mgrs,
    OsGridRef = geodesy.OsGridRef,
    Utm = geodesy.Utm;

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
 * Formats that should be passed to the conversion module as-is
 */
const NO_CHANGE = [
    "Geohash",
    "Military Grid Reference System",
    "Ordnance Survey National Grid",
    "Universal Transverse Mercator"
];

/**
 * Convert a given latitude and longitude into a different format.
 *
 * @param {string} input - Input string to be converted
 * @param {string} inFormat - Format of the input coordinates
 * @param {string} inDelim - The delimiter splitting the lat/long of the input
 * @param {string} outFormat - Format to convert to
 * @param {string} outDelim - The delimiter to separate the output with
 * @param {string} includeDir - Whether or not to include the compass direction in the output
 * @param {number} precision - Precision of the result
 * @returns {string} A formatted string of the converted co-ordinates
 */
export function convertCoordinates(input, inFormat, inDelim, outFormat, outDelim, includeDir, precision) {
    let isPair = false,
        split,
        latlon,
        convLat,
        convLon,
        conv,
        hash,
        utm,
        mgrs,
        osng,
        splitLat,
        splitLong,
        lat,
        lon;

    // Can't have a precision less than 0!
    if (precision < 0) {
        precision = 0;
    }

    if (inDelim === "Auto") {
        // Try to detect a delimiter in the input.
        inDelim = findDelim(input);
        if (inDelim === null) {
            throw new OperationError("Unable to detect the input delimiter automatically.");
        }
    } else if (!inDelim.includes("Direction")) {
        // Convert the delimiter argument value to the actual character
        inDelim = realDelim(inDelim);
    }

    if (inFormat === "Auto") {
        // Try to detect the format of the input data
        inFormat = findFormat(input, inDelim);
        if (inFormat === null) {
            throw new OperationError("Unable to detect the input format automatically.");
        }
    }

    // Convert the output delimiter argument to the real character
    outDelim = realDelim(outDelim);

    if (!NO_CHANGE.includes(inFormat)) {
        if (inDelim.includes("Direction")) {
            // Split on directions
            split = input.split(/[NnEeSsWw]/g);
            if (split[0] === "") {
                // Remove first element if direction preceding
                split = split.slice(1);
            }
        } else {
            split = input.split(inDelim);
        }
        // Replace any co-ordinate symbols with spaces so we can split on them later
        for (let i = 0; i < split.length; i++) {
            split[i] = split[i].replace(/[°˝´'"]/g, " ");
        }
        if (split.length > 1) {
            isPair = true;
        }
    } else {
        // Remove any delimiters from the input
        input = input.replace(inDelim, "");
        isPair = true;
    }

    // Conversions from the input format into a geodesy latlon object
    switch (inFormat) {
        case "Geohash":
            hash = geohash.decode(input.replace(/[^A-Za-z0-9]/g, ""));
            latlon = new LatLonEllipsoidal(hash.latitude, hash.longitude);
            break;
        case "Military Grid Reference System":
            utm = Mgrs.parse(input.replace(/[^A-Za-z0-9]/g, "")).toUtm();
            latlon = utm.toLatLonE();
            break;
        case "Ordnance Survey National Grid":
            osng = OsGridRef.parse(input.replace(/[^A-Za-z0-9]/g, ""));
            latlon = OsGridRef.osGridToLatLon(osng);
            break;
        case "Universal Transverse Mercator":
            // Geodesy needs a space between the first 2 digits and the next letter
            if (/^[\d]{2}[A-Za-z]/.test(input)) {
                input = input.slice(0, 2) + " " + input.slice(2);
            }
            utm = Utm.parse(input);
            latlon = utm.toLatLonE();
            break;
        case "Degrees Minutes Seconds":
            if (isPair) {
                // Split up the lat/long into degrees / minutes / seconds values
                splitLat = splitInput(split[0]);
                splitLong = splitInput(split[1]);

                if (splitLat.length >= 3 && splitLong.length >= 3) {
                    lat = convDMSToDD(splitLat[0], splitLat[1], splitLat[2], 10);
                    lon = convDMSToDD(splitLong[0], splitLong[1], splitLong[2], 10);
                    latlon = new LatLonEllipsoidal(lat.degrees, lon.degrees);
                } else {
                    throw new OperationError("Invalid co-ordinate format for Degrees Minutes Seconds");
                }
            } else {
                // Not a pair, so only try to convert one set of co-ordinates
                splitLat = splitInput(split[0]);
                if (splitLat.length >= 3) {
                    lat = convDMSToDD(splitLat[0], splitLat[1], splitLat[2]);
                    latlon = new LatLonEllipsoidal(lat.degrees, lat.degrees);
                } else {
                    throw new OperationError("Invalid co-ordinate format for Degrees Minutes Seconds");
                }
            }
            break;
        case "Degrees Decimal Minutes":
            if (isPair) {
                splitLat = splitInput(split[0]);
                splitLong = splitInput(split[1]);
                if (splitLat.length !== 2 || splitLong.length !== 2) {
                    throw new OperationError("Invalid co-ordinate format for Degrees Decimal Minutes.");
                }
                // Convert to decimal degrees, and then convert to a geodesy object
                lat = convDDMToDD(splitLat[0], splitLat[1], 10);
                lon = convDDMToDD(splitLong[0], splitLong[1], 10);
                latlon = new LatLonEllipsoidal(lat.degrees, lon.degrees);
            } else {
                // Not a pair, so only try to convert one set of co-ordinates
                splitLat = splitInput(input);
                if (splitLat.length !== 2) {
                    throw new OperationError("Invalid co-ordinate format for Degrees Decimal Minutes.");
                }
                lat = convDDMToDD(splitLat[0], splitLat[1], 10);
                latlon = new LatLonEllipsoidal(lat.degrees, lat.degrees);
            }
            break;
        case "Decimal Degrees":
            if (isPair) {
                splitLat = splitInput(split[0]);
                splitLong = splitInput(split[1]);
                if (splitLat.length !== 1 || splitLong.length !== 1) {
                    throw new OperationError("Invalid co-ordinate format for Decimal Degrees.");
                }
                latlon = new LatLonEllipsoidal(splitLat[0], splitLong[0]);
            } else {
                // Not a pair, so only try to convert one set of co-ordinates
                splitLat = splitInput(split[0]);
                if (splitLat.length !== 1) {
                    throw new OperationError("Invalid co-ordinate format for Decimal Degrees.");
                }
                latlon = new LatLonEllipsoidal(splitLat[0], splitLat[0]);
            }
            break;
        default:
            throw new OperationError(`Unknown input format '${inFormat}'`);
    }

    // Everything is now a geodesy latlon object
    // These store the latitude and longitude as decimal
    if (inFormat.includes("Degrees")) {
        // If the input string contains directions, we need to check if they're S or W.
        // If either of the directions are, we should make the decimal value negative
        const dirs = input.toUpperCase().match(/[NESW]/g);
        if (dirs && dirs.length >= 1) {
            // Make positive lat/lon values with S/W directions into negative values
            if (dirs[0] === "S" || (dirs[0] === "W" && latlon.lat > 0)) {
                latlon.lat = -latlon.lat;
            }
            if (dirs.length >= 2) {
                if (dirs[1] === "S" || (dirs[1] === "W" && latlon.lon > 0)) {
                    latlon.lon = -latlon.lon;
                }
            }
        }
    }

    // Try to find the compass directions of the lat and long
    const [latDir, longDir] = findDirs(latlon.lat + "," + latlon.lon, ",");

    // Output conversions for each output format
    switch (outFormat) {
        case "Decimal Degrees":
            // We could use the built in latlon.toString(),
            // but this makes adjusting the output harder
            lat = convDDToDD(latlon.lat, precision);
            lon = convDDToDD(latlon.lon, precision);
            convLat = lat.string;
            convLon = lon.string;
            break;
        case "Degrees Decimal Minutes":
            lat = convDDToDDM(latlon.lat, precision);
            lon = convDDToDDM(latlon.lon, precision);
            convLat = lat.string;
            convLon = lon.string;
            break;
        case "Degrees Minutes Seconds":
            lat = convDDToDMS(latlon.lat, precision);
            lon = convDDToDMS(latlon.lon, precision);
            convLat = lat.string;
            convLon = lon.string;
            break;
        case "Geohash":
            convLat = geohash.encode(latlon.lat, latlon.lon, precision);
            break;
        case "Military Grid Reference System":
            utm = latlon.toUtm();
            mgrs = utm.toMgrs();
            // MGRS wants a precision that's an even number between 2 and 10
            if (precision % 2 !== 0) {
                precision = precision + 1;
            }
            if (precision > 10) {
                precision = 10;
            }
            convLat = mgrs.toString(precision);
            break;
        case "Ordnance Survey National Grid":
            osng = OsGridRef.latLonToOsGrid(latlon);
            if (osng.toString() === "") {
                throw new OperationError(
                    "Could not convert co-ordinates to OS National Grid. Are the co-ordinates in range?"
                );
            }
            // OSNG wants a precision that's an even number between 2 and 10
            if (precision % 2 !== 0) {
                precision = precision + 1;
            }
            if (precision > 10) {
                precision = 10;
            }
            convLat = osng.toString(precision);
            break;
        case "Universal Transverse Mercator":
            utm = latlon.toUtm();
            convLat = utm.toString(precision);
            break;
    }

    if (convLat === undefined) {
        throw new OperationError("Error converting co-ordinates.");
    }

    if (outFormat.includes("Degrees")) {
        // Format DD/DDM/DMS for output
        // If we're outputting a compass direction, remove the negative sign
        if (latDir === "S" && includeDir !== "None") {
            convLat = convLat.replace("-", "");
        }
        if (longDir === "W" && includeDir !== "None") {
            convLon = convLon.replace("-", "");
        }

        let outConv = "";
        if (includeDir === "Before") {
            outConv += latDir + " ";
        }

        outConv += convLat;
        if (includeDir === "After") {
            outConv += " " + latDir;
        }
        outConv += outDelim;
        if (isPair) {
            if (includeDir === "Before") {
                outConv += longDir + " ";
            }
            outConv += convLon;
            if (includeDir === "After") {
                outConv += " " + longDir;
            }
            outConv += outDelim;
        }
        conv = outConv;
    } else {
        conv = convLat + outDelim;
    }

    return conv;
}

/**
 * Split up the input using a space or degrees signs, and sanitise the result
 *
 * @param {string} input - The input data to be split
 * @returns {number[]} An array of the different items in the string, stored as floats
 */
function splitInput(input) {
    const split = [];

    input.split(/\s+/).forEach((item) => {
        // Remove any character that isn't a digit, decimal point or negative sign
        item = item.replace(/[^0-9.-]/g, "");
        if (item.length > 0) {
            // Turn the item into a float
            split.push(parseFloat(item));
        }
    });
    return split;
}

/**
 * Convert Degrees Minutes Seconds to Decimal Degrees
 *
 * @param {number} degrees - The degrees of the input co-ordinates
 * @param {number} minutes - The minutes of the input co-ordinates
 * @param {number} seconds - The seconds of the input co-ordinates
 * @param {number} precision - The precision the result should be rounded to
 * @returns {{string: string, degrees: number}} An object containing the raw converted value (obj.degrees), and a formatted string version (obj.string)
 */
function convDMSToDD(degrees, minutes, seconds, precision) {
    const absDegrees = Math.abs(degrees);
    let conv = absDegrees + minutes / 60 + seconds / 3600;
    let outString = round(conv, precision) + "°";
    if (isNegativeZero(degrees) || degrees < 0) {
        conv = -conv;
        outString = "-" + outString;
    }
    return {
        "degrees": conv,
        "string": outString
    };
}

/**
 * Convert Decimal Degrees Minutes to Decimal Degrees
 *
 * @param {number} degrees - The input degrees to be converted
 * @param {number} minutes - The input minutes to be converted
 * @param {number} precision - The precision which the result should be rounded to
 * @returns {{string: string, degrees: number}} An object containing the raw converted value (obj.degrees), and a formatted string version (obj.string)
 */
function convDDMToDD(degrees, minutes, precision) {
    const absDegrees = Math.abs(degrees);
    let conv = absDegrees + minutes / 60;
    let outString = round(conv, precision) + "°";
    if (isNegativeZero(degrees) || degrees < 0) {
        conv = -conv;
        outString = "-" + outString;
    }
    return {
        "degrees": conv,
        "string": outString
    };
}

/**
 * Convert Decimal Degrees to Decimal Degrees
 *
 * Doesn't affect the input, just puts it into an object
 * @param {number} degrees - The input degrees to be converted
 * @param {number} precision - The precision which the result should be rounded to
 * @returns {{string: string, degrees: number}} An object containing the raw converted value (obj.degrees), and a formatted string version (obj.string)
 */
function convDDToDD(degrees, precision) {
    return {
        "degrees": degrees,
        "string": round(degrees, precision) + "°"
    };
}

/**
 * Convert Decimal Degrees to Degrees Minutes Seconds
 *
 * @param {number} decDegrees - The input data to be converted
 * @param {number} precision - The precision which the result should be rounded to
 * @returns {{string: string, degrees: number, minutes: number, seconds: number}} An object containing the raw converted value as separate numbers (.degrees, .minutes, .seconds), and a formatted string version (obj.string)
 */
function convDDToDMS(decDegrees, precision) {
    const absDegrees = Math.abs(decDegrees);
    let degrees = Math.floor(absDegrees);
    const minutes = Math.floor(60 * (absDegrees - degrees)),
        seconds = round(3600 * (absDegrees - degrees) - 60 * minutes, precision);
    let outString = degrees + "° " + minutes + "' " + seconds + '"';
    if (isNegativeZero(decDegrees) || decDegrees < 0) {
        degrees = -degrees;
        outString = "-" + outString;
    }
    return {
        "degrees": degrees,
        "minutes": minutes,
        "seconds": seconds,
        "string": outString
    };
}

/**
 * Convert Decimal Degrees to Degrees Decimal Minutes
 *
 * @param {number} decDegrees - The input degrees to be converted
 * @param {number} precision - The precision the input data should be rounded to
 * @returns {{string: string, degrees: number, minutes: number}} An object containing the raw converted value as separate numbers (.degrees, .minutes), and a formatted string version (obj.string)
 */
function convDDToDDM(decDegrees, precision) {
    const absDegrees = Math.abs(decDegrees);
    let degrees = Math.floor(absDegrees);
    const minutes = absDegrees - degrees,
        decMinutes = round(minutes * 60, precision);
    let outString = degrees + "° " + decMinutes + "'";
    if (decDegrees < 0 || isNegativeZero(decDegrees)) {
        degrees = -degrees;
        outString = "-" + outString;
    }

    return {
        "degrees": degrees,
        "minutes": decMinutes,
        "string": outString
    };
}

/**
 * Finds and returns the compass directions in an input string
 *
 * @param {string} input - The input co-ordinates containing the direction
 * @param {string} delim - The delimiter separating latitide and longitude
 * @returns {string[]} String array containing the latitude and longitude directions
 */
export function findDirs(input, delim) {
    const upperInput = input.toUpperCase();
    const dirExp = new RegExp(/[NESW]/g);

    const dirs = upperInput.match(dirExp);

    if (dirs) {
        // If there's actually compass directions
        // in the input, use these to work out the direction
        if (dirs.length <= 2 && dirs.length >= 1) {
            return dirs.length === 2 ? [dirs[0], dirs[1]] : [dirs[0], ""];
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
            if (split.length >= 1) {
                if (split[0] !== "") {
                    lat = split[0];
                }
                if (split.length >= 2 && split[1] !== "") {
                    long = split[1];
                }
            }
        }
    } else {
        const split = upperInput.split(dirExp);
        if (split.length > 1) {
            lat = split[0] === "" ? split[1] : split[0];
            if (split.length > 2 && split[2] !== "") {
                long = split[2];
            }
        }
    }

    if (lat) {
        lat = parseFloat(lat);
        latDir = lat < 0 ? "S" : "N";
    }

    if (long) {
        long = parseFloat(long);
        longDir = long < 0 ? "W" : "E";
    }

    return [latDir, longDir];
}

/**
 * Detects the co-ordinate format of the input data
 *
 * @param {string} input - The input data whose format we need to detect
 * @param {string} delim - The delimiter separating the data in input
 * @returns {string} The input format
 */
export function findFormat(input, delim) {
    let testData;
    const mgrsPattern = new RegExp(/^[0-9]{2}\s?[C-HJ-NP-X]{1}\s?[A-HJ-NP-Z][A-HJ-NP-V]\s?[0-9\s]+/),
        osngPattern = new RegExp(/^[A-HJ-Z]{2}\s+[0-9\s]+$/),
        geohashPattern = new RegExp(/^[0123456789BCDEFGHJKMNPQRSTUVWXYZ]+$/),
        utmPattern = new RegExp(/^[0-9]{2}\s?[C-HJ-NP-X]\s[0-9.]+\s?[0-9.]+$/),
        degPattern = new RegExp(/[°'"]/g);

    input = input.trim();

    if (delim !== null && delim.includes("Direction")) {
        const split = input.split(/[NnEeSsWw]/);
        if (split.length > 1) {
            testData = split[0] === "" ? split[1] : split[0];
        }
    } else if (delim !== null && delim !== "") {
        if (input.includes(delim)) {
            const split = input.split(delim);
            if (split.length > 1) {
                testData = split[0] === "" ? split[1] : split[0];
            }
        } else {
            testData = input;
        }
    }

    // Test non-degrees formats
    if (!degPattern.test(input)) {
        const filteredInput = input.toUpperCase().replace(delim, "");

        if (utmPattern.test(filteredInput)) {
            return "Universal Transverse Mercator";
        }
        if (mgrsPattern.test(filteredInput)) {
            return "Military Grid Reference System";
        }
        if (osngPattern.test(filteredInput)) {
            return "Ordnance Survey National Grid";
        }
        if (geohashPattern.test(filteredInput)) {
            return "Geohash";
        }
    }

    // Test DMS/DDM/DD formats
    if (testData !== undefined) {
        const split = splitInput(testData);
        switch (split.length) {
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
 *
 * @param {string} input
 * @returns {string} Delimiter type
 */
export function findDelim(input) {
    input = input.trim();
    const delims = [",", ";", ":"];
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
 *
 * @param {string} delim The delimiter to be matched
 * @returns {string}
 */
export function realDelim(delim) {
    return {
        "Auto": "Auto",
        "Space": " ",
        "\\n": "\n",
        "Comma": ",",
        "Semi-colon": ";",
        "Colon": ":"
    }[delim];
}

/**
 * Returns true if a zero is negative
 *
 * @param {number} zero
 * @returns {boolean}
 */
function isNegativeZero(zero) {
    return zero === 0 && 1 / zero < 0;
}

/**
 * Rounds a number to a specified number of decimal places
 *
 * @param {number} input - The number to be rounded
 * @param {precision} precision - The number of decimal places the number should be rounded to
 * @returns {number}
 */
function round(input, precision) {
    precision = Math.pow(10, precision);
    return Math.round(input * precision) / precision;
}
