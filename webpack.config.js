/* eslint-env node */

var path = require("path");

module.exports = {
    entry: "./src/js/views/html/index.js",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "build/dev")
    }
};
