import {camelCase, kebabCase, snakeCase} from "lodash";
import vkbeautify from "vkbeautify";
import {DOMParser} from "xmldom";
import xpath from "xpath";
import jpath from "jsonpath";
import nwmatcher from "nwmatcher";
import hljs from "highlight.js";


/**
 * Code operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const Code = {

    /**
     * @constant
     * @default
     */
    LANGUAGES: ["auto detect"].concat(hljs.listLanguages()),

    /**
     * Syntax highlighter operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    runSyntaxHighlight: function(input, args) {
        const language = args[0];

        if (language === "auto detect") {
            return hljs.highlightAuto(input).value;
        }

        return hljs.highlight(language, input, true).value;
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
    runXmlBeautify: function(input, args) {
        const indentStr = args[0];
        return vkbeautify.xml(input, indentStr);
    },


    /**
     * JSON Beautify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runJsonBeautify: function(input, args) {
        const indentStr = args[0];
        if (!input) return "";
        return vkbeautify.json(input, indentStr);
    },


    /**
     * CSS Beautify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runCssBeautify: function(input, args) {
        const indentStr = args[0];
        return vkbeautify.css(input, indentStr);
    },


    /**
     * SQL Beautify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runSqlBeautify: function(input, args) {
        const indentStr = args[0];
        return vkbeautify.sql(input, indentStr);
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
    runXmlMinify: function(input, args) {
        const preserveComments = args[0];
        return vkbeautify.xmlmin(input, preserveComments);
    },


    /**
     * JSON Minify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runJsonMinify: function(input, args) {
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
    runCssMinify: function(input, args) {
        const preserveComments = args[0];
        return vkbeautify.cssmin(input, preserveComments);
    },


    /**
     * SQL Minify operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runSqlMinify: function(input, args) {
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
    runGenericBeautify: function(input, args) {
        let code = input,
            t = 0,
            preservedTokens = [],
            m;

        // Remove strings
        const sstrings = /'([^'\\]|\\.)*'/g;
        while ((m = sstrings.exec(code))) {
            code = preserveToken(code, m, t++);
            sstrings.lastIndex = m.index;
        }

        const dstrings = /"([^"\\]|\\.)*"/g;
        while ((m = dstrings.exec(code))) {
            code = preserveToken(code, m, t++);
            dstrings.lastIndex = m.index;
        }

        // Remove comments
        const scomments = /\/\/[^\n\r]*/g;
        while ((m = scomments.exec(code))) {
            code = preserveToken(code, m, t++);
            scomments.lastIndex = m.index;
        }

        const mcomments = /\/\*[\s\S]*?\*\//gm;
        while ((m = mcomments.exec(code))) {
            code = preserveToken(code, m, t++);
            mcomments.lastIndex = m.index;
        }

        const hcomments = /(^|\n)#[^\n\r#]+/g;
        while ((m = hcomments.exec(code))) {
            code = preserveToken(code, m, t++);
            hcomments.lastIndex = m.index;
        }

        // Remove regexes
        const regexes = /\/.*?[^\\]\/[gim]{0,3}/gi;
        while ((m = regexes.exec(code))) {
            code = preserveToken(code, m, t++);
            regexes.lastIndex = m.index;
        }

        code = code
            // Create newlines after ;
            .replace(/;/g, ";\n")
            // Create newlines after { and around }
            .replace(/{/g, "{\n")
            .replace(/}/g, "\n}\n")
            // Remove carriage returns
            .replace(/\r/g, "")
            // Remove all indentation
            .replace(/^\s+/g, "")
            .replace(/\n\s+/g, "\n")
            // Remove trailing spaces
            .replace(/\s*$/g, "")
            .replace(/\n{/g, "{");

        // Indent
        let i = 0,
            level = 0,
            indent;
        while (i < code.length) {
            switch (code[i]) {
                case "{":
                    level++;
                    break;
                case "\n":
                    if (i+1 >= code.length) break;

                    if (code[i+1] === "}") level--;
                    indent = (level >= 0) ? Array(level*4+1).join(" ") : "";

                    code = code.substring(0, i+1) + indent + code.substring(i+1);
                    if (level > 0) i += level*4;
                    break;
            }
            i++;
        }

        code = code
            // Add strategic spaces
            .replace(/\s*([!<>=+-/*]?)=\s*/g, " $1= ")
            .replace(/\s*<([=]?)\s*/g, " <$1 ")
            .replace(/\s*>([=]?)\s*/g, " >$1 ")
            .replace(/([^+])\+([^+=])/g, "$1 + $2")
            .replace(/([^-])-([^-=])/g, "$1 - $2")
            .replace(/([^*])\*([^*=])/g, "$1 * $2")
            .replace(/([^/])\/([^/=])/g, "$1 / $2")
            .replace(/\s*,\s*/g, ", ")
            .replace(/\s*{/g, " {")
            .replace(/}\n/g, "}\n\n")
            // Hacky horribleness
            .replace(/(if|for|while|with|elif|elseif)\s*\(([^\n]*)\)\s*\n([^{])/gim, "$1 ($2)\n    $3")
            .replace(/(if|for|while|with|elif|elseif)\s*\(([^\n]*)\)([^{])/gim, "$1 ($2) $3")
            .replace(/else\s*\n([^{])/gim, "else\n    $1")
            .replace(/else\s+([^{])/gim, "else $1")
            // Remove strategic spaces
            .replace(/\s+;/g, ";")
            .replace(/\{\s+\}/g, "{}")
            .replace(/\[\s+\]/g, "[]")
            .replace(/}\s*(else|catch|except|finally|elif|elseif|else if)/gi, "} $1");

        // Replace preserved tokens
        const ptokens = /###preservedToken(\d+)###/g;
        while ((m = ptokens.exec(code))) {
            const ti = parseInt(m[1], 10);
            code = code.substring(0, m.index) + preservedTokens[ti] + code.substring(m.index + m[0].length);
            ptokens.lastIndex = m.index;
        }

        return code;

        /**
         * Replaces a matched token with a placeholder value.
         */
        function preserveToken(str, match, t) {
            preservedTokens[t] = match[0];
            return str.substring(0, match.index) +
                "###preservedToken" + t + "###" +
                str.substring(match.index + match[0].length);
        }
    },


    /**
     * @constant
     * @default
     */
    XPATH_INITIAL: "",

    /**
     * @constant
     * @default
     */
    XPATH_DELIMITER: "\\n",

    /**
     * XPath expression operation.
     *
     * @author Mikescher (https://github.com/Mikescher | https://mikescher.com)
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runXpath: function(input, args) {
        let query = args[0],
            delimiter = args[1];

        let doc;
        try {
            doc = new DOMParser().parseFromString(input, "application/xml");
        } catch (err) {
            return "Invalid input XML.";
        }

        let nodes;
        try {
            nodes = xpath.select(query, doc);
        } catch (err) {
            return "Invalid XPath. Details:\n" + err.message;
        }

        const nodeToString = function(node) {
            return node.toString();
        };

        return nodes.map(nodeToString).join(delimiter);
    },


    /**
     * @constant
     * @default
     */
    JPATH_INITIAL: "",

    /**
     * @constant
     * @default
     */
    JPATH_DELIMITER: "\\n",

    /**
     * JPath expression operation.
     *
     * @author Matt C (matt@artemisbot.uk)
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runJpath: function(input, args) {
        let query = args[0],
            delimiter = args[1],
            results,
            obj;

        try {
            obj = JSON.parse(input);
        } catch (err) {
            return "Invalid input JSON: " + err.message;
        }

        try {
            results = jpath.query(obj, query);
        } catch (err) {
            return "Invalid JPath expression: " + err.message;
        }

        return results.map(result => JSON.stringify(result)).join(delimiter);
    },


    /**
     * @constant
     * @default
     */
    CSS_SELECTOR_INITIAL: "",

    /**
     * @constant
     * @default
     */
    CSS_QUERY_DELIMITER: "\\n",

    /**
     * CSS selector operation.
     *
     * @author Mikescher (https://github.com/Mikescher | https://mikescher.com)
     * @author n1474335 [n1474335@gmail.com]
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runCSSQuery: function(input, args) {
        let query = args[0],
            delimiter = args[1],
            parser = new DOMParser(),
            dom,
            result;

        if (!query.length || !input.length) {
            return "";
        }

        try {
            dom = parser.parseFromString(input);
        } catch (err) {
            return "Invalid input HTML.";
        }

        try {
            const matcher = nwmatcher({document: dom});
            result = matcher.select(query, dom);
        } catch (err) {
            return "Invalid CSS Selector. Details:\n" + err.message;
        }

        const nodeToString = function(node) {
            return node.toString();
            /* xmldom does not return the outerHTML value.
            switch (node.nodeType) {
                case node.ELEMENT_NODE: return node.outerHTML;
                case node.ATTRIBUTE_NODE: return node.value;
                case node.TEXT_NODE: return node.wholeText;
                case node.COMMENT_NODE: return node.data;
                case node.DOCUMENT_NODE: return node.outerHTML;
                default: throw new Error("Unknown Node Type: " + node.nodeType);
            }*/
        };

        return result
            .map(nodeToString)
            .join(delimiter);
    },

    /**
     * This tries to rename variable names in a code snippet according to a function.
     *
     * @param {string} input
     * @param {function} replacer - this function will be fed the token which should be renamed.
     * @returns {string}
     */
    _replaceVariableNames(input, replacer) {
        const tokenRegex = /\\"|"(?:\\"|[^"])*"|(\b[a-z0-9\-_]+\b)/ig;

        return input.replace(tokenRegex, (...args) => {
            let match = args[0],
                quotes = args[1];

            if (!quotes) {
                return match;
            } else {
                return replacer(match);
            }
        });
    },


    /**
     * Converts to snake_case.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     *
     */
    runToSnakeCase(input, args) {
        const smart = args[0];

        if (smart) {
            return Code._replaceVariableNames(input, snakeCase);
        } else {
            return snakeCase(input);
        }
    },


    /**
     * Converts to camelCase.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     *
     */
    runToCamelCase(input, args) {
        const smart = args[0];

        if (smart) {
            return Code._replaceVariableNames(input, camelCase);
        } else {
            return camelCase(input);
        }
    },


    /**
     * Converts to kebab-case.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     *
     */
    runToKebabCase(input, args) {
        const smart = args[0];

        if (smart) {
            return Code._replaceVariableNames(input, kebabCase);
        } else {
            return kebabCase(input);
        }
    },
};

export default Code;
