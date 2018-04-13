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

// import Chef from "../core/Chef";

// const CyberChef = {

//     bake: function(input, recipeConfig) {
//         this.chef = new Chef();
//         return this.chef.bake(
//             input,
//             recipeConfig,
//             {},
//             0,
//             false
//         );
//     }

// };

// export default CyberChef;
// export {CyberChef};

import Wrapper from "./Wrapper";

import * as operations from "../core/operations/index";

const cyberChef = {
    base32: {
        from: new Wrapper().wrap(operations.FromBase32),
        to: new Wrapper().wrap(operations.ToBase32),
    }
};

export default cyberChef;
export {cyberChef};
