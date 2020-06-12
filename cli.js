#!/usr/bin/env node
/**
 * @author Boolean263 [boolean263@protonmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */
"use strict";

const fs = require("fs");

/* * * * * Helper Functions * * * * */

/**
 * Slurp the contents of a stream up into a Buffer to pass to CyberChef
 *
 * @param {Stream} istream
 */
const slurpStream = (istream) => { // {{{1
    const ret = [];
    let len = 0;
    return new Promise(resolve => {
        istream.on("readable", () => {
            let chunk;
            while ((chunk = istream.read()) !== null) {
                ret.push(chunk);
                len += chunk.length;
            }
            resolve(Buffer.concat(ret, len));
        });
    });
}; // }}}1

/**
 * Slurp the contents of a file (or stdin) into a Buffer
 *
 * @param {String} fname
 */
const slurp = (fname) => { // {{{1
    let istream;

    if (fname === undefined || fname === "-") {
        istream = process.stdin;
        if (istream.isTTY) {
            return Promise.reject(new Error("TTY input not supported"));
        }
    } else {
        istream = fs.createReadStream(fname, { flags: "r" });
    }
    return slurpStream(istream);
}; // }}}1

/* * * * * MAIN * * * * */ // {{{1

const chef = require("./src/node/cjs.js");
const program = require("commander");

program
    .version(require("./package.json").version)
    .description("Bake data from files and/or TCP clients " +
        "using a CyberChef recipe.")
    .usage("[options] [file [file ...]]")
    .requiredOption("-r, --recipe-file <file>",
        "recipe JSON file")
    .option("-o, --output <file-or-dir>",
        "where to write result (file input only; default:stdout)");

try {
    program.exitOverride().parse(process.argv);
} catch (e) {
    console.error(e.message);
    if (e.code !== "commander.helpDisplayed") {
        console.error("Run with \"--help\" for usage");
    }
    process.exit(1);
}

let recipe;
try {
    recipe = JSON.parse(fs.readFileSync(program.recipeFile));
} catch (err) {
    console.error(err.message);
    process.exit(3);
}

// If we get no inputs, make stdin our single input
let inputs = program.args;
if (inputs.length === 0) {
    inputs = ["-"];
}

// Likewise stdout for our output
let ostream;
let path;
let outputIsDir = false;
if (program.output === undefined) {
    ostream = process.stdout;
} else {
    // See if our output is a directory
    let st;
    try {
        st = fs.statSync(program.output);
        outputIsDir = st.isDirectory();
    } catch (err) {
        // We"re fine if the output doesn't exist yet
        if (err.code !== "ENOENT") throw err;
    }
    if (!outputIsDir) {
        ostream = fs.createWriteStream(program.output);
    }
}
if (outputIsDir) path = require("path");

// Deal with any files we want to read
for (const i of inputs) {
    slurp(i).then((data) => {
        const output = chef.bake(data, recipe);
        if (outputIsDir) {
            let outFileName = path.basename(i);
            if (outFileName === "-") outFileName = "from-stdin";
            ostream = fs.createWriteStream(
                path.join(program.output, outFileName));
        }
        ostream.write(output.presentAs("string", true));
        if (outputIsDir) ostream.end();
    })
        .catch((err) => {
            console.error(err.message);
            process.exitCode = 2;
        });
}
