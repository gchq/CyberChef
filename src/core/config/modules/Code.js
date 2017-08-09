import JS from "../../operations/JS.js";
import Code from "../../operations/Code.js";


/**
 * Code module.
 *
 * Libraries:
 *  - lodash
 *  - vkbeautify
 *  - xmldom
 *  - xpath
 *  - googlecodeprettify
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
let OpModules = self.OpModules || {};

OpModules.Code = {
    "JavaScript Parser":     JS.runParse,
    "JavaScript Beautify":   JS.runBeautify,
    "JavaScript Minify":     JS.runMinify,
    "Syntax highlighter":    Code.runSyntaxHighlight,
    "Generic Code Beautify": Code.runGenericBeautify,
    "JSON Beautify":         Code.runJsonBeautify,
    "JSON Minify":           Code.runJsonMinify,
    "XML Beautify":          Code.runXmlBeautify,
    "XML Minify":            Code.runXmlMinify,
    "SQL Beautify":          Code.runSqlBeautify,
    "SQL Minify":            Code.runSqlMinify,
    "CSS Beautify":          Code.runCssBeautify,
    "CSS Minify":            Code.runCssMinify,
    "XPath expression":      Code.runXpath,
    "CSS selector":          Code.runCSSQuery,
    "To Snake case":         Code.runToSnakeCase,
    "To Camel case":         Code.runToCamelCase,
    "To Kebab case":         Code.runToKebabCase,
};

export default OpModules;
