/**
 * @author n1474335 [n1474335@gmail.com]
 * @author Matt C [matt@artemisbot.uk]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Utils from "./Utils";
import DishError from "./errors/DishError";
import BigNumber from "bignumber.js";
import log from "loglevel";

/**
 * The data being operated on by each operation.
 */
class Dish {

    /**
     * Dish constructor
     *
     * @param {Dish} [dish=null] - A dish to clone
     */
    constructor(dish=null) {
        this.value = new ArrayBuffer(0);
        this.type = Dish.ARRAY_BUFFER;

        if (dish &&
            Object.prototype.hasOwnProperty.call(dish, "value") &&
            Object.prototype.hasOwnProperty.call(dish, "type")) {
            this.set(dish.value, dish.type);
        }
    }


    /**
     * Returns the data type enum for the given type string.
     *
     * @param {string} typeStr - The name of the data type.
     * @returns {number} The data type enum value.
     */
    static typeEnum(typeStr) {
        switch (typeStr.toLowerCase()) {
            case "bytearray":
            case "byte array":
                return Dish.BYTE_ARRAY;
            case "string":
                return Dish.STRING;
            case "number":
                return Dish.NUMBER;
            case "html":
                return Dish.HTML;
            case "arraybuffer":
            case "array buffer":
                return Dish.ARRAY_BUFFER;
            case "bignumber":
            case "big number":
                return Dish.BIG_NUMBER;
            case "json":
                return Dish.JSON;
            case "file":
                return Dish.FILE;
            case "list<file>":
                return Dish.LIST_FILE;
            default:
                throw new DishError("Invalid data type string. No matching enum.");
        }
    }


    /**
     * Returns the data type string for the given type enum.
     *
     * @param {number} typeEnum - The enum value of the data type.
     * @returns {string} The data type as a string.
     */
    static enumLookup(typeEnum) {
        switch (typeEnum) {
            case Dish.BYTE_ARRAY:
                return "byteArray";
            case Dish.STRING:
                return "string";
            case Dish.NUMBER:
                return "number";
            case Dish.HTML:
                return "html";
            case Dish.ARRAY_BUFFER:
                return "ArrayBuffer";
            case Dish.BIG_NUMBER:
                return "BigNumber";
            case Dish.JSON:
                return "JSON";
            case Dish.FILE:
                return "File";
            case Dish.LIST_FILE:
                return "List<File>";
            default:
                throw new DishError("Invalid data type enum. No matching type.");
        }
    }


    /**
     * Sets the data value and type and then validates them.
     *
     * @param {*} value
     *     - The value of the input data.
     * @param {number} type
     *     - The data type of value, see Dish enums.
     */
    set(value, type) {
        if (typeof type === "string") {
            type = Dish.typeEnum(type);
        }

        log.debug("Dish type: " + Dish.enumLookup(type));
        this.value = value;
        this.type = type;

        if (!this.valid()) {
            const sample = Utils.truncate(JSON.stringify(this.value), 13);
            throw new DishError(`Data is not a valid ${Dish.enumLookup(type)}: ${sample}`);
        }
    }


    /**
     * Returns the value of the data in the type format specified.
     *
     * @param {number} type - The data type of value, see Dish enums.
     * @param {boolean} [notUTF8=false] - Do not treat strings as UTF8.
     * @returns {*} - The value of the output data.
     */
    async get(type, notUTF8=false) {
        if (typeof type === "string") {
            type = Dish.typeEnum(type);
        }
        if (this.type !== type) {
            await this._translate(type, notUTF8);
        }
        return this.value;
    }


    /**
     * Translates the data to the given type format.
     *
     * @param {number} toType - The data type of value, see Dish enums.
     * @param {boolean} [notUTF8=false] - Do not treat strings as UTF8.
     */
    async _translate(toType, notUTF8=false) {
        log.debug(`Translating Dish from ${Dish.enumLookup(this.type)} to ${Dish.enumLookup(toType)}`);

        // Convert data to intermediate ArrayBuffer type
        try {
            switch (this.type) {
                case Dish.STRING:
                    this.value = this.value ? Utils.strToArrayBuffer(this.value) : new ArrayBuffer;
                    break;
                case Dish.NUMBER:
                    this.value = typeof this.value === "number" ? Utils.strToArrayBuffer(this.value.toString()) : new ArrayBuffer;
                    break;
                case Dish.HTML:
                    this.value = this.value ? Utils.strToArrayBuffer(Utils.unescapeHtml(Utils.stripHtmlTags(this.value, true))) : new ArrayBuffer;
                    break;
                case Dish.BYTE_ARRAY:
                    this.value = new Uint8Array(this.value).buffer;
                    break;
                case Dish.BIG_NUMBER:
                    this.value = BigNumber.isBigNumber(this.value) ? Utils.strToArrayBuffer(this.value.toFixed()) : new ArrayBuffer;
                    break;
                case Dish.JSON:
                    this.value = this.value ? Utils.strToArrayBuffer(JSON.stringify(this.value, null, 4)) : new ArrayBuffer;
                    break;
                case Dish.FILE:
                    this.value = (await Utils.readFile(this.value)).buffer;
                    break;
                case Dish.LIST_FILE:
                    this.value = await Promise.all(this.value.map(async f => Utils.readFile(f)));
                    this.value = concatenateTypedArrays(...this.value).buffer;
                    break;
                default:
                    break;
            }
        } catch (err) {
            throw new DishError(`Error translating from ${Dish.enumLookup(this.type)} to ArrayBuffer: ${err}`);
        }

        this.type = Dish.ARRAY_BUFFER;

        // Convert from ArrayBuffer to toType
        try {
            switch (toType) {
                case Dish.STRING:
                case Dish.HTML:
                    this.value = this.value ? Utils.arrayBufferToStr(this.value, !notUTF8) : "";
                    this.type = Dish.STRING;
                    break;
                case Dish.NUMBER:
                    this.value = this.value ? parseFloat(Utils.arrayBufferToStr(this.value, !notUTF8)) : 0;
                    this.type = Dish.NUMBER;
                    break;
                case Dish.BYTE_ARRAY:
                    this.value = Array.prototype.slice.call(new Uint8Array(this.value));
                    this.type = Dish.ARRAY_BUFFER;
                    break;
                case Dish.BIG_NUMBER:
                    try {
                        this.value = new BigNumber(Utils.arrayBufferToStr(this.value, !notUTF8));
                    } catch (err) {
                        this.value = new BigNumber(NaN);
                    }
                    this.type = Dish.BIG_NUMBER;
                    break;
                case Dish.JSON:
                    this.value = JSON.parse(Utils.arrayBufferToStr(this.value, !notUTF8));
                    this.type = Dish.JSON;
                    break;
                case Dish.FILE:
                    this.value = new File(this.value, "unknown");
                    this.type = Dish.FILE;
                    break;
                case Dish.LIST_FILE:
                    this.value = [new File(this.value, "unknown")];
                    this.type = Dish.LIST_FILE;
                    break;
                default:
                    break;
            }
        } catch (err) {
            throw new DishError(`Error translating from ArrayBuffer to ${Dish.enumLookup(toType)}: ${err}`);
        }
    }


    /**
     * Validates that the value is the type that has been specified.
     * May have to disable parts of BYTE_ARRAY validation if it effects performance.
     *
     * @returns {boolean} Whether the data is valid or not.
    */
    valid() {
        switch (this.type) {
            case Dish.BYTE_ARRAY:
                if (!(this.value instanceof Array)) {
                    return false;
                }

                // Check that every value is a number between 0 - 255
                for (let i = 0; i < this.value.length; i++) {
                    if (typeof this.value[i] !== "number" ||
                        this.value[i] < 0 ||
                        this.value[i] > 255) {
                        return false;
                    }
                }
                return true;
            case Dish.STRING:
            case Dish.HTML:
                return typeof this.value === "string";
            case Dish.NUMBER:
                return typeof this.value === "number";
            case Dish.ARRAY_BUFFER:
                return this.value instanceof ArrayBuffer;
            case Dish.BIG_NUMBER:
                return BigNumber.isBigNumber(this.value);
            case Dish.JSON:
                // All values can be serialised in some manner, so we return true in all cases
                return true;
            case Dish.FILE:
                return this.value instanceof File;
            case Dish.LIST_FILE:
                return this.value instanceof Array &&
                    this.value.reduce((acc, curr) => acc && curr instanceof File, true);
            default:
                return false;
        }
    }


    /**
     * Determines how much space the Dish takes up.
     * Numbers in JavaScript are 64-bit floating point, however for the purposes of the Dish,
     * we measure how many bytes are taken up when the number is written as a string.
     *
     * @returns {number}
    */
    get size() {
        switch (this.type) {
            case Dish.BYTE_ARRAY:
            case Dish.STRING:
            case Dish.HTML:
                return this.value.length;
            case Dish.NUMBER:
            case Dish.BIG_NUMBER:
                return this.value.toString().length;
            case Dish.ARRAY_BUFFER:
                return this.value.byteLength;
            case Dish.JSON:
                return JSON.stringify(this.value).length;
            case Dish.FILE:
                return this.value.size;
            case Dish.LIST_FILE:
                return this.value.reduce((acc, curr) => acc + curr.size, 0);
            default:
                return -1;
        }
    }


    /**
     * Returns a deep clone of the current Dish.
     *
     * @returns {Dish}
     */
    clone() {
        const newDish = new Dish();

        switch (this.type) {
            case Dish.STRING:
            case Dish.HTML:
            case Dish.NUMBER:
            case Dish.BIG_NUMBER:
                // These data types are immutable so it is acceptable to copy them by reference
                newDish.set(
                    this.value,
                    this.type
                );
                break;
            case Dish.BYTE_ARRAY:
            case Dish.JSON:
                // These data types are mutable so they need to be copied by value
                newDish.set(
                    JSON.parse(JSON.stringify(this.value)),
                    this.type
                );
                break;
            case Dish.ARRAY_BUFFER:
                // Slicing an ArrayBuffer returns a new ArrayBuffer with a copy its contents
                newDish.set(
                    this.value.slice(0),
                    this.type
                );
                break;
            case Dish.FILE:
                // A new file can be created by copying over all the values from the original
                newDish.set(
                    new File([this.value], this.value.name, {
                        "type": this.value.type,
                        "lastModified": this.value.lastModified
                    }),
                    this.type
                );
                break;
            case Dish.LIST_FILE:
                newDish.set(
                    this.value.map(f =>
                        new File([f], f.name, {
                            "type": f.type,
                            "lastModified": f.lastModified
                        })
                    ),
                    this.type
                );
                break;
            default:
                throw new DishError("Cannot clone Dish, unknown type");
        }

        return newDish;
    }

}

/**
 * Concatenates a list of Uint8Arrays together
 *
 * @param {Uint8Array[]} arrays
 * @returns {Uint8Array}
 */
function concatenateTypedArrays(...arrays) {
    let totalLength = 0;
    for (const arr of arrays) {
        totalLength += arr.length;
    }
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}


/**
 * Dish data type enum for byte arrays.
 * @readonly
 * @enum
 */
Dish.BYTE_ARRAY = 0;
/**
 * Dish data type enum for strings.
 * @readonly
 * @enum
 */
Dish.STRING = 1;
/**
 * Dish data type enum for numbers.
 * @readonly
 * @enum
 */
Dish.NUMBER = 2;
/**
 * Dish data type enum for HTML.
 * @readonly
 * @enum
 */
Dish.HTML = 3;
/**
 * Dish data type enum for ArrayBuffers.
 * @readonly
 * @enum
 */
Dish.ARRAY_BUFFER = 4;
/**
 * Dish data type enum for BigNumbers.
 * @readonly
 * @enum
 */
Dish.BIG_NUMBER = 5;
/**
 * Dish data type enum for JSON.
 * @readonly
 * @enum
 */
Dish.JSON = 6;
/**
 * Dish data type enum for lists of files.
 * @readonly
 * @enum
 */
Dish.FILE = 7;
/**
* Dish data type enum for lists of files.
* @readonly
* @enum
*/
Dish.LIST_FILE = 8;


export default Dish;
