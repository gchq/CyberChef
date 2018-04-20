/**
 * Node view for CyberChef.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import "babel-polyfill";

import {wrap, help, decapitalise} from "./apiUtils";
import * as operations from "../core/operations/index";

// Define global environment functions
global.ENVIRONMENT_IS_WORKER = function() {
    return typeof importScripts === "function";
};
global.ENVIRONMENT_IS_NODE = function() {
    return typeof process === "object" && typeof require === "function";
};
global.ENVIRONMENT_IS_WEB = function() {
    return typeof window === "object";
};


const chef = {};

// Add in wrapped operations with camelCase names
Object.keys(operations).forEach(op =>
    chef[decapitalise(op)] = wrap(operations[op]));

chef.help = help.bind(null, operations);

export default chef;
export {chef};
