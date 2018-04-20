/**
 * Wrap operations in a
 *
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Dish from "../core/Dish";
import log from "loglevel";

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
 * Wrap an operation to be consumed by node API.
 * new Operation().run() becomes operation()
 * @param Operation 
 */
export default function wrap(Operation) {
    /**
     * 
     */
    return async (input, args=null) => {
        const operation = new Operation();
        const dish = new Dish(input);

        try {
            dish.findType();
        } catch (e) {
            log.debug(e);
        }

        if (!args) {
            args = operation.args.map(extractArg);
        } else {
            // Allows single arg ops to have arg defined not in array
            if (!(args instanceof Array)) {
                args = [args];
            }
        }
        const transformedInput = await dish.get(Dish.typeEnum(operation.inputType));
        return operation.run(transformedInput, args);
    };
}
