/**
 * Wrap operations for consumption in Node.
 *
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

/*eslint no-console: ["off"] */

import NodeDish from "./NodeDish";
import NodeRecipe from "./NodeRecipe";
import OperationConfig from "../core/config/OperationConfig.json";
import { sanitise, removeSubheadingsFromArray, sentenceToCamelCase } from "./apiUtils";
import ExludedOperationError from "../core/errors/ExcludedOperationError";


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
function transformArgs(opArgsList, newArgs) {

    if (newArgs && Array.isArray(newArgs)) {
        return newArgs;
    }

    // Filter out arg values that are list subheadings - they are surrounded in [].
    // See Strings op for example.
    const opArgs = Object.assign([], opArgsList).map((a) => {
        if (Array.isArray(a.value)) {
            a.value = removeSubheadingsFromArray(a.value);
        }
        return a;
    });

    // Reconcile object style arg info to fit operation args shape.
    if (newArgs) {
        Object.keys(newArgs).map((key) => {
            const index = opArgs.findIndex((arg) => {
                return arg.name.toLowerCase().replace(/ /g, "") ===
                    key.toLowerCase().replace(/ /g, "");
            });

            if (index > -1) {
                const argument = opArgs[index];
                if (argument.type === "toggleString") {
                    if (typeof newArgs[key] === "string") {
                        argument.string = newArgs[key];
                    } else {
                        argument.string = newArgs[key].string;
                        argument.option = newArgs[key].option;
                    }
                } else if (argument.type === "editableOption") {
                    // takes key: "option", key: {name, val: "string"}, key: {name, val: [...]}
                    argument.value = typeof newArgs[key] === "string" ? newArgs[key]: newArgs[key].value;
                } else {
                    argument.value = newArgs[key];
                }
            }
        });
    }

    // Sanitise args
    return opArgs.map((arg) => {
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
    });
}


/**
 * Ensure an input is a SyncDish object.
 * @param input
 */
function ensureIsDish(input) {
    if (!input) {
        return new NodeDish();
    }

    if (input instanceof NodeDish) {
        return input;
    } else {
        return new NodeDish(input);
    }
}


/**
 * prepareOp: transform args, make input the right type.
 * Also convert any Buffers to ArrayBuffers.
 * @param opInstance - instance of the operation
 * @param input - operation input
 * @param args - operation args
 */
function prepareOp(opInstance, input, args) {
    const dish = ensureIsDish(input);
    // Transform object-style args to original args array
    const transformedArgs = transformArgs(opInstance.args, args);
    const transformedInput = dish.get(opInstance.inputType);
    return {transformedInput, transformedArgs};
}


/**
 * createArgOptions
 *
 * Create an object of options for each option or togglestring argument
 * in the given operation.
 *
 * Argument names are converted to camel case for consistency.
 *
 * @param {Operation} op - the operation to extract args from
 * @returns {{}} - arrays of options for option and toggleString args.
*/
function createArgOptions(op) {
    const result = {};
    op.args.forEach((a) => {
        if (a.type === "option" || a.type === "editableOption") {
            result[sentenceToCamelCase(a.name)] = removeSubheadingsFromArray(a.value);
        } else if (a.type === "toggleString") {
            result[sentenceToCamelCase(a.name)] = removeSubheadingsFromArray(a.toggleValues);
        }
    });

    return result;
}


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
            return new NodeDish({
                value: result,
                type: opInstance.outputType,
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
            console.log('Result:');
            console.log(result);
            return new NodeDish({
                value: result,
                type: opInstance.outputType,
            });
        };
    }

    // used in chef.help
    wrapped.opName = OpClass.name;
    wrapped.argOptions = createArgOptions(opInstance);

    return wrapped;
}


/**
 * help: Give information about operations matching the given search term,
 * or inputted operation.
 *
 * @param {String || wrapped operation} input - the name of the operation to get help for.
 * Case and whitespace are ignored in search.
 * @returns {Object[]} Config of matching operations.
 */
export function help(input) {
    let searchTerm = false;
    if (typeof input === "string") {
        searchTerm = input;
    } else if (typeof input === "function") {
        searchTerm = input.opName;
    }

    if (!searchTerm) {
        return null;
    }

    // Look for matches in operation name and description, listing name
    // matches first.
    const matches = Object.keys(OperationConfig)
        // hydrate operation: swap op name for op config object (with name)
        .map((m) => {
            const hydrated = OperationConfig[m];
            hydrated.name = m;

            // Return hydrated along with what type of match it was
            return {
                hydrated,
                nameMatch: sanitise(hydrated.name).includes(sanitise(searchTerm)),
                descMatch: sanitise(hydrated.description).includes(sanitise(searchTerm))
            };
        })
        // Filter out non-matches
        .filter((result) => {
            return result.nameMatch || result.descMatch;
        })
        // sort results with name match first
        .sort((a, b) => {
            const aInt = a.nameMatch ? 1 : 0;
            const bInt = b.nameMatch ? 1  : 0;
            return bInt - aInt;
        })
        // extract just the hydrated config
        .map(result => result.hydrated);

    // Concatenate matches but remove duplicates
    if (matches && matches.length) {
        console.log(`${matches.length} results found.`);
        return matches;
    }

    console.log("No results found.");
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
        const recipe =  new NodeRecipe(recipeConfig);
        const dish = ensureIsDish(input);
        return recipe.execute(dish);
    };
}


/**
 * explainExcludedFunction
 *
 * Explain that the given operation is not included in the Node.js version.
 * @param {String} name - name of operation
 */
export function explainExludedFunction(name) {
    /**
     * Throw new error type with useful message.
    */
    const func = () => {
        throw new ExludedOperationError(`Sorry, the ${name} operation is not available in the Node.js version of CyberChef.`);
    };
    // Add opName prop so NodeRecipe can handle it, just like wrap does.
    func.opName = name;
    return func;
}
