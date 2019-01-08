"use strict";

const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const NodeExternals = require("webpack-node-externals");
const Inliner = require("web-resource-inliner");
const glob = require("glob");
const path = require("path");

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
        ["clean:dev", "clean:config", "exec:generateConfig", "concurrent:dev"]);

    grunt.registerTask("node",
        "Compiles CyberChef into a single NodeJS module.",
        ["clean:node", "clean:config", "exec:generateConfig", "webpack:node", "chmod:build"]);

    grunt.registerTask("test",
        "A task which runs all the operation tests in the tests directory.",
        ["exec:generateConfig", "exec:opTests"]);

    grunt.registerTask("testui",
        "A task which runs all the UI tests in the tests directory. The prod task must already have been run.",
        ["connect:prod", "exec:browserTests"]);

    grunt.registerTask("docs",
        "Compiles documentation in the /docs directory.",
        ["clean:docs", "jsdoc", "chmod:docs"]);

    grunt.registerTask("prod",
        "Creates a production-ready build. Use the --msg flag to add a compile message.",
        ["eslint", "clean:prod", "clean:config", "exec:generateConfig", "webpack:web", "inline", "chmod"]);

    grunt.registerTask("default",
        "Lints the code base",
        ["eslint", "exec:repoSize"]);

    grunt.registerTask("inline",
        "Compiles a production build of CyberChef into a single, portable web page.",
        ["exec:generateConfig", "webpack:webInline", "runInliner", "clean:inlineScripts"]);


    grunt.registerTask("runInliner", runInliner);
    grunt.registerTask("doc", "docs");
    grunt.registerTask("tests", "test");
    grunt.registerTask("lint", "eslint");


    // Load tasks provided by each plugin
    grunt.loadNpmTasks("grunt-eslint");
    grunt.loadNpmTasks("grunt-webpack");
    grunt.loadNpmTasks("grunt-jsdoc");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-chmod");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-accessibility");
    grunt.loadNpmTasks("grunt-concurrent");
    grunt.loadNpmTasks("grunt-contrib-connect");


    // Project configuration
    const compileTime = grunt.template.today("UTC:dd/mm/yyyy HH:MM:ss") + " UTC",
        pkg = grunt.file.readJSON("package.json"),
        webpackConfig = require("./webpack.config.js"),
        BUILD_CONSTANTS = {
            COMPILE_TIME: JSON.stringify(compileTime),
            COMPILE_MSG: JSON.stringify(grunt.option("compile-msg") || grunt.option("msg") || ""),
            PKG_VERSION: JSON.stringify(pkg.version),
            ENVIRONMENT_IS_WORKER: function() {
                return typeof importScripts === "function";
            },
            ENVIRONMENT_IS_NODE: function() {
                return typeof process === "object" && typeof require === "function";
            },
            ENVIRONMENT_IS_WEB: function() {
                return typeof window === "object";
            }
        },
        moduleEntryPoints = listEntryModules();

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

    /**
     * Generates an entry list for all the modules.
     */
    function listEntryModules() {
        const entryModules = {};

        glob.sync("./src/core/config/modules/*.mjs").forEach(file => {
            const basename = path.basename(file);
            if (basename !== "Default.mjs" && basename !== "OpModules.mjs")
                entryModules[basename.split(".mjs")[0]] = path.resolve(file);
        });

        return entryModules;
    }

    grunt.initConfig({
        clean: {
            dev: ["build/dev/*"],
            prod: ["build/prod/*"],
            node: ["build/node/*"],
            config: ["src/core/config/OperationConfig.json", "src/core/config/modules/*", "src/code/operations/index.mjs"],
            docs: ["docs/*", "!docs/*.conf.json", "!docs/*.ico", "!docs/*.png"],
            inlineScripts: ["build/prod/scripts.js"],
        },
        eslint: {
            options: {
                configFile: "./.eslintrc.json"
            },
            configs: ["*.{js,mjs}"],
            core: ["src/core/**/*.{js,mjs}", "!src/core/vendor/**/*", "!src/core/operations/legacy/**/*"],
            web: ["src/web/**/*.{js,mjs}"],
            node: ["src/node/**/*.{js,mjs}"],
            tests: ["tests/**/*.{js,mjs}"],
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
                    "src/**/*.mjs",
                    "!src/core/vendor/**/*"
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
            web: () => {
                return {
                    mode: "production",
                    target: "web",
                    entry: Object.assign({
                        main: "./src/web/index.js",
                        sitemap: "./src/web/static/sitemap.js"
                    }, moduleEntryPoints),
                    output: {
                        path: __dirname + "/build/prod"
                    },
                    resolve: {
                        alias: {
                            "./config/modules/OpModules": "./config/modules/Default"
                        }
                    },
                    plugins: [
                        new webpack.DefinePlugin(BUILD_CONSTANTS),
                        new HtmlWebpackPlugin({
                            filename: "index.html",
                            template: "./src/web/html/index.html",
                            chunks: ["main"],
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
            },
            webInline: {
                mode: "production",
                target: "web",
                entry: "./src/web/index.js",
                output: {
                    filename: "scripts.js",
                    path: __dirname + "/build/prod"
                },
                plugins: [
                    new webpack.DefinePlugin(Object.assign({}, BUILD_CONSTANTS, {
                        INLINE: "true"
                    })),
                    new HtmlWebpackPlugin({
                        filename: "cyberchef.htm",
                        template: "./src/web/html/index.html",
                        compileTime: compileTime,
                        version: pkg.version + "s",
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
            node: {
                mode: "production",
                target: "node",
                entry: "./src/node/index.mjs",
                externals: [NodeExternals()],
                output: {
                    filename: "CyberChef.js",
                    path: __dirname + "/build/node",
                    library: "CyberChef",
                    libraryTarget: "commonjs2"
                },
                plugins: [
                    new webpack.DefinePlugin(BUILD_CONSTANTS)
                ]
            }
        },
        "webpack-dev-server": {
            options: {
                webpack: webpackConfig,
                host: "0.0.0.0",
                disableHostCheck: true,
                overlay: true,
                inline: false,
                clientLogLevel: "error",
                stats: {
                    children: false,
                    chunks: false,
                    modules: false,
                    entrypoints: false,
                    warningsFilter: [
                        /source-map/,
                        /dependency is an expression/,
                        /export 'default'/
                    ],
                }
            },
            start: {
                webpack: {
                    mode: "development",
                    target: "web",
                    entry: Object.assign({
                        main: "./src/web/index.js"
                    }, moduleEntryPoints),
                    resolve: {
                        alias: {
                            "./config/modules/OpModules": "./config/modules/Default"
                        }
                    },
                    plugins: [
                        new webpack.DefinePlugin(BUILD_CONSTANTS),
                        new HtmlWebpackPlugin({
                            filename: "index.html",
                            template: "./src/web/html/index.html",
                            chunks: ["main"],
                            compileTime: compileTime,
                            version: pkg.version,
                        })
                    ]
                }
            }
        },
        connect: {
            prod: {
                options: {
                    port: 8000,
                    base: "build/prod/"
                }
            }
        },
        copy: {
            ghPages: {
                options: {
                    process: function (content, srcpath) {
                        // Add Google Analytics code to index.html
                        if (srcpath.indexOf("index.html") >= 0) {
                            content = content.replace("</body></html>",
                                grunt.file.read("src/web/static/ga.html") + "</body></html>");
                            return grunt.template.process(content, srcpath);
                        } else {
                            return content;
                        }
                    },
                    noProcess: ["**", "!**/*.html"]
                },
                files: [
                    {
                        src: "build/prod/index.html",
                        dest: "build/prod/index.html"
                    },
                    {
                        expand: true,
                        src: "docs/**",
                        dest: "build/prod/"
                    },
                ]
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
        watch: {
            config: {
                files: ["src/core/operations/**/*", "!src/core/operations/index.mjs"],
                tasks: ["exec:generateConfig"]
            }
        },
        concurrent: {
            dev: ["watch:config", "webpack-dev-server:start"],
            options: {
                logConcurrentOutput: true
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
            sitemap: {
                command: "node build/prod/sitemap.js > build/prod/sitemap.xml"
            },
            generateConfig: {
                command: [
                    "echo '\n--- Regenerating config files. ---'",
                    "mkdir -p src/core/config/modules",
                    "echo 'export default {};\n' > src/core/config/modules/OpModules.mjs",
                    "echo '[]\n' > src/core/config/OperationConfig.json",
                    "node --experimental-modules --no-warnings --no-deprecation src/core/config/scripts/generateOpsIndex.mjs",
                    "node --experimental-modules --no-warnings --no-deprecation src/core/config/scripts/generateConfig.mjs",
                    "echo '--- Config scripts finished. ---\n'"
                ].join(";")
            },
            opTests: {
                command: "node --experimental-modules --no-warnings --no-deprecation tests/operations/index.mjs"
            },
            browserTests: {
                command: "./node_modules/.bin/nightwatch --env prod,inline"
            }
        },
    });
};
