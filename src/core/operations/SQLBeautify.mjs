/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */
import { format } from "sql-formatter";
import Operation from "../Operation.mjs";

/**
 * SQL Beautify operation
 */
class SQLBeautify extends Operation {

    /**
     * SQLBeautify constructor
     */
    constructor() {
        super();

        this.name = "SQL Beautify";
        this.module = "Code";
        this.description = "Indents and prettifies Structured Query Language (SQL) code.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Indent string",
                "type": "binaryShortString",
                "value": "\\t"
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const indentStr = args[0];
        // Extract and replace bind variables like :Bind1 with __BIND_0__
        const bindRegex = /:\w+/g;
        const bindMap = {};
        let bindCounter=0;
        const placeholderInput = input.replace(bindRegex, (match) => {
            const placeholder = `__BIND_${bindCounter++}__`;
            bindMap[placeholder] = match;
            return placeholder;
        });
        // Format the SQL with chosen options
        let formatted= format(placeholderInput, {
            language: "mysql", // Use MySQL as the default dialect for better compatibility with real-world SQL
            useTabs: indentStr==="\t", // true if tab, false if spaces
            tabWidth: indentStr.length || 4,     // fallback if empty
            indentStyle: "standard"              // fine for most SQL
        });
        // Replace placeholders back with original bind variables
        formatted = formatted.replace(/__BIND_\d+__/g, match => bindMap[match] || match);

        return formatted;
    }

}

export default SQLBeautify;
