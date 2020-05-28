#!/usr/bin/env node
/**
 * @author Boolean263 [boolean263@protonmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */
'use strict';

const fs = require("fs");
const path = require("path");
const chef = require("cyberchef");
const program = require("commander");

let slurpStream = (istream) => { // {{{1
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
    let istream;

    if (fname === undefined || fname == '-') {
        istream = process.stdin;
        if (istream.isTTY) {
            throw new Error("TTY input not supported");
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

program
    .version(require('./package.json').version)
    .usage('[options] [file [file ...]]')
    .requiredOption('-r, --recipe-file <file>',
        'recipe JSON file')
    .option('-l, --listen [port]',
        'listen on TCP port for data (default:random)', getPort, false)
    .option('-o, --output <file-or-dir>',
        'write result here (not for TCP; default:stdout)')
    .parse(process.argv);

// If we get no inputs and we aren't running a server,
// make stdin our single input
let inputs = program.args;
if (inputs.length == 0 && !program.listen) {
    inputs = [ '-' ];
}

// Likewise stdout for our output
let ostream;
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
        if (err.code != 'ENOENT') throw err;
    }
    if (!outputIsDir) {
        ostream = fs.createWriteStream(program.output);
    }
}

let recipe;
slurp(program.recipeFile).then((data) => {
    recipe = JSON.parse(data);
})
.catch((err) => {
    console.error(`Error parsing recipe: ${err}`);
    process.exit(1);
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
        })
        .catch((err) => {
            console.error(err);
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

        // If no port given, let the OS choose one
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
    process.exit(2);
})
