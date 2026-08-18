/**
 * @author Zain Nadeem [zainnadeemzainnadeem80@gmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils, { isWorkerEnvironment } from "../Utils.mjs";
import initYaraX, { Compiler } from "@virustotal/yara-x";

let yaraXInitPromise = null;

/**
 * YARA-X Scan operation
 */
class YARAXScan extends Operation {

    /**
     * YARAXScan constructor
     */
    constructor() {
        super();

        this.name = "YARA-X Scan";
        this.module = "Yara";
        this.description = "Scans the input with YARA-X rules using the official YARA-X WebAssembly package.";
        this.infoURL = "https://virustotal.github.io/yara-x/";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                name: "Rules",
                type: "text",
                value: "",
                rows: 5,
                allowEmpty: false
            },
            {
                name: "Show matching patterns",
                type: "boolean",
                value: true
            },
            {
                name: "Show metadata",
                type: "boolean",
                value: true
            },
            {
                name: "Show warnings",
                type: "boolean",
                value: true
            },
            {
                name: "Timeout (ms)",
                type: "number",
                value: 0,
                min: 0,
                integer: true
            },
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const [rulesText, showPatterns, showMetadata, showWarnings, timeout] = args;

        if (!rulesText.trim()) {
            throw new OperationError("Rules cannot be empty.");
        }

        await initialiseYaraX();

        const inputBytes = new Uint8Array(input);
        let compiler = null,
            rules = null,
            scanner = null,
            result = null,
            compilerWarnings = [];

        try {
            compiler = new Compiler();

            try {
                compiler.addSource(rulesText);
                compilerWarnings = compiler.warnings;
                rules = compiler.build();
            } catch (err) {
                throw new OperationError(`Error compiling YARA-X rules. (${formatError(err)})`);
            }

            try {
                if (timeout > 0) {
                    scanner = rules.scanner();
                    scanner.setTimeoutMs(timeout);
                    result = scanner.scan(inputBytes);
                } else {
                    result = rules.scan(inputBytes);
                }
            } catch (err) {
                throw new OperationError(`Error scanning input with YARA-X. (${formatError(err)})`);
            }

            if (!result || result.valid !== true || !Array.isArray(result.matches)) {
                throw new OperationError(`Invalid YARA-X scan result. (${formatResultErrors(result)})`);
            }

            return formatScanResult(
                result,
                inputBytes,
                collectWarnings(compilerWarnings, rules.warnings, result.warnings),
                showPatterns,
                showMetadata,
                showWarnings
            );
        } finally {
            if (scanner) scanner.free();
            if (rules) rules.free();
            if (compiler) compiler.free();
        }
    }

}


/**
 * Initialises the YARA-X WASM module once per worker.
 *
 * @returns {Promise<void>}
 */
async function initialiseYaraX() {
    if (!yaraXInitPromise) {
        if (isWorkerEnvironment()) {
            self.sendStatusMessage("Instantiating YARA-X...");
        }

        yaraXInitPromise = initYaraX().catch(err => {
            yaraXInitPromise = null;
            throw new OperationError(`Error initialising YARA-X. (${formatError(err)})`);
        });
    }

    await yaraXInitPromise;
}


/**
 * @param {Object} result
 * @param {Uint8Array} inputBytes
 * @param {string[]} warnings
 * @param {boolean} showPatterns
 * @param {boolean} showMetadata
 * @param {boolean} showWarnings
 * @returns {string}
 */
function formatScanResult(result, inputBytes, warnings, showPatterns, showMetadata, showWarnings) {
    const output = [];

    if (showWarnings && warnings.length) {
        output.push("Warnings:");
        warnings.forEach(warning => output.push(`  ${warning}`));
        output.push("");
    }

    if (result.matches.length === 0) {
        output.push("No matches");
        return output.join("\n");
    }

    result.matches.forEach((rule, i) => {
        if (i > 0) output.push("");

        output.push(`Rule: ${rule.identifier}`);
        output.push(`Namespace: ${rule.namespace || "default"}`);

        if (Array.isArray(rule.tags) && rule.tags.length) {
            output.push(`Tags: ${rule.tags.join(", ")}`);
        }

        if (showMetadata && Array.isArray(rule.metadata) && rule.metadata.length) {
            output.push("Metadata:");
            rule.metadata.forEach(metadata => {
                output.push(`  ${metadata.identifier}: ${formatValue(metadata.value)}`);
            });
        }

        if (showPatterns && Array.isArray(rule.patterns)) {
            const lines = formatPatternMatches(rule.patterns, inputBytes);
            if (lines.length) {
                output.push("Patterns:");
                output.push(...lines);
            }
        }
    });

    return output.join("\n");
}


/**
 * @param {Object[]} patterns
 * @param {Uint8Array} inputBytes
 * @returns {string[]}
 */
function formatPatternMatches(patterns, inputBytes) {
    const lines = [];

    patterns.forEach(pattern => {
        if (!Array.isArray(pattern.matches)) return;

        pattern.matches.forEach(match => {
            if (!Number.isInteger(match.offset) ||
                !Number.isInteger(match.length) ||
                match.offset < 0 ||
                match.length < 0 ||
                match.offset + match.length > inputBytes.length) {
                throw new OperationError("Invalid YARA-X pattern match.");
            }

            lines.push(
                `  ${pattern.identifier} at 0x${match.offset.toString(16)}: ` +
                formatMatchedBytes(inputBytes, match.offset, match.length)
            );
        });
    });

    return lines;
}


/**
 * @param {Uint8Array} inputBytes
 * @param {number} offset
 * @param {number} length
 * @returns {string}
 */
function formatMatchedBytes(inputBytes, offset, length) {
    const bytes = inputBytes.slice(offset, offset + length);
    let output = "";

    bytes.forEach(byte => {
        switch (byte) {
            case 0x09:
                output += "\\t";
                break;
            case 0x0a:
                output += "\\n";
                break;
            case 0x0d:
                output += "\\r";
                break;
            case 0x22:
                output += "\\\"";
                break;
            case 0x5c:
                output += "\\\\";
                break;
            default:
                output += byte >= 0x20 && byte <= 0x7e ?
                    String.fromCharCode(byte) :
                    `\\x${Utils.hex(byte)}`;
        }
    });

    return `"${output}"`;
}


/**
 * @param {...string[]} warningLists
 * @returns {string[]}
 */
function collectWarnings(...warningLists) {
    const warnings = new Set();

    warningLists.forEach(warningList => {
        if (Array.isArray(warningList)) {
            warningList.forEach(warning => warnings.add(warning));
        }
    });

    return [...warnings];
}


/**
 * @param {*} value
 * @returns {string}
 */
function formatValue(value) {
    if (typeof value === "string") return value;
    if (value === null) return "null";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}


/**
 * @param {*} err
 * @returns {string}
 */
function formatError(err) {
    if (!err) return "Unknown error";
    if (typeof err === "string") return err;
    return err.message || err.toString();
}


/**
 * @param {*} result
 * @returns {string}
 */
function formatResultErrors(result) {
    if (result && Array.isArray(result.errors) && result.errors.length) {
        return result.errors.join("\n");
    }
    return "Unknown error";
}

export default YARAXScan;
