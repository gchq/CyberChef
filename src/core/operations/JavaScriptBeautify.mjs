/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import escodegen from "escodegen";
import * as esprima from "esprima";

/**
 * JavaScript Beautify operation
 */
class JavaScriptBeautify extends Operation {

    /**
     * JavaScriptBeautify constructor
     */
    constructor() {
        super();

        this.name = "JavaScript Beautify";
        this.module = "Code";
        this.description = "Parses and pretty prints valid JavaScript code. Also works with JavaScript Object Notation (JSON).";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Indent string",
                "type": "binaryShortString",
                "value": "\\t"
            },
            {
                "name": "Quotes",
                "type": "option",
                "value": ["Auto", "Single", "Double"]
            },
            {
                "name": "Semicolons before closing braces",
                "type": "boolean",
                "value": true
            },
            {
                "name": "Include comments",
                "type": "boolean",
                "value": true
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const beautifyIndent = args[0] || "\\t",
            quotes = args[1].toLowerCase(),
            [,, beautifySemicolons, beautifyComment] = args;
        let result = "",
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
    }

}

export default JavaScriptBeautify;
