/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import util from "util";
import Dish from "../core/Dish.mjs";

/**
 * Subclass of Dish for use in the Node.js environment.
 *
 * Adds some helper functions and improves coercion for Node.js logging.
 */
class NodeDish extends Dish {

    /**
    * Create a Dish
    * @param {any} inputOrDish - The dish input
    * @param {String|Number} - The dish type, as enum or string
    */
    constructor(inputOrDish=null, type=null) {

        // Allow `fs` file input:
        // Any node fs Buffers transformed to array buffer
        // Use Array.from as Uint8Array doesnt pass instanceof Array test
        if (Buffer.isBuffer(inputOrDish)) {
            inputOrDish = Array.from(inputOrDish);
            type = Dish.BYTE_ARRAY;
        }
        super(inputOrDish, type);
    }

    /**
     * Apply the inputted operation to the dish.
     *
     * @param {WrappedOperation} operation the operation to perform
     * @param {*} args - any arguments for the operation
     * @returns {Dish} a new dish with the result of the operation.
     */
    apply(operation, args=null) {
        return operation(this, args);
    }

    /**
     * alias for get
     * @param args see get args
     */
    to(...args) {
        return this.get(...args);
    }

    /**
     * Avoid coercion to a String primitive.
     */
    toString() {
        return this.presentAs(Dish.typeEnum("string"));
    }

    /**
     * What we want to log to the console.
     */
    [util.inspect.custom](depth, options) {
        return this.presentAs(Dish.typeEnum("string"));
    }

    /**
     * Backwards compatibility for node v6
     * Log only the value to the console in node.
     */
    inspect() {
        return this.presentAs(Dish.typeEnum("string"));
    }

    /**
     * Avoid coercion to a Number primitive.
     */
    valueOf() {
        return this.presentAs(Dish.typeEnum("number"));
    }

}

export default NodeDish;
