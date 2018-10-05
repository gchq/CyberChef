/**
 * Create a REPL server for chef
 *
 *
 * @author d98762656 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import chef from "./index";
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

Object.keys(chef).forEach((key) => {
    if (key !== "operations") {
        replServer.context[key] = chef[key];
    }
});

