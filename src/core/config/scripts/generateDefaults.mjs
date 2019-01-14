/**
 * This script automatically generates empty default files
 *
 * @author David B Heise [david@heiseink.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import path from "path";
import fs from "fs";
import process from "process";
import childProcess from "child_process";


const mkdirSync = function (dirPath) {
    console.log("Ensuring Folder: " + dirPath)
    try {
        fs.mkdirSync(dirPath);
    } catch (err) {
        if (err.code !== "EEXIST") throw err;
    }
};

const mkdirpSync = function (dirPath) {
    const parts = dirPath.split(path.sep);
    for (let i = 1; i <= parts.length; i++) {
        mkdirSync(path.join.apply(null, parts.slice(0, i)));
    }
};


const dir = process.cwd();
const newPath = path.join(dir, "src/core/config/modules");

//Create the Destination Folder
mkdirpSync(newPath);

//Create the default files
fs.writeFileSync(path.join(dir, "src/core/config/modules/OpModules.mjs"), "export default{};\n");
fs.writeFileSync(path.join(dir, "src/core/config/OperationConfig.json"), "[]\n");

//Run the generateOpsIndex.mjs file
childProcess.fork(path.join(dir, "src/core/config/scripts/generateOpsIndex.mjs"), { execArgv: ["--experimental-modules", "--no-warnings", "--no-deprecation"]});

//Run the generateConfig.mjs file
childProcess.fork(path.join(dir, "src/core/config/scripts/generateConfig.mjs"), { execArgv: ["--experimental-modules", "--no-warnings", "--no-deprecation"]});
