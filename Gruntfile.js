const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Inliner = require("web-resource-inliner");

/**
 * Grunt configuration for building the app in various formats.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

module.exports = function (grunt) {
    grunt.file.defaultEncoding = "utf8";
    grunt.file.preserveBOM = false;

    // Tasks
    grunt.registerTask("dev",
        "A persistent task which creates a development build whenever source files are modified.",
        ["clean:dev", "webpack-dev-server:start"]);

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
        ["eslint", "clean:prod", "webpack:web", "inline", "chmod"]);

    grunt.registerTask("default",
        "Lints the code base",
        ["eslint", "exec:repoSize"]);

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
    grunt.loadNpmTasks("grunt-accessibility");


    // Project configuration
    const compileTime = grunt.template.today("UTC:dd/mm/yyyy HH:MM:ss") + " UTC",
        pkg = grunt.file.readJSON("package.json"),
        webpackConfig = require("./webpack.config.js"),
        BUILD_CONSTANTS = {
            COMPILE_TIME: JSON.stringify(compileTime),
            COMPILE_MSG: JSON.stringify(grunt.option("compile-msg") || grunt.option("msg") || ""),
            PKG_VERSION: JSON.stringify(pkg.version)
        };

    /**
     * Compiles a production build of CyberChef into a single, portable web page.
     */
    function runInliner() {
        const done = this.async();
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
                if (error instanceof Error) {
                    done(error);
                } else {
                    done(new Error(error));
                }
            } else {
                grunt.file.write("build/prod/cyberchef.htm", result);
                done(true);
            }
        });
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
                configFile: "./.eslintrc.json"
            },
            configs: ["Gruntfile.js"],
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
        accessibility: {
            options: {
                accessibilityLevel: "WCAG2A",
                verbose: false,
                ignore: [
                    "WCAG2A.Principle1.Guideline1_3.1_3_1.H42.2"
                ]
            },
            test: {
                src: ["build/**/*.html"]
            }
        },
        webpack: {
            options: webpackConfig,
            web: {
                target: "web",
                entry: "./src/web/index.js",
                output: {
                    filename: "scripts.js",
                    path: __dirname + "/build/prod"
                },
                plugins: [
                    new webpack.DefinePlugin(BUILD_CONSTANTS),
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
                        version: pkg.version,
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
                        version: pkg.version,
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
            tests: {
                target: "node",
                entry: "./test/index.js",
                output: {
                    filename: "index.js",
                    path: __dirname + "/build/test"
                }
            },
            node: {
                target: "node",
                entry: "./src/node/index.js",
                output: {
                    filename: "CyberChef.js",
                    path: __dirname + "/build/node",
                    library: "CyberChef",
                    libraryTarget: "commonjs2"
                }
            }
        },
        "webpack-dev-server": {
            options: {
                webpack: webpackConfig,
                stats: {
                    children: false,
                    warningsFilter: /source-map/
                },
            },
            start: {
                webpack: {
                    target: "web",
                    entry: "./src/web/index.js",
                    plugins: [
                        new webpack.DefinePlugin(BUILD_CONSTANTS),
                        new HtmlWebpackPlugin({
                            filename: "index.html",
                            template: "./src/web/html/index.html",
                            compileTime: compileTime,
                            version: pkg.version,
                        })
                    ]
                }
            }
        },
        copy: {
            ghPages: {
                options: {
                    process: function (content) {
                        // Add Google Analytics code to index.html
                        content = content.replace("</body></html>",
                            grunt.file.read("src/web/static/ga.html") + "</body></html>");
                        return grunt.template.process(content);
                    }
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
            cleanGit: {
                command: "git gc --prune=now --aggressive"
            },
        },
        execute: {
            test: "build/test/index.js"
        },
    });
};
