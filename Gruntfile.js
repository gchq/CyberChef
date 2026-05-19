"use strict";

const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const glob = require("glob");
const path = require("path");
const os = require("os");

const nodeFlags = "--no-warnings --no-deprecation";

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
        ["clean:dev", "clean:config", "generateConfig", "concurrent:dev"]);

    grunt.registerTask("prod",
        "Creates a production-ready build. Use the --msg flag to add a compile message.",
        [
            "eslint", "clean:prod", "clean:config", "generateConfig", "findModules", "webpack:web",
            "copy:standalone", "zip:standalone", "clean:standalone", "calcDownloadHash", "chmod"
        ]);

    grunt.registerTask("node",
        "Compiles CyberChef into a single NodeJS module.",
        [
            "clean:node", "clean:config", "clean:nodeConfig", "generateConfig", "generateNodeIndex"
        ]);

    grunt.registerTask("configTests",
        "A task which configures config files in preparation for tests to be run. Use `npm test` to run tests.",
        [
            "clean:config", "clean:nodeConfig", "generateConfig", "generateNodeIndex"
        ]);

    grunt.registerTask("testui",
        "A task which runs all the UI tests in the tests directory. The prod task must already have been run.",
        ["connect:prod", "exec:browserTests"]);

    grunt.registerTask("testnodeconsumer",
        "A task which checks whether consuming CJS and ESM apps work with the CyberChef build",
        ["setupNodeConsumers", "exec:testCJSNodeConsumer", "exec:testESMNodeConsumer", "teardownNodeConsumers"]);

    grunt.registerTask("default",
        "Lints the code base",
        ["eslint", "repoSize"]);

    grunt.registerTask("lint", "eslint");

    grunt.registerTask("findModules",
        "Finds all generated modules and updates the entry point list for Webpack",
        function(arg1, arg2) {
            const moduleEntryPoints = listEntryModules();

            grunt.log.writeln(`Found ${Object.keys(moduleEntryPoints).length} modules.`);

            grunt.config.set("webpack.web.entry",
                Object.assign({
                    main: "./src/web/index.js"
                }, moduleEntryPoints));
        });


    // Load tasks provided by each plugin
    grunt.loadNpmTasks("grunt-eslint");
    grunt.loadNpmTasks("grunt-webpack");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-chmod");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-concurrent");
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-zip");


    // Project configuration
    const compileYear = grunt.template.today("UTC:yyyy"),
        compileTime = grunt.template.today("UTC:dd/mm/yyyy HH:MM:ss") + " UTC",
        pkg = grunt.file.readJSON("package.json"),
        webpackConfig = require("./webpack.config.js"),
        BUILD_CONSTANTS = {
            COMPILE_YEAR: JSON.stringify(compileYear),
            COMPILE_TIME: JSON.stringify(compileTime),
            COMPILE_MSG: JSON.stringify(grunt.option("compile-msg") || grunt.option("msg") || ""),
            PKG_VERSION: JSON.stringify(pkg.version),
        },
        moduleEntryPoints = listEntryModules(),
        nodeConsumerTestPath = path.join(os.tmpdir(), "tmp-cyberchef"),
        /**
         * Configuration for Webpack production build. Defined as a function so that it
         * can be recalculated when new modules are generated.
         */
        webpackProdConf = () => {
            return {
                mode: "production",
                target: "web",
                entry: Object.assign({
                    main: "./src/web/index.js"
                }, moduleEntryPoints),
                output: {
                    path: path.join(__dirname, "build", "prod"),
                    filename: chunkData => {
                        return chunkData.chunk.name === "main" ? "assets/[name].js": "[name].js";
                    },
                    globalObject: "this"
                },
                resolve: {
                    alias: {
                        "./config/modules/OpModules.mjs": "./config/modules/Default.mjs"
                    }
                },
                plugins: [
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
        };


    /**
     * Generates an entry list for all the modules.
     */
    function listEntryModules() {
        const entryModules = {};

        glob.sync("./src/core/config/modules/*.mjs").forEach(file => {
            const basename = path.basename(file);
            if (basename !== "Default.mjs" && basename !== "OpModules.mjs")
                entryModules["modules/" + basename.split(".mjs")[0]] = path.resolve(file);
        });

        return entryModules;
    }

    grunt.registerTask("calcDownloadHash", "Computes the SHA256 of the standalone zip and stamps it into index.html", function () {
        const crypto = require("crypto");
        const fs = require("fs");
        const zipPath = path.join("build", "prod", `CyberChef_v${pkg.version}.zip`);
        const digestPath = path.join("build", "prod", "sha256digest.txt");
        const indexPath = path.join("build", "prod", "index.html");
        const hash = crypto.createHash("sha256").update(fs.readFileSync(zipPath)).digest("hex");
        fs.writeFileSync(digestPath, hash);
        const html = fs.readFileSync(indexPath, "utf8").replace("DOWNLOAD_HASH_PLACEHOLDER", hash);
        fs.writeFileSync(indexPath, html);
    });

    grunt.registerTask("repoSize", "Reports tracked file count and repo size", function () {
        const { execSync } = require("child_process");
        const fs = require("fs");
        const fileCount = execSync("git ls-files", { encoding: "utf8" }).trim().split("\n").length;
        let bytes = 0;
        const walk = (dir) => {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                if (entry.name === ".git" || entry.name === "node_modules") continue;
                const p = path.join(dir, entry.name);
                if (entry.isDirectory()) walk(p);
                else if (entry.isFile()) bytes += fs.statSync(p).size;
            }
        };
        walk(".");
        const mb = (bytes / (1024 * 1024)).toFixed(1);
        grunt.log.writeln(`\n${fileCount}\ttracked files`);
        grunt.log.writeln(`${mb}M\trepository size`);
    });

    grunt.registerTask("generateConfig", "Regenerates operation config files", function () {
        const { execSync } = require("child_process");
        const fs = require("fs");
        grunt.log.writeln("\n--- Regenerating config files. ---");
        fs.writeFileSync(path.join("src", "core", "config", "OperationConfig.json"), "[]\n");
        execSync(`node ${nodeFlags} src/core/config/scripts/generateOpsIndex.mjs`, { stdio: "inherit" });
        execSync(`node ${nodeFlags} src/core/config/scripts/generateConfig.mjs`, { stdio: "inherit" });
        grunt.log.writeln("--- Config scripts finished. ---\n");
    });

    grunt.registerTask("generateNodeIndex", "Regenerates the node index", function () {
        const { execSync } = require("child_process");
        grunt.log.writeln("\n--- Regenerating node index ---");
        execSync(`node ${nodeFlags} src/node/config/scripts/generateNodeIndex.mjs`, { stdio: "inherit" });
        grunt.log.writeln("--- Node index generated. ---\n");
    });

    grunt.registerTask("setupNodeConsumers", "Sets up a temp dir for testing CJS/ESM consumers", function () {
        const fs = require("fs");
        const { execSync } = require("child_process");
        grunt.log.writeln("\n--- Testing node consumers ---");
        fs.mkdirSync(nodeConsumerTestPath, { recursive: true });
        fs.cpSync("tests/node/consumers", nodeConsumerTestPath, { recursive: true });
        execSync("npm link", { stdio: "inherit" });
        execSync("npm link cyberchef", { stdio: "inherit", cwd: nodeConsumerTestPath });
    });

    grunt.registerTask("teardownNodeConsumers", "Removes the consumer test temp dir", function () {
        require("fs").rmSync(nodeConsumerTestPath, { recursive: true, force: true });
        grunt.log.writeln("\n--- Node consumer tests complete ---");
    });

    grunt.initConfig({
        clean: {
            dev: ["build/dev/*"],
            prod: ["build/prod/*"],
            node: ["build/node/*"],
            config: ["src/core/config/OperationConfig.json", "src/core/config/modules/*", "src/code/operations/index.mjs"],
            nodeConfig: ["src/node/index.mjs", "src/node/config/OperationConfig.json"],
            standalone: ["build/prod/CyberChef*.html"]
        },
        eslint: {
            configs: ["*.{js,mjs}"],
            core: ["src/core/**/*.{js,mjs}", "!src/core/vendor/**/*", "!src/core/operations/legacy/**/*"],
            web: ["src/web/**/*.{js,mjs}", "!src/web/static/**/*"],
            node: ["src/node/**/*.{js,mjs}"],
            tests: ["tests/**/*.{js,mjs}"],
        },
        webpack: {
            options: webpackConfig,
            myConfig: webpackConfig,
            web: webpackProdConf(),
        },
        "webpack-dev-server": {
            options: webpackConfig,
            start: {
                mode: "development",
                target: "web",
                entry: Object.assign({
                    main: "./src/web/index.js"
                }, moduleEntryPoints),
                resolve: {
                    alias: {
                        "./config/modules/OpModules.mjs": "./config/modules/Default.mjs"
                    }
                },
                devServer: {
                    port: grunt.option("port") || 8080,
                    client: {
                        logging: "error",
                        overlay: true
                    },
                    hot: "only"
                },
                plugins: [
                    new webpack.DefinePlugin(BUILD_CONSTANTS),
                    new HtmlWebpackPlugin({
                        filename: "index.html",
                        template: "./src/web/html/index.html",
                        chunks: ["main"],
                        compileYear: compileYear,
                        compileTime: compileTime,
                        version: pkg.version,
                    })
                ]
            }
        },
        zip: {
            standalone: {
                cwd: "build/prod/",
                src: [
                    "build/prod/**/*",
                    "!build/prod/index.html",
                    "!build/prod/BundleAnalyzerReport.html",
                ],
                dest: `build/prod/CyberChef_v${pkg.version}.zip`
            }
        },
        connect: {
            prod: {
                options: {
                    port: grunt.option("port") || 8000,
                    base: "build/prod/"
                }
            }
        },
        copy: {
            ghPages: {
                options: {
                    process: function (content, srcpath) {
                        if (srcpath.indexOf("index.html") >= 0) {
                            // Add Google Analytics code to index.html
                            content = content.replace("</body></html>",
                                grunt.file.read("src/web/static/ga.html") + "</body></html>");

                            // Add Structured Data for SEO
                            content = content.replace("</head>",
                                "<script type='application/ld+json'>" +
                                JSON.stringify(JSON.parse(grunt.file.read("src/web/static/structuredData.json"))) +
                                "</script></head>");
                            return grunt.template.process(content, srcpath);
                        } else {
                            return content;
                        }
                    },
                    noProcess: ["**", "!**/*.html"]
                },
                files: [
                    {
                        src: ["build/prod/index.html"],
                        dest: "build/prod/index.html"
                    }
                ]
            },
            standalone: {
                options: {
                    process: function (content, srcpath) {
                        if (srcpath.indexOf("index.html") >= 0) {
                            // Replace download link with version number
                            content = content.replace(/<a [^>]+>Download CyberChef.+?<\/a>/,
                                `<span>Version ${pkg.version}</span>`);

                            return grunt.template.process(content, srcpath);
                        } else {
                            return content;
                        }
                    },
                    noProcess: ["**", "!**/*.html"]
                },
                files: [
                    {
                        src: ["build/prod/index.html"],
                        dest: `build/prod/CyberChef_v${pkg.version}.html`
                    }
                ]
            }
        },
        chmod: {
            build: {
                options: {
                    mode: "755",
                },
                src: ["build/**/*", "build/"]
            }
        },
        watch: {
            config: {
                files: ["src/core/operations/**/*", "!src/core/operations/index.mjs"],
                tasks: ["generateNodeIndex", "generateConfig"]
            }
        },
        concurrent: {
            dev: ["watch:config", "webpack-dev-server:start"],
            options: {
                logConcurrentOutput: true
            }
        },
        exec: {
            cleanGit: {
                command: "git gc --prune=now --aggressive"
            },
            sitemap: {
                command: `node ${nodeFlags} src/web/static/sitemap.mjs > build/prod/sitemap.xml`,
                sync: true
            },
            browserTests: {
                command: "./node_modules/.bin/nightwatch --env prod"
            },
            testCJSNodeConsumer: {
                command: `node ${nodeFlags} cjs-consumer.js`,
                cwd: nodeConsumerTestPath,
                stdout: false,
            },
            testESMNodeConsumer: {
                command: `node ${nodeFlags} esm-consumer.mjs`,
                cwd: nodeConsumerTestPath,
                stdout: false,
            },
            fixCryptoApiImports: {
                command: `node ${nodeFlags} src/core/config/scripts/fixCryptoApiImports.mjs`,
                stdout: false
            },
            fixSnackbarMarkup: {
                command: `node ${nodeFlags} src/core/config/scripts/fixSnackBarMarkup.mjs`,
                stdout: false
            },
        },
    });
};
