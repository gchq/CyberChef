/**
 * @author n1474335 [n1474335@gmail.com]
 * @author Matt C [matt@artemisbot.uk]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Utils, { isNodeEnvironment } from "./Utils.mjs";
import DishError from "./errors/DishError.mjs";
import BigNumber from "bignumber.js";
import { detectFileType } from "./lib/FileType.mjs";
import log from "loglevel";

import DishByteArray from "./dishTypes/DishByteArray.mjs";
import DishBigNumber from "./dishTypes/DishBigNumber.mjs";
import DishFile from "./dishTypes/DishFile.mjs";
import DishHTML from "./dishTypes/DishHTML.mjs";
import DishJSON from "./dishTypes/DishJSON.mjs";
import DishListFile from "./dishTypes/DishListFile.mjs";
import DishNumber from "./dishTypes/DishNumber.mjs";
import DishString from "./dishTypes/DishString.mjs";


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
        this.value = new ArrayBuffer(0);
        this.type = Dish.ARRAY_BUFFER;

        // Case: dishOrInput is dish object
        if (dishOrInput &&
            Object.prototype.hasOwnProperty.call(dishOrInput, "value") &&
            Object.prototype.hasOwnProperty.call(dishOrInput, "type")) {
            this.set(dishOrInput.value, dishOrInput.type);
        // input and type defined separately
        } else if (dishOrInput && type !== null) {
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
            if (isNodeEnvironment()) {
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

        log.debug("Dish type: " + Dish.enumLookup(type));
        this.value = value;
        this.type = type;

        if (!this.valid()) {
            const sample = Utils.truncate(JSON.stringify(this.value), 13);
            throw new DishError(`Data is not a valid ${Dish.enumLookup(type)}: ${sample}`);
        }
    }

    /**
     * Returns the Dish as the given type, without mutating the original dish.
     *
     * If running in a browser, get is asynchronous.
     *
     * @Node
     *
     * @param {number} type - The data type of value, see Dish enums.
     * @param {boolean} [notUTF8=false] - Do not treat strings as UTF8.
     * @returns {Dish | Promise} - (Broswer) A promise | (Node) value of dish in given type
     */
    presentAs(type, notUTF8=false) {
        const clone = this.clone();
        return clone.get(type, notUTF8);
    }


    /**
     * Detects the MIME type of the current dish
     * @returns {string}
     */
    detectDishType() {
        const data = new Uint8Array(this.value.slice(0, 2048)),
            types = detectFileType(data);

        if (!types.length || !types[0].mime || !types[0].mime === "text/plain") {
            return null;
        } else {
            return types[0].mime;
        }
    }


    /**
     * Returns the title of the data up to the specified length
     *
     * @param {number} maxLength - The maximum title length
     * @returns {string}
     */
    async getTitle(maxLength) {
        let title = "";
        let cloned;

        switch (this.type) {
            case Dish.FILE:
                title = this.value.name;
                break;
            case Dish.LIST_FILE:
                title = `${this.value.length} file(s)`;
                break;
            case Dish.JSON:
                title = "application/json";
                break;
            case Dish.ARRAY_BUFFER:
            case Dish.BYTE_ARRAY:
                title = this.detectDishType();
                if (title !== null) break;
                // fall through if no mime type was detected
            default:
                try {
                    cloned = this.clone();
                    cloned.value = cloned.value.slice(0, 256);
                    title = await cloned.get(Dish.STRING);
                } catch (err) {
                    log.error(`${Dish.enumLookup(this.type)} cannot be sliced. ${err}`);
                }
        }

        return title.slice(0, maxLength);
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
                if (!(this.value instanceof Uint8Array) && !(this.value instanceof Array)) {
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
        if (isNodeEnvironment()) {
            this._toArrayBuffer();
            this.type = Dish.ARRAY_BUFFER;
            this._fromArrayBuffer(toType, notUTF8);

        // Browser environment => translate is async
        } else {
            return new Promise((resolve, reject) => {
                this._toArrayBuffer()
                    .then(() => this.type = Dish.ARRAY_BUFFER)
                    .then(() => {
                        this._fromArrayBuffer(toType);
                        resolve();
                    })
                    .catch(reject);
            });
        }

    }

    /**
     * Convert this.value to an ArrayBuffer
     *
     * If running in a browser, _toByteArray is asynchronous.
     *
     * @returns {Promise || undefined}
     */
    _toArrayBuffer() {
        // Using 'bind' here to allow this.value to be mutated within translation functions
        const toByteArrayFuncs = {
            browser: {
                [Dish.STRING]:          () => Promise.resolve(DishString.toArrayBuffer.bind(this)()),
                [Dish.NUMBER]:          () => Promise.resolve(DishNumber.toArrayBuffer.bind(this)()),
                [Dish.HTML]:            () => Promise.resolve(DishHTML.toArrayBuffer.bind(this)()),
                [Dish.ARRAY_BUFFER]:    () => Promise.resolve(),
                [Dish.BIG_NUMBER]:      () => Promise.resolve(DishBigNumber.toArrayBuffer.bind(this)()),
                [Dish.JSON]:            () => Promise.resolve(DishJSON.toArrayBuffer.bind(this)()),
                [Dish.FILE]:            () => DishFile.toArrayBuffer.bind(this)(),
                [Dish.LIST_FILE]:       () => Promise.resolve(DishListFile.toArrayBuffer.bind(this)()),
                [Dish.BYTE_ARRAY]:      () => Promise.resolve(DishByteArray.toArrayBuffer.bind(this)()),
            },
            node: {
                [Dish.STRING]:          () => DishString.toArrayBuffer.bind(this)(),
                [Dish.NUMBER]:          () => DishNumber.toArrayBuffer.bind(this)(),
                [Dish.HTML]:            () => DishHTML.toArrayBuffer.bind(this)(),
                [Dish.ARRAY_BUFFER]:    () => {},
                [Dish.BIG_NUMBER]:      () => DishBigNumber.toArrayBuffer.bind(this)(),
                [Dish.JSON]:            () => DishJSON.toArrayBuffer.bind(this)(),
                [Dish.FILE]:            () => DishFile.toArrayBuffer.bind(this)(),
                [Dish.LIST_FILE]:       () => DishListFile.toArrayBuffer.bind(this)(),
                [Dish.BYTE_ARRAY]:      () => DishByteArray.toArrayBuffer.bind(this)(),
            }
        };

        try {
            return toByteArrayFuncs[isNodeEnvironment() && "node" || "browser"][this.type]();
        } catch (err) {
            throw new DishError(`Error translating from ${Dish.enumLookup(this.type)} to ArrayBuffer: ${err}`);
        }
    }

    /**
     * Convert this.value to the given type from ArrayBuffer
     *
     * @param {number} toType - the Dish enum to convert to
     * @param {boolean} [notUTF8=false] - Do not treat strings as UTF8.
    */
    _fromArrayBuffer(toType, notUTF8) {

        // Using 'bind' here to allow this.value to be mutated within translation functions
        const toTypeFunctions = {
            [Dish.STRING]:          () => DishString.fromArrayBuffer.bind(this)(notUTF8),
            [Dish.NUMBER]:          () => DishNumber.fromArrayBuffer.bind(this)(notUTF8),
            [Dish.HTML]:            () => DishHTML.fromArrayBuffer.bind(this)(notUTF8),
            [Dish.ARRAY_BUFFER]:    () => {},
            [Dish.BIG_NUMBER]:      () => DishBigNumber.fromArrayBuffer.bind(this)(notUTF8),
            [Dish.JSON]:            () => DishJSON.fromArrayBuffer.bind(this)(notUTF8),
            [Dish.FILE]:            () => DishFile.fromArrayBuffer.bind(this)(),
            [Dish.LIST_FILE]:       () => DishListFile.fromArrayBuffer.bind(this)(),
            [Dish.BYTE_ARRAY]:      () => DishByteArray.fromArrayBuffer.bind(this)(),
        };

        try {
            toTypeFunctions[toType]();
            this.type = toType;
        } catch (err) {
            throw new DishError(`Error translating from ArrayBuffer to ${Dish.enumLookup(toType)}: ${err}`);
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
