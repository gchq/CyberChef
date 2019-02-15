/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import util from "util";
import Dish from "../core/Dish";

/**
 * Subclass of Dish where `get` and `_translate` are synchronous.
 * Also define functions to improve coercion behaviour.
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
        // NOT Buffer.buff, as this makes a buffer of the whole object.
        if (Buffer.isBuffer(inputOrDish)) {
            inputOrDish = new Uint8Array(inputOrDish).buffer;
        }

        super(inputOrDish, type);
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
        return this.get(Dish.typeEnum("string"));
    }

    /**
     * What we want to log to the console.
     */
    [util.inspect.custom](depth, options) {
        return this.get(Dish.typeEnum("string"));
    }

    /**
     * Backwards compatibility for node v6
     * Log only the value to the console in node.
     */
    inspect() {
        return this.get(Dish.typeEnum("string"));
    }

    /**
     * Avoid coercion to a Number primitive.
     */
    valueOf() {
        return this.get(Dish.typeEnum("number"));
    }

}

export default NodeDish;
