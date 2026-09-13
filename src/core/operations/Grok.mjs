/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

const BUILTIN_PATTERNS = {
    USERNAME: "[A-Za-z0-9._-]+",
    USER: "%{USERNAME}",
    INT: "[+-]?[0-9]+",
    NONNEGINT: "[0-9]+",
    POSINT: "[1-9][0-9]*",
    BASE10NUM: "[+-]?(?:[0-9]+(?:\\.[0-9]+)?|\\.[0-9]+)",
    NUMBER: "%{BASE10NUM}",
    WORD: "\\b\\w+\\b",
    NOTSPACE: "\\S+",
    SPACE: "\\s*",
    DATA: ".*?",
    GREEDYDATA: ".*",
    QUOTEDSTRING: "\"(?:\\\\.|[^\"])*\"",
    QS: "%{QUOTEDSTRING}",
    IPV4: "(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)",
    IPV6: "(?:[A-Fa-f0-9]{1,4}:){2,7}[A-Fa-f0-9]{1,4}|(?:[A-Fa-f0-9]{1,4}:){1,7}:|:(?::[A-Fa-f0-9]{1,4}){1,7}",
    IP: "(?:%{IPV6}|%{IPV4})",
    HOSTNAME: "[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*",
    IPORHOST: "(?:%{IP}|%{HOSTNAME})",
    MONTHDAY: "(?:0?[1-9]|[12][0-9]|3[01])",
    MONTH: "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)",
    YEAR: "[0-9]{4}",
    HOUR: "(?:2[0-3]|[01]?[0-9])",
    MINUTE: "(?:[0-5][0-9])",
    SECOND: "(?:[0-5][0-9](?:\\.[0-9]+)?)",
    TIME: "%{HOUR}:%{MINUTE}(?::%{SECOND})",
    HTTPDATE: "%{MONTHDAY}/%{MONTH}/%{YEAR}:%{TIME} %{INT}",
};

const GROK_TOKEN = /%\{([A-Za-z0-9_]+)(?::([A-Za-z0-9_.-]+))?(?::(int|float|boolean|string))?\}/g;
const INTEGER_PATTERNS = new Set(["INT", "NONNEGINT", "POSINT"]);
const NUMBER_PATTERNS = new Set(["BASE10NUM", "NUMBER"]);

/**
 * Parse user-defined Grok patterns in the form `NAME regular-expression`.
 *
 * @param {string} input
 * @returns {Object<string, string>}
 */
function parseCustomPatterns(input) {
    const patterns = {};

    input.split(/\r?\n/).forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;

        const match = trimmed.match(/^([A-Za-z0-9_]+)\s+(.+)$/);
        if (!match) {
            throw new OperationError(`Invalid custom pattern on line ${index + 1}. Expected: NAME regular-expression`);
        }
        patterns[match[1]] = match[2];
    });

    return patterns;
}

/**
 * Convert a captured Grok value to its requested type.
 *
 * @param {string} value
 * @param {string} type
 * @returns {*}
 */
function convertValue(value, type) {
    switch (type) {
        case "int":
            return parseInt(value, 10);
        case "float":
            return parseFloat(value);
        case "boolean":
            if (/^true$/i.test(value)) return true;
            if (/^false$/i.test(value)) return false;
            throw new OperationError(`Unable to convert '${value}' to a boolean.`);
        default:
            return value;
    }
}

/**
 * Grok operation.
 */
class Grok extends Operation {
    /**
     * Grok constructor.
     */
    constructor() {
        super();

        this.name = "Grok";
        this.module = "Default";
        this.description = "Extracts structured fields using Grok patterns. Common patterns such as <code>IPORHOST</code>, <code>HTTPDATE</code>, <code>WORD</code>, <code>NOTSPACE</code> and <code>NUMBER</code> are built in. Additional patterns can be supplied one per line as <code>NAME regular-expression</code>. Captures use <code>%{PATTERN:field}</code> and may optionally specify <code>:int</code>, <code>:float</code>, <code>:boolean</code> or <code>:string</code>.";
        this.infoURL = "https://www.elastic.co/docs/explore-analyze/scripting/grok";
        this.inputType = "string";
        this.outputType = "JSON";
        this.args = [
            {
                name: "Pattern",
                type: "text",
                value: "%{GREEDYDATA:message}",
            },
            {
                name: "Custom patterns",
                type: "text",
                value: "",
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {Object}
     */
    run(input, args) {
        const [pattern, customPatternText] = args;
        const patterns = {
            ...BUILTIN_PATTERNS,
            ...parseCustomPatterns(customPatternText),
        };
        const captures = [];
        let captureIndex = 0;

        const expand = (source, stack = []) => source.replace(GROK_TOKEN, (_, patternName, fieldName, explicitType) => {
            const definition = patterns[patternName];
            if (definition === undefined) {
                throw new OperationError(`Unknown Grok pattern: ${patternName}`);
            }
            if (stack.includes(patternName)) {
                throw new OperationError(`Circular Grok pattern reference: ${[...stack, patternName].join(" -> ")}`);
            }

            const expanded = expand(definition, [...stack, patternName]);
            if (!fieldName) return `(?:${expanded})`;

            const groupName = `grok${captureIndex++}`;
            let type = explicitType || "string";
            if (!explicitType && INTEGER_PATTERNS.has(patternName)) type = "int";
            if (!explicitType && NUMBER_PATTERNS.has(patternName)) type = "float";
            captures.push({ groupName, fieldName, type });
            return `(?<${groupName}>${expanded})`;
        });

        let regex;
        try {
            regex = new RegExp(expand(pattern));
        } catch (err) {
            if (err instanceof OperationError) throw err;
            throw new OperationError(`Invalid Grok pattern: ${err.message}`);
        }

        const match = regex.exec(input);
        if (!match) {
            throw new OperationError("Input does not match the Grok pattern.");
        }

        const result = {};
        captures.forEach(({ groupName, fieldName, type }) => {
            const value = match.groups?.[groupName];
            if (value !== undefined) {
                result[fieldName] = convertValue(value, type);
            }
        });

        return result;
    }
}

export default Grok;
