#!/usr/bin/env node
/**
 * @author Boolean263 [boolean263@protonmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */
'use strict';

const fs = require("fs");

///////// Helper Functions /////////

let slurpStream = (istream) => { // {{{1
    // Slurp the contents of a stream up into a Buffer to pass to CyberChef
    var ret = [];
    var len = 0;
    return new Promise(resolve => {
        istream.on('readable', () => {
            var chunk;
            while ((chunk = istream.read()) !== null) {
                ret.push(chunk);
                len += chunk.length;
            }
            resolve(Buffer.concat(ret, len));
        });
    });
}; // }}}1

let slurp = (fname) => { // {{{1
    // Slurp the contents of a file (or stdin) into a Buffer
    let istream;

    if (fname === undefined || fname == '-') {
        istream = process.stdin;
        if (istream.isTTY) {
            return Promise.reject(new Error("TTY input not supported"));
        }
    }
    else {
        istream = fs.createReadStream(fname, { flags: 'r' });
    }
    return slurpStream(istream);
}; // }}}1

let getPort = (value, dummyPrevious) => { // {{{1
    // Get a valid port number from the command line
    let ret = parseInt(value, 10);
    if (ret < 1 || ret > 65535) {
        throw new Error("invalid port number");
    }
    return ret;
};
// }}}1

///////// MAIN ///////// {{{1

const chef = require("cyberchef");
const program = require("commander");

program
    .version(require('./package.json').version)
    .description('Bake data from files and/or TCP clients '
        + 'using a CyberChef recipe.')
    .usage('[options] [file [file ...]]')
    .requiredOption('-r, --recipe-file <file>',
        'recipe JSON file')
    .option('-l, --listen [port]',
        'listen on TCP port for data (random if not given)', getPort, false)
    .option('-o, --output <file-or-dir>',
        'where to write result (file input only; default:stdout)');

try {
    program.exitOverride().parse(process.argv);
}
catch (e) {
    if (e.code != 'commander.helpDisplayed') {
        console.error("Run with '--help' for usage");
    }
    process.exit(1);
}

// If we get no inputs and we aren't running a server,
// make stdin our single input
let inputs = program.args;
if (inputs.length == 0 && !program.listen) {
    inputs = [ '-' ];
}

// Likewise stdout for our output
let ostream;
let path;
let outputIsDir = false;
if (program.output === undefined && !program.listen) {
    ostream = process.stdout;
}
else if (inputs.length > 0) {
    // See if our output is a directory
    let st;
    try {
        st = fs.statSync(program.output);
        outputIsDir = st.isDirectory();
    }
    catch(err) {
        // We're fine if the output doesn't exist yet
        if (err.code != 'ENOENT') throw err;
    }
    if (!outputIsDir) {
        ostream = fs.createWriteStream(program.output);
    }
}
if (outputIsDir) path = require("path");

let recipe;
slurp(program.recipeFile).then((data) => {
    recipe = JSON.parse(data);
})
.catch((err) => {
    console.error(`Error parsing recipe: ${err.message}`);
    process.exit(2);
})
.then(() => {
    // First, deal with any files we want to read
    for(let i of inputs) {
        slurp(i).then((data) => {
            let output = chef.bake(data, recipe);
            if (outputIsDir) {
                let outFileName = path.basename(i);
                if (outFileName == '-') outFileName = 'from-stdin';
                ostream = fs.createWriteStream(
                    path.join(program.output, outFileName));
            }
            ostream.write(output.presentAs("string", true));
            if (outputIsDir) ostream.end();
        },
        (err) => {
            console.error(err.message);
            process.exitCode = 2;
        })
        .catch((err) => {
            console.error(err.message);
            process.exitCode = 2;
        });
    }

    // Next, listen for TCP requests.
    // This is intentionally hardcoded to localhost to discourage
    // the use of this script as a production system.
    if (program.listen) {
        const net = require('net');
        const server = net.createServer((socket) => {
            slurpStream(socket).then((data) => {
                let output = chef.bake(data, recipe);
                socket.write(output.presentAs("string", true));
                socket.end();
            })
            .catch((err) => {
                console.error(err);
            });
        });

        // If no port given by user, let the OS choose one
        if (program.listen === true) program.listen = 0;
        server.listen(program.listen, '127.0.0.1')
            .on('listening', () => {
                console.log('Now listening on '
                    + server.address().address
                    + ":" + server.address().port);
            });

        // Exit gracefully
        process.on('SIGINT', () => {
            console.log("Exiting");
            server.close();
        });
    }
})
.catch((err) => {
    console.error(err);
    process.exit(3);
})
