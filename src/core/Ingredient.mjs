/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Utils from "./Utils";
import {fromHex} from "./lib/Hex";

/**
 * The arguments to operations.
 */
class Ingredient {

    /**
     * Ingredient constructor
     *
     * @param {Object} ingredientConfig
     */
    constructor(ingredientConfig) {
        this.name  = "";
        this.type  = "";
        this._value = null;
        this.disabled = false;
        this.hint = "";
        this.rows = 0;
        this.toggleValues = [];
        this.target = null;
        this.defaultIndex = 0;

        if (ingredientConfig) {
            this._parseConfig(ingredientConfig);
        }
    }


    /**
     * Reads and parses the given config.
     *
     * @private
     * @param {Object} ingredientConfig
     */
    _parseConfig(ingredientConfig) {
        this.name = ingredientConfig.name;
        this.type = ingredientConfig.type;
        this.defaultValue = ingredientConfig.value;
        this.disabled = !!ingredientConfig.disabled;
        this.hint = ingredientConfig.hint || false;
        this.rows = ingredientConfig.rows || false;
        this.toggleValues = ingredientConfig.toggleValues;
        this.target = typeof ingredientConfig.target !== "undefined" ? ingredientConfig.target : null;
        this.defaultIndex = typeof ingredientConfig.defaultIndex !== "undefined" ? ingredientConfig.defaultIndex : 0;
    }


    /**
     * Returns the value of the Ingredient as it should be displayed in a recipe config.
     *
     * @returns {*}
     */
    get config() {
        return this._value;
    }


    /**
     * Sets the value of the Ingredient.
     *
     * @param {*} value
     */
    set value(value) {
        this._value = Ingredient.prepare(value, this.type);
    }


    /**
     * Gets the value of the Ingredient.
     *
     * @returns {*}
     */
    get value() {
        return this._value;
    }


    /**
     * Most values will be strings when they are entered. This function converts them to the correct
     * type.
     *
     * @param {*} data
     * @param {string} type - The name of the data type.
    */
    static prepare(data, type) {
        let number;

        switch (type) {
            case "binaryString":
            case "binaryShortString":
            case "editableOption":
            case "editableOptionShort":
                return Utils.parseEscapedChars(data);
            case "byteArray":
                if (typeof data == "string") {
                    data = data.replace(/\s+/g, "");
                    return fromHex(data);
                } else {
                    return data;
                }
            case "number":
                number = parseFloat(data);
                if (isNaN(number)) {
                    const sample = Utils.truncate(data.toString(), 10);
                    throw "Invalid ingredient value. Not a number: " + sample;
                }
                return number;
            default:
                return data;
        }
    }

}

export default Ingredient;
