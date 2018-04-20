/**
 * Node view for CyberChef.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import "babel-polyfill";

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


import wrap from "./Wrapper";

import * as operations from "../core/operations/index";

/**
 * 
 * @param name 
 */
function decapitalise(name) {
    return `${name.charAt(0).toLowerCase()}${name.substr(1)}`;
}


// console.log(operations);
const chef = {};
Object.keys(operations).forEach(op =>
    chef[decapitalise(op)] = wrap(operations[op]));


export default chef;
export {chef};
