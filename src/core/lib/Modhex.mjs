/**
 * Modhex helpers.
 *
 * @author linuxgemini [ilteris@asenkron.com.tr]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */


/**
 * Modhex to Hex conversion map.
 */
export const MODHEX_TO_HEX_CONVERSION_MAP = {
    "c": "0",
    "b": "1",
    "d": "2",
    "e": "3",
    "f": "4",
    "g": "5",
    "h": "6",
    "i": "7",
    "j": "8",
    "k": "9",
    "l": "a",
    "n": "b",
    "r": "c",
    "t": "d",
    "u": "e",
    "v": "f"
};


/**
 * Hex to Modhex conversion map.
 */
export const HEX_TO_MODHEX_CONVERSION_MAP = {
    "0": "c",
    "1": "b",
    "2": "d",
    "3": "e",
    "4": "f",
    "5": "g",
    "6": "h",
    "7": "i",
    "8": "j",
    "9": "k",
    "a": "l",
    "b": "n",
    "c": "r",
    "d": "t",
    "e": "u",
    "f": "v"
};


/**
 * To Modhex delimiters.
 */
export const TO_MODHEX_DELIM_OPTIONS = ["Space", "Percent", "Comma", "Semi-colon", "Colon", "Line feed", "CRLF", "None"];


/**
 * From Modhex delimiters.
 */
export const FROM_MODHEX_DELIM_OPTIONS = ["Auto"].concat(TO_MODHEX_DELIM_OPTIONS);
