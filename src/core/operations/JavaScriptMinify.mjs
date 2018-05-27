/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import * as esprima from "esprima";
import escodegen from "escodegen";
import esmangle from "esmangle";

/**
 * JavaScript Minify operation
 */
class JavaScriptMinify extends Operation {

    /**
     * JavaScriptMinify constructor
     */
    constructor() {
        super();

        this.name = "JavaScript Minify";
        this.module = "Code";
        this.description = "Compresses JavaScript code.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        let result = "";
        const AST = esprima.parseScript(input),
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
    }

}

export default JavaScriptMinify;
