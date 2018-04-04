const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const WebpackShellPlugin = require("webpack-shell-plugin");

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
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 *
 *   Copyright 2017 Crown Copyright
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
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            log: "loglevel"
        }),
        new webpack.BannerPlugin({
            banner: banner,
            raw: true,
            entryOnly: true
        }),
        new ExtractTextPlugin("styles.css"),
        new WebpackShellPlugin({
            onBuildStart: [
                "node --experimental-modules src/core/config/scripts/generateOpsIndex.mjs",
                "node --experimental-modules src/core/config/scripts/generateConfig.mjs",
            ],
        })
    ],
    resolve: {
        alias: {
            jquery: "jquery/src/jquery"
        }
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                loader: "babel-loader?compact=false"
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        { loader: "css-loader?minimize" },
                        { loader: "postcss-loader" },
                    ]
                })
            },
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        { loader: "css-loader?minimize" },
                        { loader: "postcss-loader" },
                        { loader: "less-loader" }
                    ]
                })
            },
            {
                test: /\.(ico|eot|ttf|woff|woff2)$/,
                loader: "url-loader",
                options: {
                    limit: 10000
                }
            },
            { // First party images are saved as files to be cached
                test: /\.(png|jpg|gif|svg)$/,
                exclude: /node_modules/,
                loader: "file-loader",
                options: {
                    name: "images/[name].[ext]"
                }
            },
            { // Third party images are inlined
                test: /\.(png|jpg|gif|svg)$/,
                exclude: /web\/static/,
                loader: "url-loader",
                options: {
                    limit: 10000
                }
            },
        ]
    },
    stats: {
        children: false,
        chunks: false,
        modules: false,
        entrypoints: false,
        warningsFilter: /source-map/,
    },
    node: {
        fs: "empty"
    },
    performance: {
        hints: false
    }
};
