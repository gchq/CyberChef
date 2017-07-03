const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

/**
 * Webpack configuration details for use with Grunt.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

const banner = "/**\n" +
    "* CyberChef - The Cyber Swiss Army Knife\n" +
    "*\n" +
    "* @copyright Crown Copyright 2016\n" +
    "* @license Apache-2.0\n" +
    "*\n" +
    "*   Copyright 2016 Crown Copyright\n" +
    "*\n" +
    '* Licensed under the Apache License, Version 2.0 (the "License");\n' +
    "* you may not use this file except in compliance with the License.\n" +
    "* You may obtain a copy of the License at\n" +
    "*\n" +
    "*     http://www.apache.org/licenses/LICENSE-2.0\n" +
    "*\n" +
    "* Unless required by applicable law or agreed to in writing, software\n" +
    '* distributed under the License is distributed on an "AS IS" BASIS,\n' +
    "* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n" +
    "* See the License for the specific language governing permissions and\n" +
    "* limitations under the License.\n" +
    "*/\n";

module.exports = {
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            moment: "moment-timezone"
        }),
        new webpack.BannerPlugin({
            banner: banner,
            raw: true,
            entryOnly: true
        }),
        new ExtractTextPlugin("styles.css"),
    ],
    resolve: {
        alias: {
            jquery: "jquery/src/jquery"
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
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
        warningsFilter: /source-map/
    }
};
