/**
 * @author Jarmo van Lenthe [github.com/jarmovanlenthe]
 * @copyright Jarmo van Lenthe
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * PHP Deserialize operation
 */
class PHPDeserialize extends Operation {

    /**
     * PHPDeserialize constructor
     */
    constructor() {
        super();

        this.name = "PHP Deserialize";
        this.module = "Default";
        this.description = "Deserializes PHP serialized data, outputting keyed arrays as JSON.<br><br>Example:<br><code>a:2:{s:1:&quot;a&quot;;i:10;i:0;a:1:{s:2:&quot;ab&quot;;b:1;}}</code><br>becomes<br><code>{&quot;a&quot;: 10,0: {&quot;ab&quot;: true}}</code><br><br><u>Output valid JSON:</u> JSON doesn't support integers as keys, whereas PHP serialization does. Enabling this will cast these integers to strings. Strings are escaped in both output modes.<br><br>References to arrays and objects are shown as <code>[Reference: n]</code>, where n is the one-based PHP reference ID. This also represents circular references without expanding them.";
        this.infoURL = "http://www.phpinternalsbook.com/classes_objects/serialization.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Output valid JSON",
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
        const MAX_DEPTH = 256;
        const refStore = [];
        const integerKeys = new WeakMap();
        const inputBytes = new TextEncoder().encode(input);
        const decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
        let offset = 0;

        /**
         * Read exactly length bytes, rejecting incomplete UTF-8 characters.
         * @param {number} length
         * @returns {string}
         */
        function read(length) {
            if (length > inputBytes.length - offset) {
                throw new OperationError("End of input reached before end of script");
            }
            const bytes = inputBytes.subarray(offset, offset + length);
            offset += length;
            try {
                return decoder.decode(bytes);
            } catch (err) {
                throw new OperationError("Invalid UTF-8 string boundary");
            }
        }

        /**
         * Read up to an ASCII delimiter, consuming it.
         * @param {string} until
         * @returns {string}
         */
        function readUntil(until) {
            const end = inputBytes.indexOf(until.charCodeAt(0), offset);
            if (end === -1) {
                throw new OperationError("End of input reached before end of script");
            }
            const result = read(end - offset);
            offset++;
            return result;
        }

        /**
         * Consume an expected delimiter.
         * @param {string} expected
         */
        function expect(expected) {
            const result = read(expected.length);
            if (result !== expected) {
                throw new OperationError(`Expected "${expected}", but got "${result}"`);
            }
        }

        /**
         * Read a non-negative safe integer used as a length or count.
         * @param {string} label
         * @returns {number}
         */
        function readCount(label) {
            const raw = readUntil(":");
            const count = Number(raw);
            if (!/^\d+$/.test(raw) || !Number.isSafeInteger(count)) {
                throw new OperationError(`Invalid ${label}: ${raw}`);
            }
            return count;
        }

        /**
         * Read a quoted payload by its declared UTF-8 byte length.
         * @returns {string}
         */
        function readString() {
            const length = readCount("string length");
            expect('"');
            const value = read(length);
            expect('"');
            return value;
        }

        /**
         * Normalize PHP's private and protected property name mangling.
         * @param {string} key
         * @returns {string}
         */
        function normalizeKey(key) {
            const protectedMatch = key.match(/^\u0000\*\u0000(.+)$/);
            if (protectedMatch) {
                return `protected:${protectedMatch[1]}`;
            }
            const privateMatch = key.match(/^\u0000(.+)\u0000(.+)$/);
            if (privateMatch) {
                const [, , prop] = privateMatch;
                return `private:${prop}`;
            }
            return key;
        }

        /**
         * Parse one value. Keys do not occupy PHP reference slots.
         * @param {boolean} isKey
         * @param {number} depth
         * @returns {{value: *, keyType: string}}
         */
        function handleInput(isKey = false, depth = 0) {
            if (depth > MAX_DEPTH) {
                throw new OperationError("Maximum nesting depth exceeded");
            }
            const type = read(1);
            const kind = type.toLowerCase();
            if (isKey && kind !== "i" && kind !== "s") {
                throw new OperationError("Invalid key type: " + type);
            }

            if (kind === "r") {
                expect(":");
                const raw = readUntil(";");
                const index = Number(raw);
                if (!/^\d+$/.test(raw) || !Number.isSafeInteger(index) || index < 1 || index > refStore.length) {
                    throw new OperationError(`Invalid reference index: ${raw}`);
                }
                const target = refStore[index - 1];
                if (type === "r" && target.keyType !== "o") {
                    throw new OperationError(`Invalid object reference: ${index}`);
                }
                // Object references occupy slots; hard references do not.
                if (type === "r") refStore.push(target);
                return {
                    value: target.value !== null && typeof target.value === "object" ?
                        `[Reference: ${index}]` : target.value,
                    keyType: target.keyType
                };
            }

            // Register containers before children so back references can find them.
            const result = { value: null, keyType: kind };
            if (!isKey) refStore.push(result);

            switch (kind) {
                case "n":
                    expect(";");
                    break;

                case "i":
                case "d":
                case "b": {
                    expect(":");
                    const data = readUntil(";");
                    result.value = kind === "i" ? parseInt(data, 10) :
                        kind === "d" ? parseFloat(data) : parseInt(data, 10) !== 0;
                    break;
                }

                case "s": {
                    expect(":");
                    const length = readCount("string length");
                    expect('"');
                    result.value = read(length);
                    if (read(2) !== '";') {
                        throw new OperationError(`Invalid string boundary for declared byte length: ${length}`);
                    }
                    break;
                }

                case "a":
                case "o": {
                    expect(":");
                    const value = Object.create(null);
                    const keys = new Set();
                    result.value = value;
                    integerKeys.set(value, keys);
                    if (kind === "o") {
                        value.__className = readString();
                        expect(":");
                    }
                    const count = readCount("item count");
                    expect("{");
                    // Every pair must consume input; reject impossible counts early.
                    if (count > inputBytes.length - offset) {
                        throw new OperationError("Item count exceeds remaining input");
                    }
                    for (let i = 0; i < count; i++) {
                        const key = handleInput(true, depth + 1);
                        const name = kind === "o" ? normalizeKey(String(key.value)) : String(key.value);
                        value[name] = handleInput(false, depth + 1).value;
                        if (kind === "a" && key.keyType === "i") {
                            keys.add(name);
                        } else {
                            keys.delete(name);
                        }
                    }
                    expect("}");
                    break;
                }

                default:
                    throw new OperationError("Unknown type: " + type);
            }
            return result;
        }

        /**
         * Format legacy output recursively, retaining the type of array keys.
         * @param {*} value
         * @returns {string}
         */
        function stringifyWithIntegerKeys(value) {
            if (value === null || typeof value !== "object") {
                return JSON.stringify(value);
            }
            const keys = integerKeys.get(value);
            const entries = Object.entries(value).map(([key, child]) => {
                const jsonKey = keys.has(key) ? key : JSON.stringify(key);
                return `${jsonKey}:${stringifyWithIntegerKeys(child)}`;
            });
            return `{${entries.join(",")}}`;
        }

        const value = handleInput().value;
        return args[0] ? JSON.stringify(value) : stringifyWithIntegerKeys(value);
    }
}

export default PHPDeserialize;
