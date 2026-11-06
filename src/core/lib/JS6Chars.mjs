/**
 * Static evaluator for JS6Chars expressions.
 *
 * JS6Chars expressions are JavaScript programs written using only the
 * characters [ ] ( ) ! +. They rely on type coercion and on built-in
 * methods to build strings, arrays and ultimately calls to the Function
 * constructor.
 *
 * This module never creates or executes JavaScript code from the input.
 * It parses the expression with esprima and interprets the small subset of
 * JavaScript that JS6Chars uses inside a self-contained value model. Calls
 * to the Function constructor are intercepted. Bodies consisting of a single
 * return statement with a constant expression are evaluated in the same
 * virtual model; all other bodies are returned to the caller as source code
 * instead of being compiled or run.
 *
 * @author Roma476 [friciu.robert09@gmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import * as esprima from "esprima";

import OperationError from "../errors/OperationError.mjs";

const MAX_INPUT_LENGTH = 100000;
const MAX_STEPS = 1000000;
const MAX_CALL_DEPTH = 100;
const MAX_STRING_LENGTH = 1000000;
const MAX_ARRAY_LENGTH = 100000;

const ALLOWED_CHARACTERS = /^[\s[\]()!+]*$/;
const ARRAY_INDEX = /^(?:0|[1-9][0-9]*)$/;

/**
 * Thrown internally when a call to the Function constructor is intercepted.
 */
class DecodedCode extends Error {
    /**
     * @param {string} code
     */
    constructor(code) {
        super("Decoded code");
        this.code = code;
    }
}

/**
 * Thrown when an expression cannot be evaluated safely.
 */
class EvaluationError extends Error {}

/**
 * A value created by the interpreter. These are deliberately not real
 * JavaScript arrays, objects or functions.
 */
class JSArray {
    /**
     * @param {Array} elements
     */
    constructor(elements) {
        this.elements = elements;
    }
}

/**
 * A plain object created by the interpreter.
 */
class JSObject {
    /**
     * @param {Map} entries
     */
    constructor(entries) {
        this.entries = entries || new Map();
    }
}

/**
 * A function value created by the interpreter.
 */
class JSFunction {
    /**
     * @param {string} name
     * @param {Function} impl
     * @param {string} [source] Source returned by Function.prototype.toString
     */
    constructor(name, impl, source) {
        this.name = name;
        this.impl = impl;
        this.source = source;
    }
}

/**
 * A regular expression value created by the interpreter. Regular expressions
 * are never executed; only their string representation and basic properties
 * are exposed.
 */
class JSRegExp {
    /**
     * @param {string} source
     * @param {string} flags
     */
    constructor(source, flags) {
        this.source = source;
        this.flags = flags;
    }
}

/**
 * Ensures a string does not exceed the configured size limit.
 *
 * @param {string} value
 * @returns {string}
 */
function checkStringLength(value) {
    if (value.length > MAX_STRING_LENGTH) {
        throw new EvaluationError(`Result exceeds the maximum string length of ${MAX_STRING_LENGTH} characters.`);
    }
    return value;
}

/**
 * Ensures an array does not exceed the configured size limit.
 *
 * @param {number} length
 */
function checkArrayLength(length) {
    if (length > MAX_ARRAY_LENGTH) {
        throw new EvaluationError(`Result exceeds the maximum array length of ${MAX_ARRAY_LENGTH} elements.`);
    }
}

/**
 * Converts a value to a property key, following JavaScript's ToPropertyKey.
 *
 * @param {*} value
 * @returns {string}
 */
function toPropertyKey(value) {
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    return jsToString(value);
}

/**
 * Converts a value to its JavaScript string representation.
 *
 * @param {*} value
 * @param {Set} [seen] Used to avoid infinite recursion on cyclic arrays
 * @returns {string}
 */
function jsToString(value, seen) {
    if (value === undefined) return "undefined";
    if (value === null) return "null";

    switch (typeof value) {
        case "string":
            return value;
        case "number":
            return String(value);
        case "boolean":
            return value ? "true" : "false";
        case "bigint":
            return String(value);
    }

    const visited = seen || new Set();
    if (visited.has(value)) return "";
    visited.add(value);

    let result;
    if (value instanceof JSArray) {
        result = value.elements.map(element => jsToString(element, visited)).join(",");
    } else if (value instanceof JSFunction) {
        result = value.source || `function ${value.name}() { [native code] }`;
    } else if (value instanceof JSRegExp) {
        result = `/${value.source}/${value.flags}`;
    } else if (value instanceof JSObject) {
        result = "[object Object]";
    } else {
        result = String(value);
    }

    visited.delete(value);
    return checkStringLength(result);
}

/**
 * Converts a value to a primitive, following JavaScript's ToPrimitive.
 *
 * @param {*} value
 * @returns {*}
 */
function toPrimitive(value) {
    if (value === null || (typeof value !== "object" && typeof value !== "function")) {
        return value;
    }
    return jsToString(value);
}

/**
 * Converts a value to a number, following JavaScript's ToNumber.
 *
 * @param {*} value
 * @returns {number}
 */
function jsToNumber(value) {
    if (value === undefined) return NaN;
    if (value === null) return 0;

    switch (typeof value) {
        case "number":
            return value;
        case "boolean":
            return value ? 1 : 0;
        case "string":
            return Number(value);
    }

    if (value instanceof JSArray) {
        return jsToNumber(jsToString(value));
    }

    return NaN;
}

/**
 * Converts a value to a boolean, following JavaScript's ToBoolean.
 *
 * @param {*} value
 * @returns {boolean}
 */
function jsToBoolean(value) {
    if (value === undefined || value === null) return false;

    switch (typeof value) {
        case "boolean":
            return value;
        case "number":
            return value !== 0 && !Number.isNaN(value);
        case "string":
            return value.length > 0;
    }

    return true;
}

/**
 * Implements the JavaScript + operator.
 *
 * @param {*} left
 * @param {*} right
 * @returns {*}
 */
function jsAdd(left, right) {
    const leftPrimitive = toPrimitive(left),
        rightPrimitive = toPrimitive(right);

    if (typeof leftPrimitive === "string" || typeof rightPrimitive === "string") {
        return checkStringLength(jsToString(leftPrimitive) + jsToString(rightPrimitive));
    }

    return jsToNumber(leftPrimitive) + jsToNumber(rightPrimitive);
}

/**
 * Checks whether a property key is a canonical array index.
 *
 * @param {string} key
 * @returns {boolean}
 */
function isArrayIndex(key) {
    return ARRAY_INDEX.test(key) && Number(key) < 4294967295;
}

/**
 * Converts a value to an integer, following JavaScript's ToIntegerOrInfinity.
 *
 * @param {*} value
 * @returns {number}
 */
function toIntegerOrInfinity(value) {
    const number = jsToNumber(value);
    if (Number.isNaN(number) || number === 0) return 0;
    if (!Number.isFinite(number)) return number;
    return Math.trunc(number);
}

/**
 * Normalises an index for the slice/splice family of methods.
 *
 * @param {*} value
 * @param {number} length
 * @returns {number}
 */
function relativeIndex(value, length) {
    const index = toIntegerOrInfinity(value);
    if (index === -Infinity) return 0;
    if (index < 0) return Math.max(length + index, 0);
    return Math.min(index, length);
}

/**
 * Returns the own enumerable keys of a value.
 *
 * @param {*} value
 * @returns {string[]}
 */
function ownKeys(value) {
    if (value instanceof JSObject) return [...value.entries.keys()];
    if (value instanceof JSArray) return value.elements.map((element, index) => String(index));
    if (typeof value === "string") return value.split("").map((character, index) => String(index));
    return [];
}

/**
 * Converts a value to a list of array elements.
 *
 * @param {*} value
 * @returns {Array}
 */
function arrayLikeElements(value) {
    if (value instanceof JSArray) return value.elements.slice();
    if (typeof value === "string") return value.split("");

    if (value instanceof JSObject) {
        const lengthValue = value.entries.get("length"),
            length = lengthValue === undefined ? 0 : toIntegerOrInfinity(lengthValue);

        if (length <= 0) return [];
        if (!Number.isFinite(length)) throw new EvaluationError("Invalid array-like length.");

        checkArrayLength(length);
        const elements = [];
        for (let i = 0; i < length; i++) {
            elements.push(value.entries.get(String(i)));
        }
        return elements;
    }

    return [];
}

/**
 * Creates a function value for a built-in method.
 *
 * @param {string} name
 * @param {Function} impl
 * @returns {JSFunction}
 */
function builtin(name, impl, source) {
    return new JSFunction(name, impl, source);
}

/**
 * Escapes a value used in an HTML attribute by a String HTML wrapper method.
 *
 * @param {*} value
 * @returns {string}
 */
function escapeHTMLAttribute(value) {
    return jsToString(value).replace(/"/g, "&quot;");
}

/**
 * Implements the deprecated String HTML wrapper methods.
 *
 * @param {string} string
 * @param {string} tag
 * @param {string|null} attribute
 * @param {*} value
 * @returns {string}
 */
function createHTML(string, tag, attribute, value) {
    let result = `<${tag}`;
    if (attribute) {
        result += ` ${attribute}="${escapeHTMLAttribute(value)}"`;
    }
    result += `>${string}</${tag}>`;
    return checkStringLength(result);
}

/**
 * Returns the separator used by Array.prototype.join.
 *
 * @param {Array} args
 * @returns {string}
 */
function joinSeparator(args) {
    return args[0] === undefined ? "," : jsToString(args[0]);
}

/**
 * Tries to evaluate the body of a function created by the Function
 * constructor. Only a single return statement containing a constant
 * expression is evaluated. Anything else is treated as the decoded source
 * code and is returned to the caller without being executed.
 *
 * @param {string} body
 * @param {Evaluator} evaluator
 * @returns {*}
 */
function evaluateFunctionBody(body, evaluator) {
    if (body.length > MAX_INPUT_LENGTH) {
        throw new DecodedCode(body);
    }

    let ast;
    try {
        ast = esprima.parseScript(`(function(){\n${body}\n})`);
    } catch (err) {
        throw new DecodedCode(body);
    }

    if (ast.body.length !== 1 ||
        ast.body[0].type !== "ExpressionStatement" ||
        ast.body[0].expression.type !== "FunctionExpression") {
        throw new DecodedCode(body);
    }

    const statements = ast.body[0].expression.body.body;
    if (statements.length !== 1 ||
        statements[0].type !== "ReturnStatement" ||
        statements[0].argument === null) {
        throw new DecodedCode(body);
    }

    try {
        return evaluator.evaluate(statements[0].argument);
    } catch (err) {
        if (err instanceof DecodedCode) throw err;
        throw new DecodedCode(body);
    }
}

// Constructors exposed by the interpreter.
const FUNCTION_CONSTRUCTOR = builtin("Function", (thisArg, args, evaluator) => {
    const parts = args.map(argument => checkStringLength(jsToString(argument))),
        body = parts.length === 0 ? "" : parts[parts.length - 1],
        parameters = parts.length > 1 ? parts.slice(0, -1).join(",") : "",
        value = evaluateFunctionBody(body, evaluator),
        source = `function anonymous(${parameters}\n) {\n${body}\n}`;

    return builtin("anonymous", () => value, source);
});

const ARRAY_CONSTRUCTOR = builtin("Array", (thisArg, args) => {
    if (args.length === 1 && typeof args[0] === "number") {
        const length = toIntegerOrInfinity(args[0]);
        if (length < 0 || length >= 4294967295) {
            throw new EvaluationError("Invalid array length.");
        }
        checkArrayLength(length);
        return new JSArray(new Array(length).fill(undefined));
    }

    checkArrayLength(args.length);
    return new JSArray(args.slice());
});

const STRING_CONSTRUCTOR = builtin("String", (thisArg, args) => {
    return args.length === 0 ? "" : checkStringLength(jsToString(args[0]));
});

const NUMBER_CONSTRUCTOR = builtin("Number", (thisArg, args) => {
    return args.length === 0 ? 0 : jsToNumber(args[0]);
});

const BOOLEAN_CONSTRUCTOR = builtin("Boolean", (thisArg, args) => {
    return args.length === 0 ? false : jsToBoolean(args[0]);
});

const OBJECT_CONSTRUCTOR = builtin("Object", (thisArg, args) => {
    if (args.length === 0 || args[0] === undefined || args[0] === null) {
        return new JSObject();
    }
    return args[0];
});

const REGEXP_CONSTRUCTOR = builtin("RegExp", (thisArg, args) => {
    if (args[0] instanceof JSRegExp) {
        const flags = args[1] === undefined ? args[0].flags : jsToString(args[1]);
        return new JSRegExp(args[0].source, flags);
    }

    const source = args[0] === undefined ? "" : jsToString(args[0])
            .replace(/[\\/]/g, "\\$&")
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\u2028/g, "\\u2028")
            .replace(/\u2029/g, "\\u2029"),
        flags = args[1] === undefined ? "" : jsToString(args[1]);
    return new JSRegExp(source, flags);
});

// Static methods of the constructors above.
const STRING_FROM_CHAR_CODE = builtin("fromCharCode", (thisArg, args) => {
    let result = "";
    for (const argument of args) {
        result += String.fromCharCode(jsToNumber(argument) & 0xFFFF);
    }
    return checkStringLength(result);
});

const STRING_FROM_CODE_POINT = builtin("fromCodePoint", (thisArg, args) => {
    let result = "";
    for (const argument of args) {
        const codePoint = jsToNumber(argument);
        if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10FFFF) {
            throw new EvaluationError("Invalid code point.");
        }
        result += String.fromCodePoint(codePoint);
    }
    return checkStringLength(result);
});

const ARRAY_IS_ARRAY = builtin("isArray", (thisArg, args) => {
    return args[0] instanceof JSArray;
});

const ARRAY_OF = builtin("of", (thisArg, args) => {
    checkArrayLength(args.length);
    return new JSArray(args.slice());
});

const ARRAY_FROM = builtin("from", (thisArg, args, evaluator) => {
    const elements = arrayLikeElements(args[0]),
        mapFunction = args[1],
        thisArgForMap = args[2];

    if (mapFunction !== undefined) {
        if (!(mapFunction instanceof JSFunction)) {
            throw new EvaluationError("Array.from: map function is not a function.");
        }
        for (let i = 0; i < elements.length; i++) {
            elements[i] = evaluator.call(mapFunction, thisArgForMap, [elements[i], i]);
        }
    }

    checkArrayLength(elements.length);
    return new JSArray(elements);
});

const NUMBER_IS_NAN = builtin("isNaN", (thisArg, args) => {
    return typeof args[0] === "number" && Number.isNaN(args[0]);
});

const NUMBER_IS_FINITE = builtin("isFinite", (thisArg, args) => {
    return typeof args[0] === "number" && Number.isFinite(args[0]);
});

const NUMBER_IS_INTEGER = builtin("isInteger", (thisArg, args) => {
    return typeof args[0] === "number" && Number.isInteger(args[0]);
});

const NUMBER_PARSE_INT = builtin("parseInt", (thisArg, args) => {
    return parseInt(jsToString(args[0]), args[1] === undefined ? 10 : toIntegerOrInfinity(args[1]));
});

const NUMBER_PARSE_FLOAT = builtin("parseFloat", (thisArg, args) => {
    return parseFloat(jsToString(args[0]));
});

const OBJECT_KEYS = builtin("keys", (thisArg, args) => {
    return new JSArray(ownKeys(args[0]));
});

const OBJECT_VALUES = builtin("values", (thisArg, args, evaluator) => {
    const value = args[0];
    return new JSArray(ownKeys(value).map(key => evaluator.getProperty(value, key)));
});

const OBJECT_ENTRIES = builtin("entries", (thisArg, args, evaluator) => {
    const value = args[0];
    return new JSArray(ownKeys(value).map(key => new JSArray([key, evaluator.getProperty(value, key)])));
});

const OBJECT_ASSIGN = builtin("assign", (thisArg, args, evaluator) => {
    const target = args[0];
    if (!(target instanceof JSObject) && !(target instanceof JSArray)) {
        throw new EvaluationError("Object.assign target is not an object.");
    }

    for (const source of args.slice(1)) {
        for (const key of ownKeys(source)) {
            const value = evaluator.getProperty(source, key);
            if (target instanceof JSObject) {
                target.entries.set(key, value);
            } else if (isArrayIndex(key)) {
                target.elements[Number(key)] = value;
            }
        }
    }
    return target;
});

const OBJECT_CREATE = builtin("create", (thisArg, args) => {
    return new JSObject();
});

const OBJECT_IS = builtin("is", (thisArg, args) => {
    const left = args[0],
        right = args[1];
    if (typeof left === "number" && typeof right === "number") {
        return Object.is(left, right);
    }
    return left === right;
});

// Array.prototype methods.
const ARRAY_METHODS = new Map();

/**
 * Registers an Array.prototype method.
 *
 * @param {string} name
 * @param {Function} impl
 */
function arrayMethod(name, impl) {
    ARRAY_METHODS.set(name, builtin(name, impl));
}

arrayMethod("at", (thisArg, args) => {
    const array = thisArg,
        index = toIntegerOrInfinity(args[0]),
        position = index < 0 ? array.elements.length + index : index;
    return position >= 0 && position < array.elements.length ? array.elements[position] : undefined;
});

arrayMethod("concat", (thisArg, args) => {
    const result = thisArg.elements.slice();
    for (const argument of args) {
        if (argument instanceof JSArray) {
            for (const element of argument.elements) {
                result.push(element);
            }
        } else {
            result.push(argument);
        }
    }
    checkArrayLength(result.length);
    return new JSArray(result);
});

arrayMethod("every", (thisArg, args, evaluator) => {
    const callback = args[0],
        thisArgForCallback = args[1];
    if (!(callback instanceof JSFunction)) throw new EvaluationError("Callback is not a function.");
    for (let i = 0; i < thisArg.elements.length; i++) {
        if (!jsToBoolean(evaluator.call(callback, thisArgForCallback, [thisArg.elements[i], i, thisArg]))) {
            return false;
        }
    }
    return true;
});

arrayMethod("fill", (thisArg, args) => {
    const start = relativeIndex(args[1], thisArg.elements.length),
        end = args[2] === undefined ? thisArg.elements.length : relativeIndex(args[2], thisArg.elements.length);
    for (let i = start; i < end; i++) {
        thisArg.elements[i] = args[0];
    }
    return thisArg;
});

arrayMethod("flat", (thisArg, args) => {
    const depth = args[0] === undefined ? 1 : Math.max(toIntegerOrInfinity(args[0]), 0);

    const flatten = (elements, level) => {
        const result = [];
        for (const element of elements) {
            if (element instanceof JSArray && level > 0) {
                for (const nested of flatten(element.elements, level - 1)) {
                    result.push(nested);
                }
            } else {
                result.push(element);
            }
            checkArrayLength(result.length);
        }
        return result;
    };

    return new JSArray(flatten(thisArg.elements, depth));
});

arrayMethod("flatMap", (thisArg, args, evaluator) => {
    const callback = args[0],
        thisArgForCallback = args[1];
    if (!(callback instanceof JSFunction)) throw new EvaluationError("Callback is not a function.");

    const result = [];
    for (let i = 0; i < thisArg.elements.length; i++) {
        const mapped = evaluator.call(callback, thisArgForCallback, [thisArg.elements[i], i, thisArg]);
        if (mapped instanceof JSArray) {
            for (const element of mapped.elements) result.push(element);
        } else {
            result.push(mapped);
        }
        checkArrayLength(result.length);
    }
    return new JSArray(result);
});

arrayMethod("filter", (thisArg, args, evaluator) => {
    const callback = args[0],
        thisArgForCallback = args[1],
        result = [];
    if (!(callback instanceof JSFunction)) throw new EvaluationError("Callback is not a function.");
    for (let i = 0; i < thisArg.elements.length; i++) {
        const element = thisArg.elements[i];
        if (jsToBoolean(evaluator.call(callback, thisArgForCallback, [element, i, thisArg]))) {
            result.push(element);
        }
    }
    checkArrayLength(result.length);
    return new JSArray(result);
});

arrayMethod("copyWithin", (thisArg, args) => {
    const length = thisArg.elements.length,
        target = relativeIndex(args[0], length),
        start = relativeIndex(args[1], length),
        end = args[2] === undefined ? length : relativeIndex(args[2], length);
    const values = thisArg.elements.slice(start, end);
    for (let i = 0; i < values.length && target + i < length; i++) {
        thisArg.elements[target + i] = values[i];
    }
    return thisArg;
});

arrayMethod("entries", (thisArg) => {
    return new JSArray(thisArg.elements.map((element, index) => new JSArray([index, element])));
});

arrayMethod("find", (thisArg, args, evaluator) => {
    const callback = args[0],
        thisArgForCallback = args[1];
    if (!(callback instanceof JSFunction)) throw new EvaluationError("Callback is not a function.");
    for (let i = 0; i < thisArg.elements.length; i++) {
        const element = thisArg.elements[i];
        if (jsToBoolean(evaluator.call(callback, thisArgForCallback, [element, i, thisArg]))) {
            return element;
        }
    }
    return undefined;
});

arrayMethod("findIndex", (thisArg, args, evaluator) => {
    const callback = args[0],
        thisArgForCallback = args[1];
    if (!(callback instanceof JSFunction)) throw new EvaluationError("Callback is not a function.");
    for (let i = 0; i < thisArg.elements.length; i++) {
        if (jsToBoolean(evaluator.call(callback, thisArgForCallback, [thisArg.elements[i], i, thisArg]))) {
            return i;
        }
    }
    return -1;
});

arrayMethod("forEach", (thisArg, args, evaluator) => {
    const callback = args[0],
        thisArgForCallback = args[1];
    if (!(callback instanceof JSFunction)) throw new EvaluationError("Callback is not a function.");
    for (let i = 0; i < thisArg.elements.length; i++) {
        evaluator.call(callback, thisArgForCallback, [thisArg.elements[i], i, thisArg]);
    }
    return undefined;
});

arrayMethod("includes", (thisArg, args) => {
    const search = args[0],
        start = toIntegerOrInfinity(args[1]);
    for (let i = start < 0 ? Math.max(thisArg.elements.length + start, 0) : start; i < thisArg.elements.length; i++) {
        const element = thisArg.elements[i];
        if (element === search || (typeof element === "number" && typeof search === "number" && Number.isNaN(element) && Number.isNaN(search))) {
            return true;
        }
    }
    return false;
});

arrayMethod("indexOf", (thisArg, args) => {
    const search = args[0],
        start = toIntegerOrInfinity(args[1]);
    for (let i = start < 0 ? Math.max(thisArg.elements.length + start, 0) : start; i < thisArg.elements.length; i++) {
        if (thisArg.elements[i] === search) return i;
    }
    return -1;
});

arrayMethod("join", (thisArg, args) => {
    const separator = joinSeparator(args),
        visited = new Set([thisArg]),
        result = thisArg.elements.map(element => jsToString(element, visited)).join(separator);
    return checkStringLength(result);
});

arrayMethod("keys", (thisArg) => {
    return new JSArray(thisArg.elements.map((element, index) => index));
});

arrayMethod("lastIndexOf", (thisArg, args) => {
    const search = args[0];
    let start = args[1] === undefined ? thisArg.elements.length - 1 : toIntegerOrInfinity(args[1]);
    if (start < 0) start = thisArg.elements.length + start;
    for (let i = Math.min(start, thisArg.elements.length - 1); i >= 0; i--) {
        if (thisArg.elements[i] === search) return i;
    }
    return -1;
});

arrayMethod("map", (thisArg, args, evaluator) => {
    const callback = args[0],
        thisArgForCallback = args[1];
    if (!(callback instanceof JSFunction)) throw new EvaluationError("Callback is not a function.");
    const result = [];
    for (let i = 0; i < thisArg.elements.length; i++) {
        result.push(evaluator.call(callback, thisArgForCallback, [thisArg.elements[i], i, thisArg]));
    }
    checkArrayLength(result.length);
    return new JSArray(result);
});

arrayMethod("pop", (thisArg) => {
    return thisArg.elements.pop();
});

arrayMethod("push", (thisArg, args) => {
    checkArrayLength(thisArg.elements.length + args.length);
    for (const argument of args) {
        thisArg.elements.push(argument);
    }
    return thisArg.elements.length;
});

arrayMethod("reduce", (thisArg, args, evaluator) => {
    const callback = args[0];
    if (!(callback instanceof JSFunction)) throw new EvaluationError("Callback is not a function.");

    let index = 0,
        accumulator;
    if (args.length > 1) {
        accumulator = args[1];
    } else {
        if (thisArg.elements.length === 0) {
            throw new EvaluationError("Reduce of empty array with no initial value.");
        }
        accumulator = thisArg.elements[0];
        index = 1;
    }

    for (; index < thisArg.elements.length; index++) {
        accumulator = evaluator.call(callback, undefined, [accumulator, thisArg.elements[index], index, thisArg]);
    }
    return accumulator;
});

arrayMethod("reduceRight", (thisArg, args, evaluator) => {
    const callback = args[0];
    if (!(callback instanceof JSFunction)) throw new EvaluationError("Callback is not a function.");

    let index = thisArg.elements.length - 1,
        accumulator;
    if (args.length > 1) {
        accumulator = args[1];
    } else {
        if (thisArg.elements.length === 0) {
            throw new EvaluationError("Reduce of empty array with no initial value.");
        }
        accumulator = thisArg.elements[index];
        index--;
    }

    for (; index >= 0; index--) {
        accumulator = evaluator.call(callback, undefined, [accumulator, thisArg.elements[index], index, thisArg]);
    }
    return accumulator;
});

arrayMethod("reverse", (thisArg) => {
    thisArg.elements.reverse();
    return thisArg;
});

arrayMethod("shift", (thisArg) => {
    return thisArg.elements.shift();
});

arrayMethod("slice", (thisArg, args) => {
    const start = relativeIndex(args[0], thisArg.elements.length),
        end = args[1] === undefined ? thisArg.elements.length : relativeIndex(args[1], thisArg.elements.length);
    return new JSArray(thisArg.elements.slice(start, end));
});

arrayMethod("some", (thisArg, args, evaluator) => {
    const callback = args[0],
        thisArgForCallback = args[1];
    if (!(callback instanceof JSFunction)) throw new EvaluationError("Callback is not a function.");
    for (let i = 0; i < thisArg.elements.length; i++) {
        if (jsToBoolean(evaluator.call(callback, thisArgForCallback, [thisArg.elements[i], i, thisArg]))) {
            return true;
        }
    }
    return false;
});

arrayMethod("sort", (thisArg, args, evaluator) => {
    const comparator = args[0];
    if (comparator !== undefined && !(comparator instanceof JSFunction)) {
        throw new EvaluationError("Comparator is not a function.");
    }

    const elements = thisArg.elements.slice();
    elements.sort((left, right) => {
        if (comparator === undefined) {
            const leftString = jsToString(left),
                rightString = jsToString(right);
            return leftString < rightString ? -1 : leftString > rightString ? 1 : 0;
        }

        const result = jsToNumber(evaluator.call(comparator, undefined, [left, right]));
        if (Number.isNaN(result) || result === 0) return 0;
        return result < 0 ? -1 : 1;
    });

    thisArg.elements = elements;
    return thisArg;
});

arrayMethod("splice", (thisArg, args) => {
    const length = thisArg.elements.length,
        start = relativeIndex(args[0], length),
        deleteCount = args.length === 0 ? 0 : args.length === 1 ? length - start : Math.min(Math.max(toIntegerOrInfinity(args[1]), 0), length - start),
        removed = thisArg.elements.splice(start, deleteCount, ...args.slice(2));
    return new JSArray(removed);
});

arrayMethod("toString", (thisArg, args) => {
    return ARRAY_METHODS.get("join").impl(thisArg, [], null);
});

arrayMethod("unshift", (thisArg, args) => {
    checkArrayLength(thisArg.elements.length + args.length);
    thisArg.elements.unshift(...args);
    return thisArg.elements.length;
});

arrayMethod("valueOf", (thisArg) => {
    return thisArg;
});

arrayMethod("values", (thisArg) => {
    return new JSArray(thisArg.elements.slice());
});

// String.prototype methods.
const STRING_METHODS = new Map();

/**
 * Registers a String.prototype method.
 *
 * @param {string} name
 * @param {Function} impl
 */
function stringMethod(name, impl) {
    STRING_METHODS.set(name, builtin(name, impl));
}

/**
 * Returns the string used as the receiver of a String.prototype method.
 *
 * @param {*} thisArg
 * @returns {string}
 */
function stringReceiver(thisArg) {
    return checkStringLength(jsToString(thisArg));
}

/**
 * Implements String.prototype.padStart and padEnd.
 *
 * @param {string} string
 * @param {Array} args
 * @param {boolean} atStart
 * @returns {string}
 */
function padString(string, args, atStart) {
    const targetLength = Math.max(toIntegerOrInfinity(args[0]), 0),
        pad = args[1] === undefined ? " " : jsToString(args[1]);

    if (targetLength <= string.length || pad.length === 0) return string;
    if (targetLength > MAX_STRING_LENGTH) {
        throw new EvaluationError(`Result exceeds the maximum string length of ${MAX_STRING_LENGTH} characters.`);
    }

    let padding = "";
    while (padding.length < targetLength - string.length) {
        padding += pad;
    }
    padding = padding.slice(0, targetLength - string.length);
    return atStart ? padding + string : string + padding;
}

stringMethod("at", (thisArg, args) => {
    const string = stringReceiver(thisArg),
        index = toIntegerOrInfinity(args[0]),
        position = index < 0 ? string.length + index : index;
    return position >= 0 && position < string.length ? string[position] : undefined;
});

stringMethod("anchor", (thisArg, args) => createHTML(stringReceiver(thisArg), "a", "name", args[0]));
stringMethod("big", (thisArg) => createHTML(stringReceiver(thisArg), "big", null, null));
stringMethod("blink", (thisArg) => createHTML(stringReceiver(thisArg), "blink", null, null));
stringMethod("bold", (thisArg) => createHTML(stringReceiver(thisArg), "b", null, null));

stringMethod("charAt", (thisArg, args) => {
    const string = stringReceiver(thisArg),
        index = toIntegerOrInfinity(args[0]);
    return index >= 0 && index < string.length ? string[index] : "";
});

stringMethod("charCodeAt", (thisArg, args) => {
    const string = stringReceiver(thisArg),
        index = toIntegerOrInfinity(args[0]);
    return index >= 0 && index < string.length ? string.charCodeAt(index) : NaN;
});

stringMethod("codePointAt", (thisArg, args) => {
    const string = stringReceiver(thisArg),
        index = toIntegerOrInfinity(args[0]);
    return index >= 0 && index < string.length ? string.codePointAt(index) : undefined;
});

stringMethod("concat", (thisArg, args) => {
    let result = stringReceiver(thisArg);
    for (const argument of args) {
        result += jsToString(argument);
    }
    return checkStringLength(result);
});

stringMethod("endsWith", (thisArg, args) => {
    const string = stringReceiver(thisArg),
        search = jsToString(args[0]),
        end = args[1] === undefined ? string.length : relativeIndex(args[1], string.length);
    return string.slice(0, end).endsWith(search);
});

stringMethod("fixed", (thisArg) => createHTML(stringReceiver(thisArg), "tt", null, null));
stringMethod("fontcolor", (thisArg, args) => createHTML(stringReceiver(thisArg), "font", "color", args[0]));
stringMethod("fontsize", (thisArg, args) => createHTML(stringReceiver(thisArg), "font", "size", args[0]));

stringMethod("includes", (thisArg, args) => {
    const string = stringReceiver(thisArg),
        search = jsToString(args[0]),
        start = args[1] === undefined ? 0 : toIntegerOrInfinity(args[1]);
    return string.indexOf(search, Math.max(start, 0)) !== -1;
});

stringMethod("indexOf", (thisArg, args) => {
    const string = stringReceiver(thisArg),
        search = jsToString(args[0]),
        start = args[1] === undefined ? 0 : toIntegerOrInfinity(args[1]);
    return string.indexOf(search, Math.max(start, 0));
});

stringMethod("italics", (thisArg) => createHTML(stringReceiver(thisArg), "i", null, null));

stringMethod("lastIndexOf", (thisArg, args) => {
    const string = stringReceiver(thisArg),
        search = jsToString(args[0]),
        position = args[1] === undefined ? string.length : toIntegerOrInfinity(args[1]);
    return string.lastIndexOf(search, position);
});

stringMethod("link", (thisArg, args) => createHTML(stringReceiver(thisArg), "a", "href", args[0]));
stringMethod("padEnd", (thisArg, args) => padString(stringReceiver(thisArg), args, false));
stringMethod("padStart", (thisArg, args) => padString(stringReceiver(thisArg), args, true));

stringMethod("repeat", (thisArg, args) => {
    const string = stringReceiver(thisArg),
        count = toIntegerOrInfinity(args[0]);
    if (count < 0 || count === Infinity) throw new EvaluationError("Invalid repeat count.");
    if (string.length * count > MAX_STRING_LENGTH) {
        throw new EvaluationError(`Result exceeds the maximum string length of ${MAX_STRING_LENGTH} characters.`);
    }
    return string.repeat(count);
});

stringMethod("replace", (thisArg, args) => {
    const string = stringReceiver(thisArg),
        search = jsToString(args[0]),
        replacement = jsToString(args[1]);
    return checkStringLength(string.replace(search, replacement));
});

stringMethod("replaceAll", (thisArg, args) => {
    const string = stringReceiver(thisArg),
        search = jsToString(args[0]),
        replacement = jsToString(args[1]);

    if (search === "") {
        return checkStringLength(string.split("").join(replacement) + replacement);
    }

    let result = "",
        position = 0,
        index;
    while ((index = string.indexOf(search, position)) !== -1) {
        result += string.slice(position, index) + replacement;
        position = index + search.length;
        if (result.length > MAX_STRING_LENGTH) {
            throw new EvaluationError(`Result exceeds the maximum string length of ${MAX_STRING_LENGTH} characters.`);
        }
    }
    return checkStringLength(result + string.slice(position));
});

stringMethod("slice", (thisArg, args) => {
    const string = stringReceiver(thisArg);
    return string.slice(
        relativeIndex(args[0], string.length),
        args[1] === undefined ? string.length : relativeIndex(args[1], string.length)
    );
});

stringMethod("small", (thisArg) => createHTML(stringReceiver(thisArg), "small", null, null));

stringMethod("split", (thisArg, args) => {
    const string = stringReceiver(thisArg),
        separator = args[0] === undefined ? undefined : jsToString(args[0]),
        limit = args[1] === undefined ? 4294967295 : toIntegerOrInfinity(args[1]);
    const result = separator === undefined ? [string] : string.split(separator, limit);
    checkArrayLength(result.length);
    return new JSArray(result);
});

stringMethod("startsWith", (thisArg, args) => {
    const string = stringReceiver(thisArg),
        search = jsToString(args[0]),
        start = args[1] === undefined ? 0 : toIntegerOrInfinity(args[1]);
    return string.startsWith(search, Math.max(start, 0));
});

stringMethod("strike", (thisArg) => createHTML(stringReceiver(thisArg), "strike", null, null));
stringMethod("sub", (thisArg) => createHTML(stringReceiver(thisArg), "sub", null, null));
stringMethod("substr", (thisArg, args) => {
    const string = stringReceiver(thisArg);
    return string.substr(
        toIntegerOrInfinity(args[0]),
        args[1] === undefined ? string.length : toIntegerOrInfinity(args[1])
    );
});
stringMethod("substring", (thisArg, args) => {
    const string = stringReceiver(thisArg);
    return string.substring(
        toIntegerOrInfinity(args[0]),
        args[1] === undefined ? string.length : toIntegerOrInfinity(args[1])
    );
});
stringMethod("sup", (thisArg) => createHTML(stringReceiver(thisArg), "sup", null, null));
stringMethod("toLowerCase", (thisArg) => stringReceiver(thisArg).toLowerCase());
stringMethod("toString", (thisArg) => stringReceiver(thisArg));
stringMethod("toUpperCase", (thisArg) => stringReceiver(thisArg).toUpperCase());
stringMethod("trim", (thisArg) => stringReceiver(thisArg).replace(/^\s+|\s+$/g, ""));
stringMethod("trimEnd", (thisArg) => stringReceiver(thisArg).replace(/\s+$/, ""));
stringMethod("trimStart", (thisArg) => stringReceiver(thisArg).replace(/^\s+/, ""));
stringMethod("valueOf", (thisArg) => stringReceiver(thisArg));

// Number.prototype methods.
const NUMBER_METHODS = new Map();

/**
 * Registers a Number.prototype method.
 *
 * @param {string} name
 * @param {Function} impl
 */
function numberMethod(name, impl) {
    NUMBER_METHODS.set(name, builtin(name, impl));
}

numberMethod("toExponential", (thisArg, args) => thisArg.toExponential(args[0] === undefined ? undefined : toIntegerOrInfinity(args[0])));
numberMethod("toFixed", (thisArg, args) => thisArg.toFixed(args[0] === undefined ? 0 : toIntegerOrInfinity(args[0])));
numberMethod("toPrecision", (thisArg, args) => thisArg.toPrecision(args[0] === undefined ? undefined : toIntegerOrInfinity(args[0])));
numberMethod("toString", (thisArg, args) => {
    const radix = args[0] === undefined ? 10 : toIntegerOrInfinity(args[0]);
    if (radix < 2 || radix > 36) throw new EvaluationError("Invalid radix.");
    return thisArg.toString(radix);
});
numberMethod("valueOf", (thisArg) => thisArg);

// Boolean.prototype methods.
const BOOLEAN_METHODS = new Map([
    ["toString", builtin("toString", thisArg => thisArg ? "true" : "false")],
    ["valueOf", builtin("valueOf", thisArg => thisArg)],
]);

// Object.prototype methods.
const OBJECT_METHODS = new Map([
    ["hasOwnProperty", builtin("hasOwnProperty", (thisArg, args) => {
        if (thisArg instanceof JSObject) return thisArg.entries.has(toPropertyKey(args[0]));
        return false;
    })],
    ["isPrototypeOf", builtin("isPrototypeOf", () => false)],
    ["propertyIsEnumerable", builtin("propertyIsEnumerable", (thisArg, args) => {
        if (thisArg instanceof JSObject) return thisArg.entries.has(toPropertyKey(args[0]));
        return false;
    })],
    ["toLocaleString", builtin("toLocaleString", thisArg => jsToString(thisArg))],
    ["toString", builtin("toString", thisArg => {
        if (thisArg instanceof JSArray) return jsToString(thisArg);
        return "[object Object]";
    })],
    ["valueOf", builtin("valueOf", thisArg => thisArg)],
]);

/**
 * Returns a property of an array value.
 *
 * @param {JSArray} array
 * @param {string} key
 * @returns {*}
 */
function getArrayProperty(array, key) {
    if (key === "constructor") return ARRAY_CONSTRUCTOR;
    if (key === "length") return array.elements.length;
    if (key === "__proto__") return undefined;
    if (isArrayIndex(key)) return array.elements[Number(key)];

    const method = ARRAY_METHODS.get(key);
    if (method) return method;
    return OBJECT_METHODS.get(key);
}

/**
 * Returns a property of a string value.
 *
 * @param {string} string
 * @param {string} key
 * @returns {*}
 */
function getStringProperty(string, key) {
    if (key === "constructor") return STRING_CONSTRUCTOR;
    if (key === "length") return string.length;
    if (key === "__proto__") return undefined;
    if (isArrayIndex(key)) return string[Number(key)];

    const method = STRING_METHODS.get(key);
    if (method) return method;
    return OBJECT_METHODS.get(key);
}

/**
 * Returns a property of a number value.
 *
 * @param {number} number
 * @param {string} key
 * @returns {*}
 */
function getNumberProperty(number, key) {
    if (key === "constructor") return NUMBER_CONSTRUCTOR;
    if (key === "__proto__") return undefined;
    return NUMBER_METHODS.get(key) || OBJECT_METHODS.get(key);
}

/**
 * Returns a property of a boolean value.
 *
 * @param {boolean} boolean
 * @param {string} key
 * @returns {*}
 */
function getBooleanProperty(boolean, key) {
    if (key === "constructor") return BOOLEAN_CONSTRUCTOR;
    if (key === "__proto__") return undefined;
    return BOOLEAN_METHODS.get(key) || OBJECT_METHODS.get(key);
}

/**
 * Returns a property of a function value.
 *
 * @param {JSFunction} func
 * @param {string} key
 * @returns {*}
 */
function getFunctionProperty(func, key) {
    switch (key) {
        case "constructor":
            return FUNCTION_CONSTRUCTOR;
        case "name":
            return func.name;
        case "length":
            return 0;
        case "prototype": {
            const prototype = new JSObject();
            prototype.entries.set("constructor", func);
            return prototype;
        }
        case "call":
            return builtin("call", (thisArg, args, evaluator) => {
                return evaluator.call(func, thisArg, args);
            });
        case "apply":
            return builtin("apply", (thisArg, args, evaluator) => {
                const targetThis = args[0],
                    argumentsArray = args[1];
                let callArguments = [];

                if (argumentsArray !== undefined && argumentsArray !== null) {
                    if (!(argumentsArray instanceof JSArray)) {
                        throw new EvaluationError("CreateListFromArrayLike called on non-object.");
                    }
                    callArguments = argumentsArray.elements;
                }
                return evaluator.call(func, targetThis, callArguments);
            });
        case "bind":
            return builtin("bind", (thisArg, args, evaluator) => {
                const boundThis = args[0],
                    boundArguments = args.slice(1);
                return builtin(`bound ${func.name}`, (ignoredThis, callArguments) => {
                    return evaluator.call(func, boundThis, boundArguments.concat(callArguments));
                });
            });
        case "toString":
            return builtin("toString", () => jsToString(func));
        case "valueOf":
            return builtin("valueOf", () => func);
        case "caller":
        case "arguments":
        case "__proto__":
            return undefined;
    }

    if (func === STRING_CONSTRUCTOR) {
        if (key === "fromCharCode") return STRING_FROM_CHAR_CODE;
        if (key === "fromCodePoint") return STRING_FROM_CODE_POINT;
    }
    if (func === ARRAY_CONSTRUCTOR) {
        if (key === "isArray") return ARRAY_IS_ARRAY;
        if (key === "from") return ARRAY_FROM;
        if (key === "of") return ARRAY_OF;
    }
    if (func === NUMBER_CONSTRUCTOR) {
        if (key === "isNaN") return NUMBER_IS_NAN;
        if (key === "isFinite") return NUMBER_IS_FINITE;
        if (key === "isInteger") return NUMBER_IS_INTEGER;
        if (key === "parseInt") return NUMBER_PARSE_INT;
        if (key === "parseFloat") return NUMBER_PARSE_FLOAT;
    }
    if (func === OBJECT_CONSTRUCTOR) {
        if (key === "keys") return OBJECT_KEYS;
        if (key === "values") return OBJECT_VALUES;
        if (key === "entries") return OBJECT_ENTRIES;
        if (key === "assign") return OBJECT_ASSIGN;
        if (key === "create") return OBJECT_CREATE;
        if (key === "is") return OBJECT_IS;
    }

    return undefined;
}

/**
 * Returns a property of a regular expression value.
 *
 * @param {JSRegExp} regexp
 * @param {string} key
 * @returns {*}
 */
function getRegExpProperty(regexp, key) {
    if (key === "constructor") return REGEXP_CONSTRUCTOR;
    if (key === "__proto__") return undefined;
    if (key === "source") return regexp.source;
    if (key === "flags") return regexp.flags;
    if (key === "global") return regexp.flags.includes("g");
    if (key === "ignoreCase") return regexp.flags.includes("i");
    if (key === "multiline") return regexp.flags.includes("m");
    if (key === "sticky") return regexp.flags.includes("y");
    if (key === "unicode") return regexp.flags.includes("u");
    if (key === "dotAll") return regexp.flags.includes("s");
    if (key === "lastIndex") return 0;
    if (key === "toString") return builtin("toString", () => jsToString(regexp));
    if (key === "valueOf") return builtin("valueOf", () => regexp);
    return OBJECT_METHODS.get(key);
}

/**
 * Returns a property of an object value.
 *
 * @param {JSObject} object
 * @param {string} key
 * @returns {*}
 */
function getObjectProperty(object, key) {
    if (key === "constructor") return OBJECT_CONSTRUCTOR;
    if (key === "__proto__") return undefined;
    if (object.entries.has(key)) return object.entries.get(key);
    return OBJECT_METHODS.get(key);
}

/**
 * Returns a property of any interpreter value.
 *
 * @param {*} value
 * @param {*} key
 * @returns {*}
 */
function getProperty(value, key) {
    const propertyKey = toPropertyKey(key);

    if (value === undefined || value === null) {
        throw new EvaluationError(`Cannot read properties of ${value} (reading '${propertyKey}').`);
    }

    if (typeof value === "string") return getStringProperty(value, propertyKey);
    if (typeof value === "number") return getNumberProperty(value, propertyKey);
    if (typeof value === "boolean") return getBooleanProperty(value, propertyKey);
    if (value instanceof JSArray) return getArrayProperty(value, propertyKey);
    if (value instanceof JSFunction) return getFunctionProperty(value, propertyKey);
    if (value instanceof JSRegExp) return getRegExpProperty(value, propertyKey);
    if (value instanceof JSObject) return getObjectProperty(value, propertyKey);

    throw new EvaluationError(`Unsupported value type: ${typeof value}.`);
}

/**
 * Interprets a parsed JS6Chars expression.
 */
class Evaluator {
    /**
     * Creates a new evaluator with fresh limit counters.
     */
    constructor() {
        this.steps = 0;
        this.callDepth = 0;
    }

    /**
     * Counts an evaluation step and enforces the global limit.
     */
    tick() {
        if (++this.steps > MAX_STEPS) {
            throw new EvaluationError("Evaluation limit exceeded.");
        }
    }

    /**
     * Evaluates an expression node.
     *
     * @param {Object} node
     * @returns {*}
     */
    evaluate(node) {
        this.tick();

        switch (node.type) {
            case "Program": {
                let result;
                for (const statement of node.body) {
                    if (statement.type !== "ExpressionStatement") {
                        throw new EvaluationError(`Unsupported statement: ${statement.type}.`);
                    }
                    result = this.evaluate(statement.expression);
                }
                return result;
            }
            case "ExpressionStatement":
                return this.evaluate(node.expression);
            case "ArrayExpression": {
                checkArrayLength(node.elements.length);
                return new JSArray(node.elements.map(element => {
                    return element === null ? undefined : this.evaluate(element);
                }));
            }
            case "UnaryExpression": {
                const value = this.evaluate(node.argument);
                switch (node.operator) {
                    case "!":
                        return !jsToBoolean(value);
                    case "+":
                        return jsToNumber(value);
                    default:
                        throw new EvaluationError(`Unsupported unary operator: ${node.operator}.`);
                }
            }
            case "BinaryExpression": {
                const left = this.evaluate(node.left),
                    right = this.evaluate(node.right);
                if (node.operator === "+") return jsAdd(left, right);
                throw new EvaluationError(`Unsupported binary operator: ${node.operator}.`);
            }
            case "MemberExpression": {
                const object = this.evaluate(node.object),
                    key = node.computed ? this.evaluate(node.property) : node.property.name;
                return getProperty(object, key);
            }
            case "CallExpression": {
                let thisArg,
                    func;

                if (node.callee.type === "MemberExpression") {
                    thisArg = this.evaluate(node.callee.object);
                    const key = node.callee.computed ? this.evaluate(node.callee.property) : node.callee.property.name;
                    func = getProperty(thisArg, key);
                } else {
                    func = this.evaluate(node.callee);
                }

                const args = node.arguments.map(argument => {
                    if (argument.type === "SpreadElement") {
                        throw new EvaluationError("Spread arguments are not supported.");
                    }
                    return this.evaluate(argument);
                });

                return this.call(func, thisArg, args);
            }
            case "Literal":
                if (node.regex) return new JSRegExp(node.regex.pattern, node.regex.flags);
                return node.value;
            case "Identifier":
                if (node.name === "undefined") return undefined;
                if (node.name === "NaN") return NaN;
                if (node.name === "Infinity") return Infinity;
                if (node.name === "String") return STRING_CONSTRUCTOR;
                if (node.name === "Array") return ARRAY_CONSTRUCTOR;
                if (node.name === "Number") return NUMBER_CONSTRUCTOR;
                if (node.name === "Boolean") return BOOLEAN_CONSTRUCTOR;
                if (node.name === "Object") return OBJECT_CONSTRUCTOR;
                if (node.name === "RegExp") return REGEXP_CONSTRUCTOR;
                if (node.name === "Function") return FUNCTION_CONSTRUCTOR;
                throw new EvaluationError(`Unsupported identifier: ${node.name}.`);
            default:
                throw new EvaluationError(`Unsupported syntax: ${node.type}.`);
        }
    }

    /**
     * Calls an interpreter function.
     *
     * @param {*} func
     * @param {*} thisArg
     * @param {Array} args
     * @returns {*}
     */
    call(func, thisArg, args) {
        if (!(func instanceof JSFunction)) {
            throw new EvaluationError(`Value is not a function: ${jsToString(func)}.`);
        }
        if (this.callDepth >= MAX_CALL_DEPTH) {
            throw new EvaluationError("Maximum call depth exceeded.");
        }

        this.tick();
        this.callDepth++;
        try {
            return func.impl(thisArg, args, this);
        } finally {
            this.callDepth--;
        }
    }

    /**
     * Reads a property using the same semantics as the evaluator.
     *
     * @param {*} value
     * @param {*} key
     * @returns {*}
     */
    getProperty(value, key) {
        return getProperty(value, key);
    }
}

/**
 * Decodes a JS6Chars expression without executing any of the decoded code.
 *
 * @param {string} input
 * @returns {string}
 */
export function decodeJS6Chars(input) {
    if (typeof input !== "string") {
        throw new OperationError("Input must be a string.");
    }
    if (input.length > MAX_INPUT_LENGTH) {
        throw new OperationError(`Input exceeds the maximum length of ${MAX_INPUT_LENGTH} characters.`);
    }
    if (!ALLOWED_CHARACTERS.test(input)) {
        for (let i = 0; i < input.length; i++) {
            if (!ALLOWED_CHARACTERS.test(input[i])) {
                throw new OperationError(`Invalid character at position ${i}: ${input[i]}`);
            }
        }
    }
    if (input.trim().length === 0) return "";

    let ast;
    try {
        ast = esprima.parseScript(input);
    } catch (err) {
        if (err instanceof RangeError) {
            throw new OperationError("Unable to parse JS6Chars input: the expression is too deeply nested.");
        }
        throw new OperationError(`Unable to parse JS6Chars input: ${err.message}`);
    }

    try {
        const result = new Evaluator().evaluate(ast);
        return checkStringLength(jsToString(result));
    } catch (err) {
        if (err instanceof DecodedCode) {
            return checkStringLength(err.code);
        }
        if (err instanceof OperationError) {
            throw err;
        }
        if (err instanceof EvaluationError) {
            throw new OperationError(err.message);
        }
        if (err instanceof RangeError) {
            throw new OperationError("Unable to decode: the expression is too deeply nested.");
        }
        throw new OperationError(`Unable to decode: ${err.message}`);
    }
}
