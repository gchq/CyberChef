const rspack = require("@rspack/core");
const path = require("path");
const zlib = require("zlib");

/**
 * Rspack configuration for CyberChef.
 * Migrated from Webpack 5 for faster build times.
 *
 * @author CyberChef Modernization
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

const d = new Date();
const banner = `/**
 * CyberChef - The Cyber Swiss Army Knife
 *
 * @copyright Crown Copyright 2016-${d.getUTCFullYear()}
 * @license Apache-2.0
 *
 *   Copyright 2016-${d.getUTCFullYear()} Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */`;


module.exports = {
    output: {
        publicPath: "",
        globalObject: "this",
        assetModuleFilename: "assets/[hash][ext][query]"
    },
    plugins: [
        new rspack.ProvidePlugin({
            log: "loglevel",
            process: "process",
            Buffer: ["buffer", "Buffer"]
        }),
        new rspack.BannerPlugin({
            banner: banner,
            raw: true,
            entryOnly: true
        }),
        new rspack.DefinePlugin({
            "process.browser": "true"
        }),
        new rspack.CssExtractRspackPlugin({
            filename: "assets/[name].css"
        }),
        new rspack.CopyRspackPlugin({
            patterns: [
                {
                    context: "src/core/vendor/",
                    from: "tesseract/**/*",
                    to: "assets/"
                }, {
                    context: "node_modules/tesseract.js/",
                    from: "dist/worker.min.js",
                    to: "assets/tesseract"
                }, {
                    context: "node_modules/tesseract.js-core/",
                    from: "tesseract-core.wasm.js",
                    to: "assets/tesseract"
                }, {
                    context: "node_modules/node-forge/dist",
                    from: "prime.worker.min.js",
                    to: "assets/forge/"
                }
            ]
        }),
    ],
    resolve: {
        extensions: [".mjs", ".js", ".json"],
        alias: {},
        fallback: {
            "assert": require.resolve("assert/"),
            "buffer": require.resolve("buffer/"),
            "child_process": false,
            "crypto": require.resolve("crypto-browserify"),
            "events": require.resolve("events/"),
            "fs": false,
            "net": false,
            "path": require.resolve("path/"),
            "process": false,
            "stream": require.resolve("stream-browserify"),
            "tls": false,
            "url": require.resolve("url/"),
            "vm": false,
            "zlib": require.resolve("browserify-zlib")
        }
    },
    module: {
        noParse: /argon2\.wasm$/,
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules\/(?!crypto-api|bootstrap)/,
                loader: "builtin:swc-loader",
                options: {
                    jsc: {
                        parser: {
                            syntax: "ecmascript",
                            dynamicImport: true,
                            importAssertions: true,
                        },
                        target: "es2020",
                    },
                    env: {
                        targets: "Chrome >= 80, Firefox >= 78, Safari >= 14",
                    },
                },
                type: "javascript/auto",
            },
            {
                test: /node-forge/,
                loader: "imports-loader",
                options: {
                    additionalCode: "var jQuery = false;"
                }
            },
            {
                test: /argon2\.wasm$/,
                loader: "base64-loader",
                type: "javascript/auto"
            },
            {
                test: /prime.worker.min.js$/,
                type: "asset/source"
            },
            {
                test: /blueimp-load-image/,
                loader: "imports-loader",
                options: {
                    type: "commonjs",
                    imports: "single min-document document"
                }
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: rspack.CssExtractRspackPlugin.loader,
                        options: {
                            publicPath: "../"
                        }
                    },
                    "css-loader",
                    "postcss-loader",
                ]
            },
            {
                test: /\.(ico|eot|ttf|woff|woff2)$/,
                type: "asset/resource",
            },
            {
                test: /\.svg$/,
                type: "asset/inline",
            },
            {
                test: /(\.fnt$|bmfonts\/.+\.png$)/,
                type: "asset/resource",
                generator: {
                    filename: "assets/fonts/[name][ext]"
                }
            },
            {
                test: /\.(png|jpg|gif)$/,
                exclude: /(node_modules|bmfonts)/,
                type: "asset/resource",
                generator: {
                    filename: "images/[name][ext]"
                }
            },
            {
                test: /\.(png|jpg|gif)$/,
                exclude: /web\/static/,
                type: "asset/inline",
            },
        ]
    },
    stats: {
        children: false,
        chunks: false,
        modules: false,
        entrypoints: false
    },
    ignoreWarnings: [
        /source-map/,
        /source map/,
        /dependency is an expression/,
        /export 'default'/,
        /Can't resolve 'sodium'/
    ],
    performance: {
        hints: false
    }
};
