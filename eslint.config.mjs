import babelParser from "@babel/eslint-parser";
import jsdoc from "eslint-plugin-jsdoc";
import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            parser: babelParser,
            parserOptions: {
                ecmaVersion: 2022,
                ecmaFeatures: {
                    impliedStrict: true
                },
                sourceType: "module",
                allowImportExportEverywhere: true
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es6,
                "$": false,
                "jQuery": false,
                "log": false,
                "app": false,

                "COMPILE_TIME": false,
                "COMPILE_MSG": false,
                "PKG_VERSION": false
            },
        },
        ignores: ["src/core/vendor/**"],
        plugins: {
            jsdoc
        },
        rules: {
            // enable additional rules
            "no-eval": "error",
            "no-implied-eval": "error",
            "dot-notation": "error",
            "eqeqeq": ["error", "smart"],
            "no-caller": "error",
            "no-extra-bind": "error",
            "no-unused-expressions": "error",
            "no-useless-call": "error",
            "no-useless-return": "error",
            "radix": "warn",

            // modify rules from base configurations
            "no-unused-vars": ["error", {
                "args": "none",
                "vars": "all",
                "caughtErrors": "none"
            }],
            "no-empty": ["error", {
                "allowEmptyCatch": true
            }],

            // disable rules from base configurations
            "no-control-regex": "off",
            "require-atomic-updates": "off",
            "no-async-promise-executor": "off",

            // stylistic conventions
            "brace-style": ["error", "1tbs"],
            "space-before-blocks": ["error", "always"],
            "block-spacing": "error",
            "array-bracket-spacing": "error",
            "comma-spacing": "error",
            "spaced-comment": ["error", "always", { "exceptions": ["/"] }],
            "comma-style": "error",
            "computed-property-spacing": "error",
            "no-trailing-spaces": "warn",
            "eol-last": "error",
            "func-call-spacing": "error",
            "key-spacing": ["warn", {
                "mode": "minimum"
            }],
            "indent": ["error", 4, {
                "ignoreComments": true,
                "ArrayExpression": "first",
                "SwitchCase": 1
            }],
            "linebreak-style": ["error", "unix"],
            "quotes": ["error", "double", {
                "avoidEscape": true,
                "allowTemplateLiterals": true
            }],
            "camelcase": ["error", {
                "properties": "always"
            }],
            "semi": ["error", "always"],
            "unicode-bom": "error",
            "jsdoc/require-jsdoc": ["error", {
                "require": {
                    "FunctionDeclaration": true,
                    "MethodDefinition": true,
                    "ClassDeclaration": true,
                    "ArrowFunctionExpression": false
                }
            }],
            "keyword-spacing": ["error", {
                "before": true,
                "after": true
            }],
            "no-multiple-empty-lines": ["warn", {
                "max": 2,
                "maxEOF": 1,
                "maxBOF": 0
            }],
            "no-whitespace-before-property": "error",
            "operator-linebreak": ["error", "after"],
            "space-in-parens": "error",
            "no-var": "error",
            "prefer-const": "error",
            "no-console": "error"
        },
    },
    // File-pattern specific overrides
    {
        files: ["tests/**/*"],
        rules: {
            "no-unused-expressions": "off",
            "no-console": "off"
        }
    },
];
