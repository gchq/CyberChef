import Extract from "../../operations/Extract.js";
import Regex from "../../operations/Regex.js";


/**
 * Regex module.
 *
 * Libraries:
 *  - XRegExp
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
let OpModules = typeof self === "undefined" ? {} : self.OpModules || {};

OpModules.Regex = {
    "Regular expression":   Regex.runRegex,
    "Find / Replace":       Regex.runFindReplace,
    "Strings":              Extract.runStrings,
    "Extract IP addresses": Extract.runIp,
    "Extract email addresses": Extract.runEmail,
    "Extract MAC addresses": Extract.runMac,
    "Extract URLs":         Extract.runUrls,
    "Extract domains":      Extract.runDomains,
    "Extract file paths":   Extract.runFilePaths,
    "Extract dates":        Extract.runDates,
};

export default OpModules;
