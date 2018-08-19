/**
 * Wrap operations for consumption in Node.
 *
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Dish from "../core/Dish";
import SyncDish from "./SyncDish";
import Recipe from "./Recipe";
import OperationConfig from "./config/OperationConfig.json";
import { sanitise } from "./apiUtils";


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
 * @param {Object[]} originalArgs - the operation-s args list
 * @param {Object} newArgs - any inputted args
 */
function transformArgs(originalArgs, newArgs) {

    // Filter out arg values that are list subheadings - they are surrounded in [].
    // See Strings op for example.
    const allArgs = Object.assign([], originalArgs).map((a) => {
        if (Array.isArray(a.value)) {
            a.value = a.value.filter((v) => {
                if (typeof v === "string") {
                    return !v.match(/^\[[\s\S]*\]$/); // Matches anything surrounded in [ ]
                }
                return true;
            });
        }
        return a;
    });

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
 * Ensure an input is a SyncDish object.
 * @param input
 */
function ensureIsDish(input) {
    if (!input) {
        return new SyncDish();
    }

    let dish;
    if (input instanceof SyncDish) {
        dish = input;
    } else {
        dish = new SyncDish();
        const type = Dish.typeEnum(input.constructor.name);
        dish.set(input, type);
    }
    return dish;
};

/**
 * prepareOp: transform args, make input the right type.
 * @param opInstance - instance of the operation
 * @param input - operation input
 * @param args - operation args
 */
function prepareOp(opInstance, input, args) {
    const dish = ensureIsDish(input);
    let transformedArgs;
    // Transform object-style args to original args array
    if (!Array.isArray(args)) {
        transformedArgs = transformArgs(opInstance.args, args);
    } else {
        transformedArgs = args;
    }
    const transformedInput = dish.get(opInstance.inputType);
    return {transformedInput, transformedArgs};
};

/**
 * Wrap an operation to be consumed by node API.
 * Checks to see if run function is async or not.
 * new Operation().run() becomes operation()
 * Perform type conversion on input
 * @private
 * @param {Operation} Operation
 * @returns {Function} The operation's run function, wrapped in
 * some type conversion logic
 */
export function wrap(OpClass) {

    // Check to see if class's run function is async.
    const opInstance = new OpClass();
    const isAsync = opInstance.run.constructor.name === "AsyncFunction";

    let wrapped;

    // If async, wrap must be async.
    if (isAsync) {
        /**
         * Async wrapped operation run function
         * @param {*} input
         * @param {Object | String[]} args - either in Object or normal args array
         * @returns {Promise<SyncDish>} operation's output, on a Dish.
         * @throws {OperationError} if the operation throws one.
         */
        wrapped = async (input, args=null) => {
            const {transformedInput, transformedArgs} = prepareOp(opInstance, input, args);
            const result = await opInstance.run(transformedInput, transformedArgs);
            return new SyncDish({
                value: result,
                type: opInstance.outputType
            });
        };
    } else {
        /**
         * wrapped operation run function
         * @param {*} input
         * @param {Object | String[]} args - either in Object or normal args array
         * @returns {SyncDish} operation's output, on a Dish.
         * @throws {OperationError} if the operation throws one.
         */
        wrapped = (input, args=null) => {
            const {transformedInput, transformedArgs} = prepareOp(opInstance, input, args);
            const result = opInstance.run(transformedInput, transformedArgs);
            return new SyncDish({
                value: result,
                type: opInstance.outputType
            });
        };
    }

    // used in chef.help
    wrapped.opName = OpClass.name;
    return wrapped;
}

/**
 * @namespace Api
 * @param {String} searchTerm - the name of the operation to get help for.
 * Case and whitespace are ignored in search.
 * @returns {Object} Describe function matching searchTerm.
 */
export function help(searchTerm) {
    let sanitised = false;
    if (typeof searchTerm === "string") {
        sanitised = searchTerm;
    } else if (typeof searchTerm === "function") {
        sanitised = searchTerm.opName;
    }

    if (!sanitised) {
        return null;
    }

    const key = Object.keys(OperationConfig)
        .find(o => sanitise(o) === sanitise(sanitised));
    if (key) {
        const result = OperationConfig[key];
        result.name = key;
        return result;
    }
    return null;
}

/**
 * bake [Wrapped] - Perform an array of operations on some input.
 * @param operations array of chef's operations (used in wrapping stage)
 * @returns {Function}
 */
export function bake(operations){

    /**
     * bake
     *
     * @param {*} input - some input for a recipe.
     * @param {String | Function | String[] | Function[] | [String | Function]} recipeConfig -
     * An operation, operation name, or an array of either.
     * @returns {SyncDish} of the result
     * @throws {TypeError} if invalid recipe given.
     */
    return function(input, recipeConfig) {
        const recipe =  new Recipe(recipeConfig);
        const dish = ensureIsDish(input);
        return recipe.execute(dish);
    };
}
