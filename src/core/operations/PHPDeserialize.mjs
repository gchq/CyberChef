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
             * @param expectStr
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
                for (let idx = 0; idx < items; idx += 2) {
                    const keyInfo = handleInput();
                    const valueInfo = handleInput();
                    let key = keyInfo.value;
                    if (keyInfo.keyType === "i") key = parseInt(key, 10);
                    result[key] = valueInfo.value;
                }
                expect("}");
                return result;
            }

            const kind = read(1).toLowerCase();

            switch (kind) {
                case "n":
                    expect(";");
                    return record({ value: null, keyType: kind });

                case "i": {
                    expect(":");
                    const data = readUntil(";");
                    return record({ value: parseInt(data, 10), keyType: kind });
                }

                case "d": {
                    expect(":");
                    const data = readUntil(";");
                    return record({ value: parseFloat(data), keyType: kind });
                }

                case "b": {
                    expect(":");
                    const data = readUntil(";");
                    return record({ value: data !== 0, keyType: kind });
                }

                case "a":
                    expect(":");
                    return record({ value: handleArray(), keyType: kind });

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

                    return record({ value: str, keyType: kind });
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
                        const valueRaw = handleInput();
                        let key = keyRaw.value;
                        if (typeof key === "string" && key.startsWith('"') && key.endsWith('"')) {
                            key = key.slice(1, -1);
                        }
                        key = normalizeKey(key);
                        obj[key] = valueRaw.value;
                    }

                    expect("}");
                    return record({ value: obj, keyType: kind });
                }

                case "r": {
                    expect(":");
                    const refIndex = parseInt(readUntil(";"), 10);
                    if (refIndex >= refStore.length || refIndex < 0) {
                        throw new OperationError(`Invalid reference index: ${refIndex}`);
                    }
                    const refValue = refStore[refIndex];
                    if (typeof refValue === "object" && refValue !== null && "value" in refValue && "keyType" in refValue) {
                        return refValue;
                    }
                    return record({ value: refValue, keyType: kind });
                }

                default:
                    throw new OperationError("Unknown type: " + kind);
            }
        }

        /**
         * Helper function to make invalid json output (legacy support)
         * @returns {String}
         */
        function stringifyWithIntegerKeys(obj) {
            const entries = Object.entries(obj).map(([key, value]) => {
                const jsonKey = Number.isInteger(+key) ? key : JSON.stringify(key);
                const jsonValue = JSON.stringify(value);
                return `${jsonKey}:${jsonValue}`;
            });
            return `{${entries.join(',')}}`; // eslint-disable-line quotes
        }

        if (args[0]) {
            return JSON.stringify(handleInput().value);
            
        } else {
            return stringifyWithIntegerKeys(handleInput().value);
        }
    }
}

export default PHPDeserialize;
