"use strict";

const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const baseConfig = require("./webpack.config.js");
const { listEntryModules } = require("./scripts/listEntryModulesSync.cjs");
const pkg = require("./package.json");

const d = new Date();
const compileYear = d.getUTCFullYear().toString();
const compileTime = `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()} ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}:${String(d.getUTCSeconds()).padStart(2, "0")} UTC`;

const BUILD_CONSTANTS = {
    COMPILE_YEAR: JSON.stringify(compileYear),
    COMPILE_TIME: JSON.stringify(compileTime),
    COMPILE_MSG: JSON.stringify(process.env.COMPILE_MSG || ""),
    PKG_VERSION: JSON.stringify(pkg.version),
};

const moduleEntryPoints = listEntryModules();

module.exports = {
    ...baseConfig,
    mode: "development",
    target: "web",
    entry: Object.assign({
        main: "./src/web/index.js"
    }, moduleEntryPoints),
    resolve: {
        ...baseConfig.resolve,
        alias: {
            ...baseConfig.resolve.alias,
            "./config/modules/OpModules.mjs": "./config/modules/Default.mjs"
        }
    },
    devServer: {
        port: parseInt(process.env.PORT || "8080", 10),
        client: {
            logging: "error",
            overlay: true
        },
        hot: "only"
    },
    plugins: [
        ...baseConfig.plugins,
        new webpack.DefinePlugin(BUILD_CONSTANTS),
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: "./src/web/html/index.html",
            chunks: ["main"],
            compileYear: compileYear,
            compileTime: compileTime,
            version: pkg.version,
        })
    ]
};
