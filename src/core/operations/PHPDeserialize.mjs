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
        this.description = "Deserializes PHP serialized data, outputting keyed arrays as JSON.<br><br>Example:<br><code>a:2:{s:1:&quot;a&quot;;i:10;i:0;a:1:{s:2:&quot;ab&quot;;b:1;}}</code><br>becomes<br><code>{&quot;a&quot;: 10,0: {&quot;ab&quot;: true}}</code><br><br><u>Output valid JSON:</u> JSON doesn't support integers as keys, whereas PHP serialization does. Enabling this will cast these integers to strings. This will also escape backslashes.";
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
        const refStore = [];
        const inputPart = input.split("");
        /**
         * Recursive method for deserializing.
         * @returns {*}
         */
        function handleInput() {
            /**
             * Read `length` characters from the input, shifting them out the input.
             * @param length
             * @returns {string}
             */
            function read(length) {
                let result = "";
                for (let idx = 0; idx < length; idx++) {
                    const char = inputPart.shift();
                    if (char === undefined) {
                        throw new OperationError("End of input reached before end of script");
                    }
                    result += char;
                }
                return result;
            }
            /**
             * Read characters from the input until `until` is found.
             * @param until
             * @returns {string}
             */
            function readUntil(until) {
                let result = "";
                for (;;) {
                    const char = read(1);
                    if (char === until) break;
                    result += char;
                }
                return result;
            }

            /**
             * Read characters from the input that must be equal to `expect`
             * @param expect
             * @returns {string}
             */
            function expect(expectStr) {
                const result = read(expectStr.length);
                if (result !== expectStr) {
                    throw new OperationError(`Expected "${expectStr}", but got "${result}"`);
                }
                return result;
            }
            /**
             * Records a value by pushing it into the reference store and returns it.
             * @param {any} value - The value to be recorded.
             * @returns {any} - The recorded value.
             */
            function record(value) {
                refStore.push(value);
                return value;
            }

            /**
            * Normalizes the key by converting private and protected keys to standard formats.
            * @param {string} key - The key to be normalized.
            * @returns {string} - The normalized key.
            */
            function normalizeKey(key) {
                if (typeof key !== "string") return key;

                // Match private: "\0ClassName\0prop"
                const privateMatch = key.match(/^\u0000(.+)\u0000(.+)$/);
                if (privateMatch) {
                    const [_, className, prop] = privateMatch; // eslint-disable-line no-unused-vars
                    return `private:${prop}`;
                }

                // Match protected: "\0*\0prop"
                const protectedMatch = key.match(/^\u0000\*\u0000(.+)$/);
                if (protectedMatch) {
                    return `protected:${protectedMatch[1]}`;
                }

                return key;
            }

            /**
             * Helper function to handle deserialized arrays.
             * @returns {Array}
             */
            function handleArray() {
                const items = parseInt(readUntil(":"), 10) * 2;
                expect("{");
                const result = {};
                let isKey = true;
                let lastItem = null;
                for (let idx = 0; idx < items; idx++) {
                    const item = handleInput();
                    if (isKey) {
                        lastItem = item;
                        isKey = false;
                    } else {
                        let key = lastItem;
                        if (args[0] && typeof key === "number") {
                            key = key.toString();
                        }
                        result[key] = item;
                        isKey = true;
                    }
                }
                expect("}");
                return result;
            }

            const kind = read(1).toLowerCase();

            switch (kind) {
                case "n":
                    expect(";");
                    return record(null);

                case "i":
                case "d":
                case "b": {
                    expect(":");
                    const data = readUntil(";");
                    if (kind === "b") {
                        return record(parseInt(data, 10) !== 0);
                    }
                    if (kind === "i") {
                        return record(parseInt(data, 10));
                    }
                    if (kind === "d") {
                        return record(parseFloat(data));
                    }
                    return record(data);
                }

                case "a":
                    expect(":");
                    return record(handleArray());

                case "s": {
                    expect(":");
                    const lengthRaw = readUntil(":").trim();
                    const length = parseInt(lengthRaw, 10);
                    expect("\"");

                    // Read until the next quote-semicolon
                    let str = "";
                    while (true) {
                        const next = read(1);
                        if (next === '"' && inputPart[0] === ";") {
                            inputPart.shift(); // Consume the ;
                            break;
                        }
                        str += next;
                    }

                    const actualByteLength = new TextEncoder().encode(str).length;
                    if (actualByteLength !== length) {
                        // eslint-disable-next-line no-console
                        console.warn(`Length mismatch: declared ${length}, got ${actualByteLength} — proceeding anyway`);
                    }

                    return record(str);
                }

                case "o": {
                    expect(":");
                    const classNameLength = parseInt(readUntil(":"), 10);
                    expect("\"");
                    const className = read(classNameLength);
                    expect("\"");
                    expect(":");
                    const propertyCount = parseInt(readUntil(":"), 10);
                    expect("{");

                    const obj = {
                        __className: className
                    };

                    for (let i = 0; i < propertyCount; i++) {
                        const keyRaw = handleInput();
                        const value = handleInput();
                        let key = keyRaw;
                        if (typeof keyRaw === "string" && keyRaw.startsWith('"') && keyRaw.endsWith('"')) {
                            key = keyRaw.slice(1, -1);
                        }
                        key = normalizeKey(key);
                        obj[key] = value;
                    }

                    expect("}");
                    return record(obj);
                }

                case "r": {
                    expect(":");
                    const refIndex = parseInt(readUntil(";"), 10);
                    if (refIndex >= refStore.length || refIndex < 0) {
                        throw new OperationError(`Invalid reference index: ${refIndex}`);
                    }
                    return refStore[refIndex];
                }

                default:
                    throw new OperationError("Unknown type: " + kind);
            }
        }

        return JSON.stringify(handleInput());
    }
}

export default PHPDeserialize;
