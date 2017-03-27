var webpack = require("webpack"),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    HtmlWebpackPlugin = require("html-webpack-plugin"),
    Inliner = require("web-resource-inliner");

module.exports = function (grunt) {
    grunt.file.defaultEncoding = "utf8";
    grunt.file.preserveBOM = false;

    // Tasks
    grunt.registerTask("dev",
        "A persistent task which creates a development build whenever source files are modified.",
        ["clean:dev", "webpack:webDev"]);

    grunt.registerTask("node",
        "Compiles CyberChef into a single NodeJS module.",
        ["clean:node", "webpack:node", "chmod:build"]);

    grunt.registerTask("test",
        "A task which runs all the tests in test/tests.",
        ["clean:test", "webpack:tests", "execute:test"]);

    grunt.registerTask("docs",
        "Compiles documentation in the /docs directory.",
        ["clean:docs", "jsdoc", "chmod:docs"]);

    grunt.registerTask("prod",
        "Creates a production-ready build. Use the --msg flag to add a compile message.",
        ["eslint", "test", "clean:prod", "clean:docs", "jsdoc", "exec:stats", "webpack:webProd", "inline", "chmod"]);

    grunt.registerTask("stats",
        "Provides statistics about the code base such as how many lines there are as well as details of file sizes before and after compression.",
        ["webpack:webDev", "webpack:webProd", "exec:stats", "exec:repoSize", "exec:displayStats"]);

    grunt.registerTask("release",
        "Prepares and deploys a production version of CyberChef to the gh-pages branch.",
        ["copy:ghPages", "exec:deployGhPages"]);

    grunt.registerTask("default",
        "Lints the code base and shows stats",
        ["eslint", "exec:stats", "exec:displayStats"]);

    grunt.registerTask("inline",
        "Compiles a production build of CyberChef into a single, portable web page.",
        runInliner);

    grunt.registerTask("doc", "docs");
    grunt.registerTask("tests", "test");
    grunt.registerTask("lint", "eslint");


    // Load tasks provided by each plugin
    grunt.loadNpmTasks("grunt-eslint");
    grunt.loadNpmTasks("grunt-webpack");
    grunt.loadNpmTasks("grunt-jsdoc");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-chmod");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-execute");


    // Project configuration
    var compileTime = grunt.template.today("dd/mm/yyyy HH:MM:ss") + " UTC",
        codebaseStats = grunt.file.read("src/web/static/stats.txt").split("\n").join("<br>"),
        banner = "/**\n" +
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

    /**
     * Compiles a production build of CyberChef into a single, portable web page.
     */
    function runInliner() {
        var inlinerError = false;
        Inliner.html({
            relativeTo: "build/prod/",
            fileContent: grunt.file.read("build/prod/cyberchef.htm"),
            images: true,
            svgs: true,
            scripts: true,
            links: true,
            strict: true
        }, function(error, result) {
            if (error) {
                console.log(error);
                inlinerError = true;
                return false;
            }
            grunt.file.write("build/prod/cyberchef.htm", result);
        });

        return !inlinerError;
    }

    grunt.initConfig({
        clean: {
            dev: ["build/dev/*"],
            prod: ["build/prod/*"],
            test: ["build/test/*"],
            node: ["build/node/*"],
            docs: ["docs/*", "!docs/*.conf.json", "!docs/*.ico"],
        },
        eslint: {
            options: {
                configFile: "src/.eslintrc.json"
            },
            gruntfile: ["Gruntfile.js"],
            core: ["src/core/**/*.js", "!src/core/lib/**/*"],
            web: ["src/web/**/*.js"],
            node: ["src/node/**/*.js"],
            tests: ["test/**/*.js"],
        },
        jsdoc: {
            options: {
                destination: "docs",
                template: "node_modules/ink-docstrap/template",
                recurse: true,
                readme: "./README.md",
                configure: "docs/jsdoc.conf.json"
            },
            all: {
                src: [
                    "src/**/*.js",
                    "!src/core/lib/**/*",
                ],
            }
        },
        webpack: {
            options: {
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
                    new webpack.DefinePlugin({
                        COMPILE_TIME: JSON.stringify(compileTime),
                        COMPILE_MSG: JSON.stringify(grunt.option("compile-msg") || grunt.option("msg") || "")
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
                                use: "css-loader?minimize"
                            })
                        },
                        {
                            test: /\.less$/,
                            use: ExtractTextPlugin.extract({
                                use: [
                                    { loader: "css-loader?minimize" },
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
                    children: false
                }
            },
            webDev: {
                target: "web",
                entry: "./src/web/index.js",
                output: {
                    filename: "scripts.js",
                    path: "build/dev"
                },
                plugins: [
                    new HtmlWebpackPlugin({
                        filename: "index.html",
                        template: "./src/web/html/index.html",
                        compileTime: compileTime,
                        codebaseStats: codebaseStats
                    })
                ],
                watch: true
            },
            webProd: {
                target: "web",
                entry: "./src/web/index.js",
                output: {
                    filename: "scripts.js",
                    path: "build/prod"
                },
                plugins: [
                    new webpack.optimize.UglifyJsPlugin({
                        compress: {
                            "screw_ie8": true,
                            "dead_code": true,
                            "unused": true,
                            "warnings": false
                        },
                        comments: false,
                    }),
                    new HtmlWebpackPlugin({ // Main version
                        filename: "index.html",
                        template: "./src/web/html/index.html",
                        compileTime: compileTime,
                        codebaseStats: codebaseStats,
                        minify: {
                            removeComments: true,
                            collapseWhitespace: true,
                            minifyJS: true,
                            minifyCSS: true
                        }
                    }),
                    new HtmlWebpackPlugin({ // Inline version
                        filename: "cyberchef.htm",
                        template: "./src/web/html/index.html",
                        compileTime: compileTime,
                        codebaseStats: codebaseStats,
                        inline: true,
                        minify: {
                            removeComments: true,
                            collapseWhitespace: true,
                            minifyJS: true,
                            minifyCSS: true
                        }
                    }),
                ]
            },
            // webInline: {
            //     target: "web",
            //     entry: "./src/web/index.js",
            //     output: {
            //         filename: "scripts.js",
            //         path: "build/prod"
            //     },
            //     plugins: [
            //         new webpack.optimize.UglifyJsPlugin({
            //             compress: {
            //                 "screw_ie8": true,
            //                 "dead_code": true,
            //                 "unused": true,
            //                 "warnings": false
            //             },
            //             comments: false,
            //         }),
            //         new HtmlWebpackPlugin({
            //             filename: "cyberchef.htm",
            //             template: "./src/web/html/index.html",
            //             compileTime: compileTime,
            //             codebaseStats: codebaseStats,
            //             inline: true,
            //             minify: {
            //                 removeComments: true,
            //                 collapseWhitespace: true,
            //                 minifyJS: true,
            //                 minifyCSS: true
            //             }
            //         }),
            //         new StyleExtHtmlWebpackPlugin()
            //     ]
            // },
            tests: {
                target: "node",
                entry: "./test/index.js",
                output: {
                    filename: "index.js",
                    path: "build/test"
                }
            },
            node: {
                target: "node",
                entry: "./src/node/index.js",
                output: {
                    filename: "CyberChef.js",
                    path: "build/node",
                    library: "CyberChef",
                    libraryTarget: "commonjs2"
                }
            }
        },
        copy: {
            ghPages: {
                options: {
                    process: function (content, srcpath) {
                        // Add Google Analytics code to index.html
                        content = content.replace("</body></html>",
                            grunt.file.read("src/static/ga.html") + "</body></html>");
                        return grunt.template.process(content);
                    }
                },
                src: "build/prod/index.html",
                dest: "build/prod/index.html"
            }
        },
        // inline: {
        //     options: {
        //         tag: "",
        //         inlineTagAttributes: {
        //             js: "type='application/javascript'",
        //             css: "type='text/css'"
        //         }
        //     },
        //     compiled: {
        //         src: "build/prod/cyberchef.htm"
        //     }
        // },
        chmod: {
            build: {
                options: {
                    mode: "755",
                },
                src: ["build/**/*", "build/"]
            },
            docs: {
                options: {
                    mode: "755",
                },
                src: ["docs/**/*", "docs/"]
            }
        },
        exec: {
            repoSize: {
                command: [
                    "git ls-files | wc -l | xargs printf '\n%b\ttracked files\n'",
                    "du -hs | egrep -o '^[^\t]*' | xargs printf '%b\trepository size\n'"
                ].join(";"),
                stderr: false
            },
            stats: {
                command: "rm src/web/static/stats.txt;" +
                [
                    "ls src/ -R1 | grep '^$' -v | grep ':$' -v | wc -l | xargs printf '%b\tsource files\n'",
                    "find src/ -regex '.*\..*' -print | xargs cat | wc -l | xargs printf '%b\tlines\n'",
                    "du -hs src/ | pcregrep -o '^[^\t]*' | xargs printf '%b\tsize\n'",

                    "find src/ -regex '.*\.js' -not -regex '.*/lib/.*' -print | wc -l | xargs printf '\n%b\tJavaScript source files\n'",
                    "find src/ -regex '.*\.js' -not -regex '.*/lib/.*' -print | xargs cat | wc -l | xargs printf '%b\tlines\n'",
                    "find src/ -regex '.*\.js' -not -regex '.*/lib/.*' -exec du -hcs {} \+ | tail -n1 | egrep -o '^[^\t]*' | xargs printf '%b\tsize\n'",

                    "du build/dev/scripts.js -h | egrep -o '^[^\t]*' | xargs printf '\n%b\tuncompressed JavaScript size\n'",
                    "du build/prod/scripts.js -h | egrep -o '^[^\t]*' | xargs printf '%b\tcompressed JavaScript size\n'",

                    "grep -E '^\\s+name: ' src/core/config/Categories.js | wc -l | xargs printf '\n%b\tcategories\n'",
                    "grep -E '^\\s+\"[A-Za-z0-9 \\-]+\": {' src/core/config/OperationConfig.js | wc -l | xargs printf '%b\toperations\n'",

                ].join(" >> src/web/static/stats.txt;") + " >> src/web/static/stats.txt;",
                stderr: false
            },
            displayStats: {
                command: "cat src/web/static/stats.txt"
            },
            cleanGit: {
                command: "git gc --prune=now --aggressive"
            },
            deployGhPages: {
                command: [
                    "git add build/prod/index.html -v",
                    "COMMIT_HASH=$(git rev-parse HEAD)",
                    "git commit -m \"GitHub Pages release for ${COMMIT_HASH}\"",
                    "git push origin `git subtree split --prefix build/prod master`:gh-pages --force",
                    "git reset HEAD~",
                    "git checkout build/prod/index.html"
                ].join(";")
            }
        },
        execute: {
            test: "build/test/index.js"
        },
    });

};
