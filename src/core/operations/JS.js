import * as esprima from "esprima";
import escodegen from "escodegen";
import esmangle from "esmangle";


/**
 * JavaScript operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const JS = {

    /**
     * @constant
     * @default
     */
    PARSE_LOC: false,
    /**
     * @constant
     * @default
     */
    PARSE_RANGE: false,
    /**
     * @constant
     * @default
     */
    PARSE_TOKENS: false,
    /**
     * @constant
     * @default
     */
    PARSE_COMMENT: false,
    /**
     * @constant
     * @default
     */
    PARSE_TOLERANT: false,

    /**
     * JavaScript Parser operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runParse: function (input, args) {
        let parseLoc = args[0],
            parseRange = args[1],
            parseTokens = args[2],
            parseComment = args[3],
            parseTolerant = args[4],
            result = {},
            options = {
                loc:      parseLoc,
                range:    parseRange,
                tokens:   parseTokens,
                comment:  parseComment,
                tolerant: parseTolerant
            };

        result = esprima.parseScript(input, options);
        return JSON.stringify(result, null, 2);
    },


    /**
     * @constant
     * @default
     */
    BEAUTIFY_INDENT: "\\t",
    /**
     * @constant
     * @default
     */
    BEAUTIFY_QUOTES: ["Auto", "Single", "Double"],
    /**
     * @constant
     * @default
     */
    BEAUTIFY_SEMICOLONS: true,
    /**
     * @constant
     * @default
     */
    BEAUTIFY_COMMENT: true,

    /**
     * JavaScript Beautify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runBeautify: function(input, args) {
        let beautifyIndent = args[0] || JS.BEAUTIFY_INDENT,
            quotes = args[1].toLowerCase(),
            beautifySemicolons = args[2],
            beautifyComment = args[3],
            result = "",
            AST;

        try {
            AST = esprima.parseScript(input, {
                range: true,
                tokens: true,
                comment: true
            });

            const options = {
                format: {
                    indent: {
                        style: beautifyIndent
                    },
                    quotes: quotes,
                    semicolons: beautifySemicolons,
                },
                comment: beautifyComment
            };

            if (options.comment)
                AST = escodegen.attachComments(AST, AST.comments, AST.tokens);

            result = escodegen.generate(AST, options);
        } catch (e) {
            // Leave original error so the user can see the detail
            throw "Unable to parse JavaScript.<br>" + e.message;
        }
        return result;
    },


    /**
     * JavaScript Minify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runMinify: function(input, args) {
        let result = "",
            AST = esprima.parseScript(input),
            optimisedAST = esmangle.optimize(AST, null),
            mangledAST = esmangle.mangle(optimisedAST);

        result = escodegen.generate(mangledAST, {
            format: {
                renumber:    true,
                hexadecimal: true,
                escapeless:  true,
                compact:     true,
                semicolons:  false,
                parentheses: false
            }
        });
        return result;
    },

};

export default JS;
