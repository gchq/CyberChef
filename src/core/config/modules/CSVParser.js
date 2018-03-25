import CSVParser from "../../operations/CSVParser.js";


/**
 * CSVParser module.
 *
 * Libraries:
 *  - csv-string
 *
 * @author VimalRaghubir [vraghubir0418@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */
let OpModules = typeof self === "undefined" ? {} : self.OpModules || {};

OpModules.CSVParser = {
    "Parse from CSV": CSVParser.csvToString,
    "Parse to CSV": CSVParser.stringToCSV,
};

export default OpModules;