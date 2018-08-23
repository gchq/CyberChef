/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import util from "util";
import Utils from "../core/Utils";
import Dish from "../core/Dish";
import BigNumber from "bignumber.js";
import log from "loglevel";
import * as ops from "./index";

/**
 * Subclass of Dish where `get` and `_translate` are synchronous.
 * Also define functions to improve coercion behaviour.
 */
class SyncDish extends Dish {

    /** */
    constructor(inputOrDish=null, type=null) {
        super(inputOrDish);
        
        // Add operations to make it composable
        for (const op in ops) {
            this[op] = () => ops[op](this.value);
        }
    }

    /**
     * Synchronously returns the value of the data in the type format specified.
     *
     * @param {number} type - The data type of value, see Dish enums.
     * @param {boolean} [notUTF8=false] - Do not treat strings as UTF8.
     * @returns {*} - The value of the output data.
     */
    get(type, notUTF8=false) {
        if (typeof type === "string") {
            type = Dish.typeEnum(type);
        }
        if (this.type !== type) {
            this._translate(type, notUTF8);
        }
        return this.value;
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

    /**
     * Synchronously translates the data to the given type format.
     *
     * @param {number} toType - The data type of value, see Dish enums.
     * @param {boolean} [notUTF8=false] - Do not treat strings as UTF8.
     */
    _translate(toType, notUTF8=false) {
        log.debug(`Translating Dish from ${Dish.enumLookup(this.type)} to ${Dish.enumLookup(toType)}`);
        const byteArrayToStr = notUTF8 ? Utils.byteArrayToChars : Utils.byteArrayToUtf8;

        // Convert data to intermediate byteArray type
        switch (this.type) {
            case Dish.STRING:
                this.value = this.value ? Utils.strToByteArray(this.value) : [];
                break;
            case Dish.NUMBER:
                this.value = typeof this.value === "number" ? Utils.strToByteArray(this.value.toString()) : [];
                break;
            case Dish.HTML:
                this.value = this.value ? Utils.strToByteArray(Utils.unescapeHtml(Utils.stripHtmlTags(this.value, true))) : [];
                break;
            case Dish.ARRAY_BUFFER:
                // Array.from() would be nicer here, but it's slightly slower
                this.value = Array.prototype.slice.call(new Uint8Array(this.value));
                break;
            case Dish.BIG_NUMBER:
                this.value = this.value instanceof BigNumber ? Utils.strToByteArray(this.value.toFixed()) : [];
                break;
            case Dish.JSON:
                this.value = this.value ? Utils.strToByteArray(JSON.stringify(this.value)) : [];
                break;
            case Dish.BUFFER:
                this.value = this.value instanceof Buffer ? this.value.buffer : [];
                break;
            // case Dish.FILE:
            //     this.value = Utils.readFileSync(this.value);
            //     this.value = Array.prototype.slice.call(this.value);
            //     break;
            // case Dish.LIST_FILE:
            //     this.value = this.value.map(f => Utils.readFileSync(f));
            //     this.value = this.value.map(b => Array.prototype.slice.call(b));
            //     this.value = [].concat.apply([], this.value);
            //     break;
            default:
                break;
        }

        this.type = Dish.BYTE_ARRAY;

        // Convert from byteArray to toType
        switch (toType) {
            case Dish.STRING:
            case Dish.HTML:
                this.value = this.value ? byteArrayToStr(this.value) : "";
                this.type = Dish.STRING;
                break;
            case Dish.NUMBER:
                this.value = this.value ? parseFloat(byteArrayToStr(this.value)) : 0;
                this.type = Dish.NUMBER;
                break;
            case Dish.ARRAY_BUFFER:
                this.value = new Uint8Array(this.value).buffer;
                this.type = Dish.ARRAY_BUFFER;
                break;
            case Dish.BIG_NUMBER:
                try {
                    this.value = new BigNumber(byteArrayToStr(this.value));
                } catch (err) {
                    this.value = new BigNumber(NaN);
                }
                this.type = Dish.BIG_NUMBER;
                break;
            case Dish.JSON:
                this.value = JSON.parse(byteArrayToStr(this.value));
                this.type = Dish.JSON;
                break;
            case Dish.BUFFER:
                this.value = Buffer.from(new Uint8Array(this.value));
                this.type = Dish.BUFFER;
                break;
            // case Dish.FILE:
            //     this.value = new File(this.value, "unknown");
            //     break;
            // case Dish.LIST_FILE:
            //     this.value = [new File(this.value, "unknown")];
            //     this.type = Dish.LIST_FILE;
            //     break;
            default:
                break;
        }
    }
}





export default SyncDish;
