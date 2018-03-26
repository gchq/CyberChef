import { CSV } from "csv-string";

/**
* @author VimalRaghubir [vraghubir0418@gmail.com]
* @copyright Crown Copyright 2016
* @license Apache-2.0
* @namespace
*/


const CSVParser = {
	/**
	* Parse from CSV
	* @param {string} input
	* @param {Object[]} args
    * @returns {string}
	*/
    csvToString: function(input, args) {
        let array = "";
        if (input) {
            let detectedDelimeter =	CSV.detect(input);
            if (detectedDelimeter !== args[0]) {
                args[0] = detectedDelimeter;
            }
                array = CSV.parse(input, args[0], args[1]);
        } else {
            array = "The passed in data is not a csv string. Please pass in a csv string.";
        }
        return array;
    },
    /**
	* Parse to CSV
	* @param {string} input
	* @param {Object[]} args
    * @returns {string}
	*/
    stringToCSV: function(input, args) {
        let string = "";
        if (input) {
            string = CSV.stringify(input, args[0]);
        } else {
            string = "The passed in data is not a string that can be converted to a CSV.";
        }
        return string;
    }	
};

export default CSVParser;
