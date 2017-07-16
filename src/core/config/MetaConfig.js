/**
 * Re-exports OperationConfig in value-loader format without the run function
 * allowing the web app to access metadata about operations without having to
 * import all the dependencies.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import "babel-regenerator-runtime";
import Utils from "../Utils.js";
import OperationConfig from "./OperationConfig.js";


// Remove the run function from each operation config
for (let opConf in OperationConfig) {
    delete OperationConfig[opConf].run;
}

// Export a string version of the meta config so that it can be imported using
// value-loader without any of the dependencies.
export default "module.exports = " + JSON.stringify(OperationConfig) + ";";
