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

import {
    DishArrayBuffer,
    DishBigNumber,
    DishFile,
    DishHTML,
    DishJSON,
    DishListFile,
    DishNumber,
    DishString,
} from "./dishTranslationTypes";


/**
 * The data being operated on by each operation.
 */
class Dish {

    /**
     * Dish constructor
     *
     * @param {Dish || *} [dishOrInput=null] - A dish to clone OR an object
     * literal to make into a dish
     * @param {Enum} [type=null] (optional) - A type to accompany object
     * literal input
     */
    constructor(dishOrInput=null, type = null) {

        this.value = [];
        this.type = Dish.BYTE_ARRAY;

        // Case: dishOrInput is dish object
        if (dishOrInput &&
            dishOrInput.hasOwnProperty("value") &&
            dishOrInput.hasOwnProperty("type")) {
            console.log('first setting');
            console.log(dishOrInput);
            console.log(dishOrInput.constructor.name);
            console.log(dishOrInput.value);
            this.set(dishOrInput.value, dishOrInput.type);
        // input and type defined separately
        } else if (dishOrInput && type) {
            this.set(dishOrInput, type);
        // No type declared, so infer it.
        } else if (dishOrInput) {
            const inferredType = Dish.typeEnum(dishOrInput.constructor.name);
            this.set(dishOrInput, inferredType);
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
            case "object": // object constructor name. To allow JSON input in node.
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
        console.trace('enumLookup');
        console.log('type ' + typeEnum);
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
     * Returns the value of the data in the type format specified.
     *
     * If running in a browser, get is asynchronous.
     *
     * @param {number} type - The data type of value, see Dish enums.
     * @param {boolean} [notUTF8=false] - Do not treat strings as UTF8.
     * @returns {* | Promise} - (Broswer) A promise | (Node) value of dish in given type
     */
    get(type, notUTF8=false) {
        if (typeof type === "string") {
            type = Dish.typeEnum(type);
        }

        if (this.type !== type) {

            // Node environment => _translate is sync
            if (Utils.isNode()) {
                this._translate(type, notUTF8);
                return this.value;

            // Browser environment => _translate is async
            } else {
                return new Promise((resolve, reject) => {
                    this._translate(type, notUTF8)
                        .then(() => {
                            resolve(this.value);
                        })
                        .catch(reject);
                });
            }
        }

        return this.value;
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

        console.log('Dish setting:');
        console.log(value);
        console.log(type);

        log.debug("Dish type: " + Dish.enumLookup(type));
        this.value = value;
        this.type = type;

        if (!this.valid()) {
            console.log('invalid!');
            const sample = Utils.truncate(JSON.stringify(this.value), 13);
            throw new DishError(`Data is not a valid ${Dish.enumLookup(type)}: ${sample}`);
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
                console.log("Validating on file");
                console.log(this.value instanceof File);
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

    /**
     * Translates the data to the given type format.
     *
     * If running in the browser, _translate is asynchronous.
     *
     * @param {number} toType - The data type of value, see Dish enums.
     * @param {boolean} [notUTF8=false] - Do not treat strings as UTF8.
     * @returns {Promise || undefined}
     */
    _translate(toType, notUTF8=false) {
        log.debug(`Translating Dish from ${Dish.enumLookup(this.type)} to ${Dish.enumLookup(toType)}`);

        // Node environment => translate is sync
        if (Utils.isNode()) {
            console.log('_translate toType:');
            console.log(toType);
            this._toByteArray();
            this._fromByteArray(toType, notUTF8);

        // Browser environment => translate is async
        } else {
            return new Promise((resolve, reject) => {
                this._toByteArray()
                    .then(() => this.type = Dish.BYTE_ARRAY)
                    .then(() => {
                        this._fromByteArray(toType);
                        resolve();
                    })
                    .catch(reject);
            });
        }

    }

    /**
     * Convert this.value to a ByteArray
     *
     * If running in a browser, _toByteArray is asynchronous.
     *
     * @returns {Promise || undefined}
     */
    _toByteArray() {
        // Using 'bind' here to allow this.value to be mutated within translation functions
        const toByteArrayFuncs = {
            browser: {
                [Dish.STRING]:          () => Promise.resolve(DishString.toByteArray.bind(this)()),
                [Dish.NUMBER]:          () => Promise.resolve(DishNumber.toByteArray.bind(this)()),
                [Dish.HTML]:            () => Promise.resolve(DishHTML.toByteArray.bind(this)()),
                [Dish.ARRAY_BUFFER]:    () => Promise.resolve(DishArrayBuffer.toByteArray.bind(this)()),
                [Dish.BIG_NUMBER]:      () => Promise.resolve(DishBigNumber.toByteArray.bind(this)()),
                [Dish.JSON]:            () => Promise.resolve(DishJSON.toByteArray.bind(this)()),
                [Dish.FILE]:            () => DishFile.toByteArray.bind(this)(),
                [Dish.LIST_FILE]:       () => DishListFile.toByteArray.bind(this)(),
                [Dish.BYTE_ARRAY]:      () => Promise.resolve(),
            },
            node: {
                [Dish.STRING]:          () => DishString.toByteArray.bind(this)(),
                [Dish.NUMBER]:          () => DishNumber.toByteArray.bind(this)(),
                [Dish.HTML]:            () => DishHTML.toByteArray.bind(this)(),
                [Dish.ARRAY_BUFFER]:    () => DishArrayBuffer.toByteArray.bind(this)(),
                [Dish.BIG_NUMBER]:      () => DishBigNumber.toByteArray.bind(this)(),
                [Dish.JSON]:            () => DishJSON.toByteArray.bind(this)(),
                [Dish.FILE]:            () => DishFile.toByteArray.bind(this)(),
                [Dish.LIST_FILE]:       () => DishListFile.toByteArray.bind(this)(),
                [Dish.BYTE_ARRAY]:      () => {},
            }
        };

        try {
            console.log("_tyByteArray this.type: " + this.type);
            return toByteArrayFuncs[Utils.isNode() && "node" || "browser"][this.type]();
        } catch (err) {
            throw new DishError(`Error translating from ${Dish.enumLookup(this.type)} to byteArray: ${err}`);
        }
    }

    /**
     * Convert this.value to the given type.
     *
     * @param {number} toType - the Dish enum to convert to
     * @param {boolean} [notUTF8=false] - Do not treat strings as UTF8.
    */
    _fromByteArray(toType, notUTF8) {
        const byteArrayToStr = notUTF8 ? Utils.byteArrayToChars : Utils.byteArrayToUtf8;

        // Using 'bind' here to allow this.value to be mutated within translation functions
        const toTypeFunctions = {
            [Dish.STRING]:          () => DishString.fromByteArray.bind(this)(byteArrayToStr),
            [Dish.NUMBER]:          () => DishNumber.fromByteArray.bind(this)(byteArrayToStr),
            [Dish.HTML]:            () => DishHTML.fromByteArray.bind(this)(byteArrayToStr),
            [Dish.ARRAY_BUFFER]:    () => DishArrayBuffer.fromByteArray.bind(this)(),
            [Dish.BIG_NUMBER]:      () => DishBigNumber.fromByteArray.bind(this)(byteArrayToStr),
            [Dish.JSON]:            () => DishJSON.fromByteArray.bind(this)(byteArrayToStr),
            [Dish.FILE]:            () => DishFile.fromByteArray.bind(this)(),
            [Dish.LIST_FILE]:       () => DishListFile.fromByteArray.bind(this)(),
            [Dish.BYTE_ARRAY]:      () => {},
        };

        try {
            toTypeFunctions[toType]();
            this.type = toType;
        } catch (err) {
            throw new DishError(`Error translating from byteArray to ${Dish.enumLookup(toType)}: ${err}`);
        }
    }

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
