/**
 * Wrap operations for consumption in Node.
 *
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import SyncDish from "./SyncDish";

/**
 * Extract default arg value from operation argument
 * @param {Object} arg - an arg from an operation
 */
function extractArg(arg) {
    if (arg.type === "option") {
        // pick default option if not already chosen
        return typeof arg.value === "string" ? arg.value : arg.value[0];
    }

    if (arg.type === "editableOption") {
        return typeof arg.value === "string" ? arg.value : arg.value[0].value;
    }

    if (arg.type === "toggleString") {
        // ensure string and option exist when user hasn't defined
        arg.string = arg.string || "";
        arg.option = arg.option || arg.toggleValues[0];
        return arg;
    }

    return arg.value;
}

/**
 * transformArgs
 *
 * Take the default args array and update with any user-defined
 * operation arguments. Allows user to define arguments in object style,
 * with accommodating name matching. Using named args in the API is more
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
                const argument = allArgs[index];
                if (["toggleString"].indexOf(argument.type) > -1) {
                    argument.string = newArgs[key].string;
                    argument.option = newArgs[key].option;
                } else if (argument.type === "editableOption") {
                    // takes key: "option", key: {name, val: "string"}, key: {name, val: [...]}
                    argument.value = typeof newArgs[key] === "string" ? newArgs[key]: newArgs[key].value;
                } else {
                    argument.value = newArgs[key];
                }
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
export function wrap(OpClass) {
    /**
     * Wrapped operation run function
     * @param {*} input
     * @param {Object[]} args
     * @returns {SyncDish} operation's output, on a Dish.
     * @throws {OperationError} if the operation throws one.
     */
    return (input, args=null) => {
        const operation = new OpClass();

        let dish;
        if (input instanceof SyncDish) {
            dish = input;
        } else {
            dish = new SyncDish();
            const type = SyncDish.typeEnum(input.constructor.name);
            dish.set(input, type);
        }
        args = transformArgs(operation.args, args);
        const transformedInput = dish.get(operation.inputType);
        const result = operation.run(transformedInput, args);
        return new SyncDish({
            value: result,
            type: operation.outputType
        });
    };
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


/**
 * Extract properties from an operation by instantiating it and
 * returning some of its properties for reference.
 * @param {Operation}  Operation - the operation to extract info from
 * @returns {Object} operation properties
 */
function extractOperationInfo(Operation) {
    const operation = new Operation();
    return {
        name: decapitalise(operation.name).replace(/ /g, ""),
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
 * @param {Operation[]} operations - an object filled with operations.
 * @param {String} searchTerm - the name of the operation to get help for.
 * Case and whitespace are ignored in search.
 * @returns {Function} taking search term and outputting description.
 */
export function help(operations) {
    return function(searchTerm) {
        if (typeof searchTerm === "string") {
            const operation = operations
                .find(o => o.name.toLowerCase() === searchTerm.replace(/ /g, "").toLowerCase());
            if (operation) {
                return extractOperationInfo(operation);
            }
            return null;
        }
        return null;
    };
}

