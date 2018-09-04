/**
 * Create a REPL server for chef
 *
 *
 * @author d98762656 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import { operations } from "./index";
import chef from "./index";
import { decapitalise } from "./apiUtils";
import repl from "repl";
import "babel-polyfill";

/*eslint no-console: ["off"] */

console.log("Welcome to CyberChef");
const replServer = repl.start({
    prompt: "chef > ",
});

operations.forEach((op) => {
    replServer.context[decapitalise(op.opName)] = op;
});

replServer.context.help = chef.help;
replServer.context.bake = chef.bake;
