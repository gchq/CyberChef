/* eslint-env node */

module.exports = function(grunt) {
    grunt.file.defaultEncoding = "utf8";
    grunt.file.preserveBOM = false;

    // Tasks
    grunt.registerTask("dev",
        "A persistent task which creates a development build whenever source files are modified.",
        ["clean:dev", "concat:css", "concat:js", "copy:html_dev", "copy:static_dev", "chmod:build", "watch"]);

    grunt.registerTask("prod",
        "Creates a production-ready build. Use the --msg flag to add a compile message.",
        ["eslint", "exec:stats", "clean", "jsdoc", "concat", "copy:html_dev", "copy:html_prod", "copy:html_inline",
         "copy:static_dev", "copy:static_prod", "cssmin", "uglify:prod", "inline", "htmlmin", "chmod"]);

    grunt.registerTask("docs",
        "Compiles documentation in the /docs directory.",
        ["clean:docs", "jsdoc", "chmod:docs"]);

    grunt.registerTask("stats",
        "Provides statistics about the code base such as how many lines there are as well as details of file sizes before and after compression.",
        ["concat:js", "uglify:prod", "exec:stats", "exec:repo_size", "exec:display_stats"]);

    grunt.registerTask("release",
        "Prepares and deploys a production version of CyberChef to the gh-pages branch.",
        ["copy:gh_pages", "exec:deploy_gh_pages"]);

    grunt.registerTask("default",
        "Lints the code base and shows stats",
        ["jshint", "exec:stats", "exec:display_stats"]);

    grunt.registerTask("doc", "docs");
    grunt.registerTask("lint", "eslint");


    // Load tasks provided by each plugin
    grunt.loadNpmTasks("grunt-eslint");
    grunt.loadNpmTasks("grunt-jsdoc");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-htmlmin");
    grunt.loadNpmTasks("grunt-inline-alt");
    grunt.loadNpmTasks("grunt-chmod");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-contrib-watch");


    // JS includes
    var js_files = [
        // Third party framework libraries
        "src/js/lib/jquery-2.1.1.js",
        "src/js/lib/bootstrap-3.3.6.js",
        "src/js/lib/split.js",
        "src/js/lib/bootstrap-switch.js",
        "src/js/lib/yahoo.js",
        "src/js/lib/snowfall.jquery.js",

        // Third party operation libraries
        "src/js/lib/cryptojs/core.js",
        "src/js/lib/cryptojs/x64-core.js",
        "src/js/lib/cryptojs/enc-base64.js",
        "src/js/lib/cryptojs/enc-utf16.js",
        "src/js/lib/cryptojs/md5.js",
        "src/js/lib/cryptojs/evpkdf.js",
        "src/js/lib/cryptojs/cipher-core.js",
        "src/js/lib/cryptojs/mode-cfb.js",
        "src/js/lib/cryptojs/mode-ctr-gladman.js",
        "src/js/lib/cryptojs/mode-ctr.js",
        "src/js/lib/cryptojs/mode-ecb.js",
        "src/js/lib/cryptojs/mode-ofb.js",
        "src/js/lib/cryptojs/format-hex.js",
        "src/js/lib/cryptojs/lib-typedarrays.js",
        "src/js/lib/cryptojs/pad-ansix923.js",
        "src/js/lib/cryptojs/pad-iso10126.js",
        "src/js/lib/cryptojs/pad-iso97971.js",
        "src/js/lib/cryptojs/pad-nopadding.js",
        "src/js/lib/cryptojs/pad-zeropadding.js",
        "src/js/lib/cryptojs/aes.js",
        "src/js/lib/cryptojs/hmac.js",
        "src/js/lib/cryptojs/rabbit-legacy.js",
        "src/js/lib/cryptojs/rabbit.js",
        "src/js/lib/cryptojs/ripemd160.js",
        "src/js/lib/cryptojs/sha1.js",
        "src/js/lib/cryptojs/sha256.js",
        "src/js/lib/cryptojs/sha224.js",
        "src/js/lib/cryptojs/sha512.js",
        "src/js/lib/cryptojs/sha384.js",
        "src/js/lib/cryptojs/sha3.js",
        "src/js/lib/cryptojs/tripledes.js",
        "src/js/lib/cryptojs/rc4.js",
        "src/js/lib/cryptojs/pbkdf2.js",
        "src/js/lib/jsbn/jsbn.js",
        "src/js/lib/jsbn/jsbn2.js",
        "src/js/lib/jsbn/base64.js",
        "src/js/lib/jsbn/ec.js",
        "src/js/lib/jsbn/prng4.js",
        "src/js/lib/jsbn/rng.js",
        "src/js/lib/jsbn/rsa.js",
        "src/js/lib/jsbn/sec.js",
        "src/js/lib/jsrasign/asn1-1.0.js",
        "src/js/lib/jsrasign/asn1hex-1.1.js",
        "src/js/lib/jsrasign/asn1x509-1.0.js",
        "src/js/lib/jsrasign/base64x-1.1.js",
        "src/js/lib/jsrasign/crypto-1.1.js",
        "src/js/lib/jsrasign/dsa-modified-1.0.js",
        "src/js/lib/jsrasign/ecdsa-modified-1.0.js",
        "src/js/lib/jsrasign/ecparam-1.0.js",
        "src/js/lib/jsrasign/keyutil-1.0.js",
        "src/js/lib/jsrasign/x509-1.1.js",
        "src/js/lib/blowfish.dojo.js",
        "src/js/lib/rawdeflate.js",
        "src/js/lib/rawinflate.js",
        "src/js/lib/zip.js",
        "src/js/lib/unzip.js",
        "src/js/lib/zlib_and_gzip.js",
        "src/js/lib/bzip2.js",
        "src/js/lib/punycode.js",
        "src/js/lib/uas_parser.js",
        "src/js/lib/esprima.js",
        "src/js/lib/escodegen.browser.js",
        "src/js/lib/esmangle.min.js",
        "src/js/lib/diff.js",
        "src/js/lib/moment.js",
        "src/js/lib/moment-timezone.js",
        "src/js/lib/prettify.js",
        "src/js/lib/vkbeautify.js",
        "src/js/lib/Sortable.js",
        "src/js/lib/bootstrap-colorpicker.js",
        "src/js/lib/xpath.js",
        
        // Custom libraries
        "src/js/lib/canvas_components.js",

        // Utility functions
        "src/js/core/Utils.js",

        // Operation objects
        "src/js/operations/*.js",

        // Core framework objects
        "src/js/core/*.js",
        "src/js/config/Categories.js",
        "src/js/config/OperationConfig.js",

        // HTML view objects
        "src/js/views/html/*.js",
        "!src/js/views/html/main.js",

        // Start the app!
        "src/js/views/html/main.js",
    ];

    var banner = '/**\n\
 * CyberChef - The Cyber Swiss Army Knife\n\
 *\n\
 * @copyright Crown Copyright 2016\n\
 * @license Apache-2.0\n\
 *\n\
 *   Copyright 2016 Crown Copyright\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the "License");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an "AS IS" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n';

    var template_options = {
        data: {
            compile_msg: grunt.option("compile-msg") || grunt.option("msg") || "",
            codebase_stats: grunt.file.read("src/static/stats.txt").split("\n").join("<br>")
        }
    };

    // Project configuration
    grunt.initConfig({
        eslint: {
            options: {
                configFile: "src/js/.eslintrc.json"
            },
            gruntfile: ["Gruntfile.js"],
            core: ["src/js/core/**/*.js"],
            config: ["src/js/config/**/*.js"],
            views: ["src/js/views/**/*.js"],
            operations: ["src/js/operations/**/*.js"],
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
                    "src/js/**/*.js",
                    "!src/js/lib/**/*",
                ],
            }
        },
        clean: {
            dev: ["build/dev/*"],
            prod: ["build/prod/*"],
            docs: ["docs/*", "!docs/*.conf.json", "!docs/*.ico"],
        },
        concat: {
            options: {
                process: template_options
            },
            css: {
                options: {
                    banner: banner.replace(/\/\*\*/g, "/*!"),
                    process: function(content, srcpath) {
                        // Change special comments from /** to /*! to comply with cssmin
                        content = content.replace(/^\/\*\* /g, "/*! ");
                        return grunt.template.process(content);
                    }
                },
                src: [
                    "src/css/lib/**/*.css",
                    "src/css/structure/**/*.css",
                    "src/css/themes/classic.css"
                ],
                dest: "build/dev/styles.css"
            },
            js: {
                options: {
                    banner: '"use strict";\n'
                },
                src: js_files,
                dest: "build/dev/scripts.js"
            }
        },
        copy: {
            html_dev: {
                options: {
                    process: function(content, srcpath) {
                        return grunt.template.process(content, template_options);
                    }
                },
                src: "src/html/index.html",
                dest: "build/dev/index.html"
            },
            html_prod: {
                options: {
                    process: function(content, srcpath) {
                        return grunt.template.process(content, template_options);
                    }
                },
                src: "src/html/index.html",
                dest: "build/prod/index.html"
            },
            html_inline: {
                options: {
                    process: function(content, srcpath) {
                        // TODO: Do all this in Jade
                        content = content.replace(
                            '<a href="cyberchef.htm" style="float: left; margin-left: 10px; margin-right: 80px;" download>Download CyberChef<img src="images/download-24x24.png" /></a>',
                            '<span style="float: left; margin-left: 10px;">Compile time: ' + grunt.template.today("dd/mm/yyyy HH:MM:ss") + " UTC</span>");
                        return grunt.template.process(content, template_options);
                    }
                },
                src: "src/html/index.html",
                dest: "build/prod/cyberchef.htm"
            },
            static_dev: {
                files: [
                    {
                        expand: true,
                        cwd: "src/static/",
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
            static_prod: {
                files: [
                    {
                        expand: true,
                        cwd: "src/static/",
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
            gh_pages: {
                options: {
                    process: function(content, srcpath) {
                        // Add Google Analytics code to index.html
                        content = content.replace("</body></html>",
                            grunt.file.read("src/static/ga.html") + "</body></html>");
                        return grunt.template.process(content, template_options);
                    }
                },
                src: "build/prod/index.html",
                dest: "build/prod/index.html"
            }
        },
        uglify: {
            options: {
                preserveComments: function(node, comment) {
                    if (comment.value.indexOf("* @license") === 0) return true;
                    return false;
                },
                screwIE8: true,
                ASCIIOnly: true,
                beautify: {
                    beautify: false,
                    inline_script: true,
                    ascii_only: true,
                    screw_ie8: true
                },
                compress: {
                    screw_ie8: true
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
            repo_size: {
                command: [
                    "git ls-files | wc -l | xargs printf '\n%b\ttracked files\n'",
                    "du -hs | egrep -o '^[^\t]*' | xargs printf '%b\trepository size\n'"
                ].join(";"),
                stderr: false
            },
            stats: {
                command: "rm src/static/stats.txt;" +
                    [
                        "ls src/ -R1 | grep '^$' -v | grep ':$' -v | wc -l | xargs printf '%b\tsource files\n'",
                        "find src/ -regex '.*\..*' -print | xargs cat | wc -l | xargs printf '%b\tlines\n'",
                        "du -hs src/ | pcregrep -o '^[^\t]*' | xargs printf '%b\tsize\n'",

                        "ls src/js/ -R1 | grep '\.js$' | wc -l | xargs printf '\n%b\tJavaScript source files\n'",
                        "find src/js/ -regex '.*\.js' -print | xargs cat | wc -l | xargs printf '%b\tlines\n'",
                        "find src/js/ -regex '.*\.js' -exec du -hcs {} \+ | tail -n1 | egrep -o '^[^\t]*' | xargs printf '%b\tsize\n'",

                        "find src/js/ -regex '.*/lib/.*\.js' -print | wc -l | xargs printf '\n%b\tthird party JavaScript source files\n'",
                        "find src/js/ -regex '.*/lib/.*\.js' -print | xargs cat | wc -l | xargs printf '%b\tlines\n'",
                        "find src/js/ -regex '.*/lib/.*\.js' -exec du -hcs {} \+ | tail -n1 | egrep -o '^[^\t]*' | xargs printf '%b\tsize\n'",

                        "find src/js/ -regex '.*\.js' -not -regex '.*/lib/.*' -print | wc -l | xargs printf '\n%b\tfirst party JavaScript source files\n'",
                        "find src/js/ -regex '.*\.js' -not -regex '.*/lib/.*' -print | xargs cat | wc -l | xargs printf '%b\tlines\n'",
                        "find src/js/ -regex '.*\.js' -not -regex '.*/lib/.*' -exec du -hcs {} \+ | tail -n1 | egrep -o '^[^\t]*' | xargs printf '%b\tsize\n'",

                        "du build/dev/scripts.js -h | egrep -o '^[^\t]*' | xargs printf '\n%b\tuncompressed JavaScript size\n'",
                        "du build/prod/scripts.js -h | egrep -o '^[^\t]*' | xargs printf '%b\tcompressed JavaScript size\n'",

                        "grep -E '^\\s+name: ' src/js/config/Categories.js | wc -l | xargs printf '\n%b\tcategories\n'",
                        "grep -E '^\\s+\"[A-Za-z0-9 \\-]+\": {' src/js/config/OperationConfig.js | wc -l | xargs printf '%b\toperations\n'",

                    ].join(" >> src/static/stats.txt;") + " >> src/static/stats.txt;",
                stderr: false
            },
            display_stats: {
                command: "cat src/static/stats.txt"
            },
            clean_git: {
                command: "git gc --prune=now --aggressive"
            },
            deploy_gh_pages: {
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
        watch: {
            css: {
                files: "src/css/**/*.css",
                tasks: ["concat:css", "chmod:build"]
            },
            js: {
                files: "src/js/**/*.js",
                tasks: ["concat:js", "chmod:build"]
            },
            html: {
                files: "src/html/**/*.html",
                tasks: ["copy:html_dev", "chmod:build"]
            },
            static: {
                files: ["src/static/**/*", "src/static/**/.*"],
                tasks: ["copy:static_dev", "chmod:build"]
            },
            grunt: {
                files: "Gruntfile.js",
                tasks: ["clean:dev", "concat:css", "concat:js", "copy:html_dev", "copy:static_dev", "chmod:build"]
            }
        },
    });

};
