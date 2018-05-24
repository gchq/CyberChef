/**
 * Wrap operations for consumption in Node
 *
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Dish from "../core/Dish";

/**
 * Extract default arg value from operation argument
 * @param {Object} arg - an arg from an operation
 */
function extractArg(arg) {
    if (arg.type === "option" || arg.type === "editableOption") {
        return arg.value[0];
    }

    return arg.value;
}

/**
 * transformArgs
 *
 * Take the default args array and update with any user-defined
 * operation arguments. Allows user to define argyments in object style,
 * with accommodation name matching. Using named args in the API is more
 * clear to the user.
 *
 * Argument name matching is case and space insensitive
 * @private
 * @param {Object[]} originalArgs
 * @param {Object} newArgs
 */
function transformArgs(originalArgs, newArgs) {
    const allArgs = Object.assign([], originalArgs);

    if (newArgs) {
        Object.keys(newArgs).map((key) => {
            const index = allArgs.findIndex((arg) => {
                return arg.name.toLowerCase().replace(/ /g, "") ===
                    key.toLowerCase().replace(/ /g, "");
            });
            if (index > -1) {
                allArgs[index].value = newArgs[key];
            }
        });
    }
    return allArgs.map(extractArg);
}

/**
 * Wrap an operation to be consumed by node API.
 * new Operation().run() becomes operation()
 * Perform type conversion on input
 * @private
 * @param {Operation} Operation
 * @returns {Function} The operation's run function, wrapped in
 * some type conversion logic
 */
export function wrap(Operation) {
    /**
     * Wrapped operation run function
     */
    return async (input, args=null, callback) => {

        if (callback && typeof callback !== "function") {
            throw TypeError("Expected callback to be a function");
        }

        if (!callback && typeof args === "function") {
            callback = args;
            args = null;
        }

        const operation = new Operation();
        const dish = new Dish();

        const type = Dish.typeEnum(input.constructor.name);
        dish.set(input, type);

        args = transformArgs(operation.args, args);
        const transformedInput = await dish.get(operation.inputType);

        // Allow callback or promsise / async-await
        if (callback) {
            try {
                const out = operation.run(transformedInput, args);
                callback(null, out);
            } catch (e) {
                callback(e);
            }
        } else {
            return operation.run(transformedInput, args);
        }
    };
}


/**
 * First draft
 * @namespace Api
 * @param input
 * @param type
 */
export async function translateTo(input, type) {
    const dish = new Dish();

    const initialType = Dish.typeEnum(input.constructor.name);

    dish.set(input, initialType);
    return await dish.get(type);
}


/**
 * Extract properties from an operation by instantiating it and
 * returning some of its properties for reference.
 * @param {Operation}  Operation - the operation to extract info from
 * @returns {Object} operation properties
 */
function extractOperationInfo(Operation) {
    const operation = new Operation();
    return {
        name: operation.name,
        module: operation.module,
        description: operation.description,
        inputType: operation.inputType,
        outputType: operation.outputType,
        // Make arg names lowercase, no spaces to encourage non-sentence
        // caps in repl
        args: Object.assign([], operation.args).map((s) => {
            s.name = decapitalise(s.name).replace(/ /g, "");
            return s;
        })
    };
}


/**
 * @namespace Api
 * @param {Object} operations - an object filled with operations.
 * @param {String} searchTerm - the name of the operation to get help for.
 * Case and whitespace are ignored in search.
 * @returns {Object} listing properties of function
 */
export function help(operations, searchTerm) {
    if (typeof searchTerm === "string") {
        const operation = operations[Object.keys(operations).find(o =>
            o.toLowerCase() === searchTerm.replace(/ /g, "").toLowerCase())];
        if (operation) {
            return extractOperationInfo(operation);
        }
    }
    return null;
}


/**
 * SomeName => someName
 * @param {String} name - string to be altered
 * @returns {String} decapitalised
 */
export function decapitalise(name) {
    // Don't decapitalise names that start with 2+ caps
    if (/^[A-Z0-9]{2,}/g.test(name)) {
        return name;
    }
    // reserved. Don't change for now.
    if (name === "Return") {
        return name;
    }

    return `${name.charAt(0).toLowerCase()}${name.substr(1)}`;
}
