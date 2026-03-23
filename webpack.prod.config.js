"use strict";

const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
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
    mode: "production",
    target: "web",
    entry: Object.assign({
        main: "./src/web/index.js"
    }, moduleEntryPoints),
    output: {
        ...baseConfig.output,
        path: __dirname + "/build/prod",
        filename: chunkData => {
            return chunkData.chunk.name === "main" ? "assets/[name].js" : "[name].js";
        },
    },
    resolve: {
        ...baseConfig.resolve,
        alias: {
            ...baseConfig.resolve.alias,
            "./config/modules/OpModules.mjs": "./config/modules/Default.mjs"
        }
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
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                minifyJS: true,
                minifyCSS: true
            }
        }),
        new BundleAnalyzerPlugin({
            analyzerMode: "static",
            reportFilename: "BundleAnalyzerReport.html",
            openAnalyzer: false
        }),
    ]
};
