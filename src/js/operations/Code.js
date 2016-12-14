/* globals prettyPrintOne, vkbeautify */

/**
 * Code operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var Code = {

    /**
     * @constant
     * @default
     */
    LANGUAGES: ["default-code", "default-markup", "bash", "bsh", "c", "cc", "coffee", "cpp", "cs", "csh", "cv", "cxx", "cyc", "htm", "html", "in.tag", "java", "javascript", "js", "json", "m", "mxml", "perl", "pl", "pm", "py", "python", "rb", "rc", "rs", "ruby", "rust", "sh", "uq.val", "xhtml", "xml", "xsl"],
    /**
     * @constant
     * @default
     */
    LINE_NUMS: false,

    /**
     * Syntax highlighter operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    run_syntax_highlight: function(input, args) {
        var language = args[0],
            line_nums = args[1];
        return "<code class='prettyprint'>" + prettyPrintOne(Utils.escape_html(input), language, line_nums) + "</code>";
    },


    /**
     * @constant
     * @default
     */
    BEAUTIFY_INDENT: "\\t",

    /**
     * XML Beautify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_xml_beautify: function(input, args) {
        var indent_str = args[0];
        return vkbeautify.xml(input, indent_str);
    },


    /**
     * JSON Beautify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_json_beautify: function(input, args) {
        var indent_str = args[0];
        if (!input) return "";
        return vkbeautify.json(input, indent_str);
    },


    /**
     * CSS Beautify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_css_beautify: function(input, args) {
        var indent_str = args[0];
        return vkbeautify.css(input, indent_str);
    },


    /**
     * SQL Beautify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_sql_beautify: function(input, args) {
        var indent_str = args[0];
        return vkbeautify.sql(input, indent_str);
    },


    /**
     * @constant
     * @default
     */
    PRESERVE_COMMENTS: false,

    /**
     * XML Minify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_xml_minify: function(input, args) {
        var preserve_comments = args[0];
        return vkbeautify.xmlmin(input, preserve_comments);
    },


    /**
     * JSON Minify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_json_minify: function(input, args) {
        if (!input) return "";
        return vkbeautify.jsonmin(input);
    },


    /**
     * CSS Minify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_css_minify: function(input, args) {
        var preserve_comments = args[0];
        return vkbeautify.cssmin(input, preserve_comments);
    },


    /**
     * SQL Minify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_sql_minify: function(input, args) {
        return vkbeautify.sqlmin(input);
    },


    /**
     * Generic Code Beautify operation.
     *
     * Yeeeaaah...
     *
     * I'm not proud of this code, but seriously, try writing a generic lexer and parser that
     * correctly generates an AST for multiple different languages. I have tried, and I can tell
     * you it's pretty much impossible.
     *
     * This basically works. That'll have to be good enough. It's not meant to produce working code,
     * just slightly more readable code.
     *
     * Things that don't work:
     *  - For loop formatting
     *  - Do-While loop formatting
     *  - Switch/Case indentation
     *  - Bit shift operators
     *
     * @author n1474335 [n1474335@gmail.com]
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_generic_beautify: function(input, args) {
        var code = input,
            t = 0,
            preserved_tokens = [],
            m;

        // Remove strings
        var sstrings = /'([^'\\]|\\.)*'/g;
        while ((m = sstrings.exec(code))) {
            code = preserve_token(code, m, t++);
            sstrings.lastIndex = m.index;
        }

        var dstrings = /"([^"\\]|\\.)*"/g;
        while ((m = dstrings.exec(code))) {
            code = preserve_token(code, m, t++);
            dstrings.lastIndex = m.index;
        }

        // Remove comments
        var scomments = /\/\/[^\n\r]*/g;
        while ((m = scomments.exec(code))) {
            code = preserve_token(code, m, t++);
            scomments.lastIndex = m.index;
        }

        var mcomments = /\/\*[\s\S]*?\*\//gm;
        while ((m = mcomments.exec(code))) {
            code = preserve_token(code, m, t++);
            mcomments.lastIndex = m.index;
        }

        var hcomments = /(^|\n)#[^\n\r#]+/g;
        while ((m = hcomments.exec(code))) {
            code = preserve_token(code, m, t++);
            hcomments.lastIndex = m.index;
        }

        // Remove regexes
        var regexes = /\/.*?[^\\]\/[gim]{0,3}/gi;
        while ((m = regexes.exec(code))) {
            code = preserve_token(code, m, t++);
            regexes.lastIndex = m.index;
        }

        // Create newlines after ;
        code = code.replace(/;/g, ";\n");

        // Create newlines after { and around }
        code = code.replace(/{/g, "{\n");
        code = code.replace(/}/g, "\n}\n");

        // Remove carriage returns
        code = code.replace(/\r/g, "");

        // Remove all indentation
        code = code.replace(/^\s+/g, "");
        code = code.replace(/\n\s+/g, "\n");

        // Remove trailing spaces
        code = code.replace(/\s*$/g, "");

        // Remove newlines before {
        code = code.replace(/\n{/g, "{");

        // Indent
        var i = 0,
            level = 0;
        while (i < code.length) {
            switch(code[i]) {
                case "{":
                    level++;
                    break;
                case "\n":
                    if (i+1 >= code.length) break;

                    if (code[i+1] === "}") level--;
                    var indent = (level >= 0) ? Array(level*4+1).join(" ") : "";

                    code = code.substring(0, i+1) + indent + code.substring(i+1);
                    if (level > 0) i += level*4;
                    break;
            }
            i++;
        }

        // Add strategic spaces
        code = code.replace(/\s*([!<>=+-/*]?)=\s*/g, " $1= ");
        code = code.replace(/\s*<([=]?)\s*/g, " <$1 ");
        code = code.replace(/\s*>([=]?)\s*/g, " >$1 ");
        code = code.replace(/([^+])\+([^+=])/g, "$1 + $2");
        code = code.replace(/([^-])-([^-=])/g, "$1 - $2");
        code = code.replace(/([^*])\*([^*=])/g, "$1 * $2");
        code = code.replace(/([^/])\/([^/=])/g, "$1 / $2");
        code = code.replace(/\s*,\s*/g, ", ");
        code = code.replace(/\s*{/g, " {");
        code = code.replace(/}\n/g, "}\n\n");

        // Just... don't look at this
        code = code.replace(/(if|for|while|with|elif|elseif)\s*\(([^\n]*)\)\s*\n([^{])/gim, "$1 ($2)\n    $3");
        code = code.replace(/(if|for|while|with|elif|elseif)\s*\(([^\n]*)\)([^{])/gim, "$1 ($2) $3");
        code = code.replace(/else\s*\n([^{])/gim, "else\n    $1");
        code = code.replace(/else\s+([^{])/gim, "else $1");

        // Remove strategic spaces
        code = code.replace(/\s+;/g, ";");
        code = code.replace(/\{\s+\}/g, "{}");
        code = code.replace(/\[\s+\]/g, "[]");
        code = code.replace(/}\s*(else|catch|except|finally|elif|elseif|else if)/gi, "} $1");


        // Replace preserved tokens
        var ptokens = /###preserved_token(\d+)###/g;
        while ((m = ptokens.exec(code))) {
            var ti = parseInt(m[1], 10);
            code = code.substring(0, m.index) + preserved_tokens[ti] + code.substring(m.index + m[0].length);
            ptokens.lastIndex = m.index;
        }

        return code;

        function preserve_token(str, match, t) {
            preserved_tokens[t] = match[0];
            return str.substring(0, match.index) +
                "###preserved_token" + t + "###" +
                str.substring(match.index + match[0].length);
        }
    },

};
