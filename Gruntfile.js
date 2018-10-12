"use strict";

const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const NodeExternals = require("webpack-node-externals");
const Inliner = require("web-resource-inliner");
const glob = require("glob");
const path = require("path");
const UglifyJSWebpackPlugin = require("uglifyjs-webpack-plugin");

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
        ["clean", "exec:generateConfig", "exec:generateNodeIndex",  "webpack:node", "webpack:nodeRepl", "chmod:build"]);

    grunt.registerTask("test",
        "A task which runs all the tests in test/tests.",
        ["clean", "exec:generateConfig", "exec:generateNodeIndex",  "exec:generateConfig",  "exec:tests"]);

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
            config: ["src/core/config/OperationConfig.json", "src/core/config/modules/*", "src/code/operations/index.mjs", "src/node/index.mjs", "src/node/config/OperationConfig.json"],
            docs: ["docs/*", "!docs/*.conf.json", "!docs/*.ico", "!docs/*.png"],
            inlineScripts: ["build/prod/scripts.js"],
        },
        eslint: {
            options: {
                configFile: "./.eslintrc.json"
            },
            configs: ["Gruntfile.js"],
            core: ["src/core/**/*.{js,mjs}", "!src/core/vendor/**/*", "!src/core/operations/legacy/**/*"],
            web: ["src/web/**/*.{js,mjs}"],
            node: ["src/node/**/*.{js,mjs}"],
            tests: ["test/**/*.{js,mjs}"],
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
            web: {
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
                ]
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
            tests: {
                mode: "development",
                target: "node",
                entry: "./test/index.mjs",
                externals: [NodeExternals()],
                output: {
                    filename: "index.js",
                    path: __dirname + "/build/test"
                },
                plugins: [
                    new webpack.DefinePlugin(BUILD_CONSTANTS)
                ]
            },
            node: {
                mode: "production",
                target: "node",
                entry: "./src/node/index.mjs",
                externals: [NodeExternals({
                    whitelist: ["crypto-api/src/crypto-api"]
                })],
                output: {
                    filename: "CyberChef.js",
                    path: __dirname + "/build/node",
                    library: "CyberChef",
                    libraryTarget: "commonjs2"
                },
                plugins: [
                    new webpack.DefinePlugin(BUILD_CONSTANTS)
                ],
                // Need to preserve property names for bake, search
                optimization: {
                    minimizer: [
                        new UglifyJSWebpackPlugin({
                            uglifyOptions: {
                                mangle: false,
                            }
                        })
                    ]
                },
            },
            nodeRepl: {
                mode: "production",
                target: "node",
                entry: "./src/node/repl-index.mjs",
                externals: [NodeExternals({
                    whitelist: ["crypto-api/src/crypto-api"]
                })],
                output: {
                    filename: "CyberChef-repl.js",
                    path: __dirname + "/build/node",
                    library: "CyberChef",
                    libraryTarget: "commonjs2"
                },
                plugins: [
                    new webpack.DefinePlugin(BUILD_CONSTANTS)
                ],
                // Need to preserve property names for bake, search
                optimization: {
                    minimizer: [
                        new UglifyJSWebpackPlugin({
                            uglifyOptions: {
                                mangle: false,
                            }
                        })
                    ]
                }
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
                tasks: ["exec:generateNodeIndex", "exec:generateConfig"]
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
                    // "node --experimental-modules src/core/config/scripts/generateOpsIndex.mjs",
                    "mkdir -p src/core/config/modules",
                    "echo 'export default {};\n' > src/core/config/modules/OpModules.mjs",
                    "echo '[]\n' > src/core/config/OperationConfig.json",
                    "node --experimental-modules --no-warnings --no-deprecation src/core/config/scripts/generateOpsIndex.mjs",
                    "node --experimental-modules --no-warnings --no-deprecation src/core/config/scripts/generateConfig.mjs",
                    "echo '--- Config scripts finished. ---\n'"
                ].join(";")
            },
            generateNodeIndex: {
                command: [
                    "echo '\n--- Regenerating node index ---'",
                    // Why copy and wipe OperationConfig?
                    // OperationConfig.json needs to be empty for build to avoid circular dependency on DetectFileType.
                    // We copy it to node dir so that we can use it as a search corpus in chef.help.
                    "echo 'Copying OperationConfig.json and wiping original'",
                    "cp src/core/config/OperationConfig.json src/node/config/OperationConfig.json",
                    "echo 'export default {};\n' > src/core/config/modules/OpModules.mjs",
                    "echo '[]\n' > src/core/config/OperationConfig.json",
                    "echo '\n OperationConfig.json copied to src/node/config. Modules wiped.'",

                    "node --experimental-modules src/node/config/scripts/generateNodeIndex.mjs",
                    "echo '--- Node index generated. ---\n'"
                ].join(";"),
            },
            tests: {
                command: "node --experimental-modules --no-warnings --no-deprecation test/index.mjs"
            }
        },
    });
};
