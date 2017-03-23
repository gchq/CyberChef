var webpack = require("webpack"),
    ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = function (grunt) {
    grunt.file.defaultEncoding = "utf8";
    grunt.file.preserveBOM = false;

    // Tasks
    grunt.registerTask("dev",
        "A persistent task which creates a development build whenever source files are modified.",
        ["clean:dev", "webpack:web", "copy:htmlDev", "copy:staticDev", "chmod:build", "watch"]);

    grunt.registerTask("node",
        "Compiles CyberChef into a single NodeJS module.",
        ["clean:node", "webpack:node", "chmod:build"]);

    grunt.registerTask("test",
        "A task which runs all the tests in test/tests.",
        ["clean:test", "webpack:tests", "chmod:build", "execute:test"]);

    grunt.registerTask("prod",
        "Creates a production-ready build. Use the --msg flag to add a compile message.",
        ["eslint", "test", "exec:stats", "clean", "jsdoc", "webpack:web", "copy:htmlDev", "copy:htmlProd", "copy:htmlInline",
         "copy:staticDev", "copy:staticProd", "cssmin", "uglify:prod", "inline", "htmlmin", "chmod"]);

    grunt.registerTask("docs",
        "Compiles documentation in the /docs directory.",
        ["clean:docs", "jsdoc", "chmod:docs"]);

    grunt.registerTask("stats",
        "Provides statistics about the code base such as how many lines there are as well as details of file sizes before and after compression.",
        ["webpack:web", "uglify:prod", "exec:stats", "exec:repoSize", "exec:displayStats"]);

    grunt.registerTask("release",
        "Prepares and deploys a production version of CyberChef to the gh-pages branch.",
        ["copy:ghPages", "exec:deployGhPages"]);

    grunt.registerTask("default",
        "Lints the code base and shows stats",
        ["eslint", "exec:stats", "exec:displayStats"]);

    grunt.registerTask("doc", "docs");
    grunt.registerTask("tests", "test");
    grunt.registerTask("lint", "eslint");


    // Load tasks provided by each plugin
    grunt.loadNpmTasks("grunt-eslint");
    grunt.loadNpmTasks("grunt-jsdoc");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-webpack");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-htmlmin");
    grunt.loadNpmTasks("grunt-inline-alt");
    grunt.loadNpmTasks("grunt-chmod");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-execute");
    grunt.loadNpmTasks("grunt-contrib-watch");


    var compileTime = grunt.template.today("dd/mm/yyyy HH:MM:ss") + " UTC",
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

    var templateOptions = {
        data: {
            compileTime: compileTime,
            compileMsg: grunt.option("compile-msg") || grunt.option("msg") || "",
            codebaseStats: grunt.file.read("src/web/static/stats.txt").split("\n").join("<br>")
        }
    };

    // Project configuration
    grunt.initConfig({
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
        clean: {
            dev: ["build/dev/*"],
            prod: ["build/prod/*"],
            test: ["build/test/*"],
            node: ["build/node/*"],
            docs: ["docs/*", "!docs/*.conf.json", "!docs/*.ico"],
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
                        "banner": banner,
                        "raw": true,
                        "entryOnly": true
                    }),
                    new webpack.DefinePlugin({
                        COMPILE_TIME: JSON.stringify(compileTime),
                        COMPILE_MSG: JSON.stringify(grunt.option("compile-msg") || grunt.option("msg") || "")
                    }),
                ],
                resolve: {
                    alias: {
                        jquery: "jquery/src/jquery"
                    }
                },
                module: {
                    loaders: [
                        {
                            test: /\.js$/,
                            exclude: /node_modules/,
                            loader: "babel-loader?compact=false"
                        }
                    ]
                }
            },
            web: {
                target: "web",
                entry: [
                    "babel-polyfill",
                    "bootstrap",
                    "bootstrap-switch",
                    "bootstrap-colorpicker",
                    "./src/web/css/index.js",
                    "./src/web/index.js"
                ],
                output: {
                    filename: "scripts.js",
                    path: "build/dev"
                },
                module: {
                    rules: [
                        {
                            test: /\.css$/,
                            use: ExtractTextPlugin.extract({
                                use: "css-loader"
                            })
                        },
                        {
                            test: /\.less$/,
                            use: ExtractTextPlugin.extract({
                                use: [
                                    { loader: "css-loader" },
                                    { loader: "less-loader" }
                                ]
                            })
                        },
                        {
                            test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                            loader: "url-loader",
                            options: {
                                limit: 10000
                            }
                        }
                    ]
                },
                plugins: [
                    new ExtractTextPlugin("styles.css"),
                ]
            },
            tests: {
                target: "node",
                entry: ["babel-polyfill", "./test/TestRunner.js"],
                output: {
                    filename: "index.js",
                    path: "build/test"
                },
                module: {
                    loaders: [{
                        test: /prettify\.min\.js$/,
                        use: "imports-loader?window=>global"
                    }]
                }
            },
            node: {
                target: "node",
                entry: ["babel-polyfill", "./src/node/index.js"],
                output: {
                    filename: "CyberChef.js",
                    path: "build/node",
                    library: "CyberChef",
                    libraryTarget: "commonjs2"
                },
                module: {
                    loaders: [{
                        test: /prettify\.min\.js$/,
                        use: "imports-loader?window=>global"
                    }]
                }
            }
        },
        copy: {
            htmlDev: {
                options: {
                    process: function (content, srcpath) {
                        return grunt.template.process(content, templateOptions);
                    }
                },
                src: "src/web/html/index.html",
                dest: "build/dev/index.html"
            },
            htmlProd: {
                options: {
                    process: function (content, srcpath) {
                        return grunt.template.process(content, templateOptions);
                    }
                },
                src: "src/web/html/index.html",
                dest: "build/prod/index.html"
            },
            htmlInline: {
                options: {
                    process: function (content, srcpath) {
                        // TODO: Do all this in Jade
                        content = content.replace(
                            '<a href="cyberchef.htm" style="float: left; margin-left: 10px; margin-right: 80px;" download>Download CyberChef<img src="images/download-24x24.png" /></a>',
                            '<span style="float: left; margin-left: 10px;">Compile time: ' + grunt.template.today("dd/mm/yyyy HH:MM:ss") + " UTC</span>");
                        return grunt.template.process(content, templateOptions);
                    }
                },
                src: "src/web/html/index.html",
                dest: "build/prod/cyberchef.htm"
            },
            staticDev: {
                files: [
                    {
                        expand: true,
                        cwd: "src/web/static/",
                        src: [
                            "**/*",
                            "**/.*",
                            "!stats.txt",
                            "!ga.html"
                        ],
                        dest: "build/dev/"
                    }
                ]
            },
            staticProd: {
                files: [
                    {
                        expand: true,
                        cwd: "src/web/static/",
                        src: [
                            "**/*",
                            "**/.*",
                            "!stats.txt",
                            "!ga.html"
                        ],
                        dest: "build/prod/"
                    }
                ]
            },
            ghPages: {
                options: {
                    process: function (content, srcpath) {
                        // Add Google Analytics code to index.html
                        content = content.replace("</body></html>",
                            grunt.file.read("src/static/ga.html") + "</body></html>");
                        return grunt.template.process(content, templateOptions);
                    }
                },
                src: "build/prod/index.html",
                dest: "build/prod/index.html"
            }
        },
        uglify: {
            options: {
                preserveComments: function (node, comment) {
                    if (comment.value.indexOf("* @license") === 0) return true;
                    return false;
                },
                screwIE8: true,
                ASCIIOnly: true,
                beautify: {
                    beautify: false,
                    inline_script: true, // eslint-disable-line camelcase
                    ascii_only: true, // eslint-disable-line camelcase
                    screw_ie8: true // eslint-disable-line camelcase
                },
                compress: {
                    screw_ie8: true // eslint-disable-line camelcase
                },
                banner: banner
            },
            prod: {
                src: "build/dev/scripts.js",
                dest: "build/prod/scripts.js"
            }
        },
        cssmin: {
            prod: {
                src: "build/dev/styles.css",
                dest: "build/prod/styles.css"
            }
        },
        htmlmin: {
            prod: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    minifyJS: true,
                    minifyCSS: true
                },
                src: "build/prod/index.html",
                dest: "build/prod/index.html"
            },
            inline: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    minifyJS: false,
                    minifyCSS: false
                },
                src: "build/prod/cyberchef.htm",
                dest: "build/prod/cyberchef.htm"
            }
        },
        inline: {
            options: {
                tag: "",
                inlineTagAttributes: {
                    js: "type='application/javascript'",
                    css: "type='text/css'"
                }
            },
            compiled: {
                src: "build/prod/cyberchef.htm",
                dest: "build/prod/cyberchef.htm"
            },
            prod: {
                options: {
                    tag: "__inline"
                },
                src: "build/prod/index.html",
                dest: "build/prod/index.html"
            }
        },
        chmod: {
            build: {
                options: {
                    mode: "755",
                },
                src: ["build/**/*", "build/**/.htaccess", "build/"]
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
        watch: {
            css: {
                files: ["src/web/css/**/*.css", "src/web/css/**/*.less"],
                tasks: ["webpack:web", "chmod:build"]
            },
            js: {
                files: "src/**/*.js",
                tasks: ["webpack:web", "chmod:build"]
            },
            html: {
                files: "src/web/html/**/*.html",
                tasks: ["copy:htmlDev", "chmod:build"]
            },
            static: {
                files: ["src/web/static/**/*", "src/web/static/**/.*"],
                tasks: ["copy:staticDev", "chmod:build"]
            },
            grunt: {
                files: "Gruntfile.js",
                tasks: ["clean:dev", "webpack:web", "copy:htmlDev", "copy:staticDev", "chmod:build"]
            }
        },
    });

};
