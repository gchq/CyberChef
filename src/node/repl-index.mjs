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

console.log(`
   ______      __              ________         ____
  / ____/_  __/ /_  ___  _____/ ____/ /_  ___  / __/
 / /   / / / / __ \\/ _ \\/ ___/ /   / __ \\/ _ \\/ /_  
/ /___/ /_/ / /_/ /  __/ /  / /___/ / / /  __/ __/  
\\____/\\__, /_.___/\\___/_/   \\____/_/ /_/\\___/_/     
     /____/                                         
     
`);
const replServer = repl.start({
    prompt: "chef > ",
});

operations.forEach((op) => {
    replServer.context[decapitalise(op.opName)] = op;
});

replServer.context.help = chef.help;
replServer.context.bake = chef.bake;
replServer.context.Dish = chef.Dish;
