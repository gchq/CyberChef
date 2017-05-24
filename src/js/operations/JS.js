/* globals esprima, escodegen, esmangle */

/**
 * JavaScript operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var JS = {
    
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
    run_parse: function (input, args) {
        var parse_loc = args[0],
            parse_range = args[1],
            parse_tokens = args[2],
            parse_comment = args[3],
            parse_tolerant = args[4],
            result = {},
            options = {
                loc:      parse_loc,
                range:    parse_range,
                tokens:   parse_tokens,
                comment:  parse_comment,
                tolerant: parse_tolerant
            };
            
        result = esprima.parse(input, options);
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
    run_beautify: function(input, args) {
        var beautify_indent = args[0] || JS.BEAUTIFY_INDENT,
            quotes = args[1].toLowerCase(),
            beautify_semicolons = args[2],
            beautify_comment = args[3],
            result = "",
            AST;
            
        try {
            AST = esprima.parse(input, {
                range: true,
                tokens: true,
                comment: true
            });
            
            var options = {
                format: {
                    indent: {
                        style: beautify_indent
                    },
                    quotes: quotes,
                    semicolons: beautify_semicolons,
                },
                comment: beautify_comment
            };
            
            if (options.comment)
                AST = escodegen.attachComments(AST, AST.comments, AST.tokens);
                
            result = escodegen.generate(AST, options);
        } catch(e) {
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
    run_minify: function(input, args) {
        var result = "",
            AST = esprima.parse(input),
            optimised_AST = esmangle.optimize(AST, null),
            mangled_AST = esmangle.mangle(optimised_AST);
            
        result = escodegen.generate(mangled_AST, {
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
