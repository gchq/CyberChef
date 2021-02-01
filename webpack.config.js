const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

/**
 * Webpack configuration details for use with Grunt.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

const banner = `/**
 * CyberChef - The Cyber Swiss Army Knife
 *
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 *   Copyright 2016 Crown Copyright
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
        globalObject: "this"
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            log: "loglevel",
            // process and Buffer are no longer polyfilled in webpack 5 but
            // many of our dependencies expect them, so it is easiest to just
            // provide them everywhere as was the case in webpack 4-
            process: "process",
            Buffer: ["buffer", "Buffer"]
        }),
        new webpack.BannerPlugin({
            banner: banner,
            raw: true,
            entryOnly: true
        }),
        new webpack.DefinePlugin({
            // Required by Jimp to improve loading speed in browsers
            "process.browser": "true"
        }),
        new MiniCssExtractPlugin({
            filename: "assets/[name].css"
        }),
        new CopyWebpackPlugin({
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
        })
    ],
    resolve: {
        extensions: [".mjs", ".js", ".json"], // Allows importing files without extensions
        alias: {
            jquery: "jquery/src/jquery",
        },
        fallback: {
            "fs": false,
            "child_process": false,
            "net": false,
            "tls": false,
            "path": require.resolve("path/"),
            "buffer": require.resolve("buffer/"),
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
            "zlib": require.resolve("browserify-zlib")
        }
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules\/(?!crypto-api|bootstrap)/,
                options: {
                    configFile: path.resolve(__dirname, "babel.config.js"),
                    cacheDirectory: true,
                    compact: false
                },
                type: "javascript/auto",
                loader: "babel-loader"
            },
            {
                test: /node-forge/,
                loader: "imports-loader",
                options: {
                    additionalCode: "var jQuery = false;"
                }
            },
            {
                test: /prime.worker.min.js$/,
                use: "raw-loader"
            },
            {
                test: /bootstrap-material-design/,
                loader: "imports-loader",
                options: {
                    imports: "default popper.js/dist/umd/popper.js Popper"
                }
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
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: "../"
                        }
                    },
                    "css-loader",
                    "postcss-loader",
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: "../"
                        }
                    },
                    "css-loader",
                    "sass-loader",
                ]
            },
            /**
             * The limit for these files has been increased to 60,000 (60KB)
             * to ensure the material icons font is inlined.
             *
             * See: https://github.com/gchq/CyberChef/issues/612
             */
            {
                test: /\.(ico|eot|ttf|woff|woff2)$/,
                loader: "url-loader",
                options: {
                    limit: 60000,
                    name: "[hash].[ext]",
                    outputPath: "assets"
                }
            },
            {
                test: /\.svg$/,
                loader: "svg-url-loader",
                options: {
                    encoding: "base64"
                }
            },
            { // Store font .fnt and .png files in a separate fonts folder
                test: /(\.fnt$|bmfonts\/.+\.png$)/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]",
                    outputPath: "assets/fonts"
                }
            },
            { // First party images are saved as files to be cached
                test: /\.(png|jpg|gif)$/,
                exclude: /(node_modules|bmfonts)/,
                loader: "file-loader",
                options: {
                    name: "images/[name].[ext]"
                }
            },
            { // Third party images are inlined
                test: /\.(png|jpg|gif)$/,
                exclude: /web\/static/,
                loader: "url-loader",
                options: {
                    limit: 10000,
                    name: "[hash].[ext]",
                    outputPath: "assets"
                }
            },
        ]
    },
    stats: {
        children: false,
        chunks: false,
        modules: false,
        entrypoints: false,
        warningsFilter: [
            /source-map/,
            /dependency is an expression/,
            /export 'default'/,
            /Can't resolve 'sodium'/
        ],
    },
    performance: {
        hints: false
    }
};
