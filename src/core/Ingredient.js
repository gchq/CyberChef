import Utils from "./Utils.js";


/**
 * The arguments to operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @class
 * @param {Object} ingredientConfig
 */
var Ingredient = function(ingredientConfig) {
    this.name  = "";
    this.type  = "";
    this.value = null;

    if (ingredientConfig) {
        this._parseConfig(ingredientConfig);
    }
};


/**
 * Reads and parses the given config.
 *
 * @private
 * @param {Object} ingredientConfig
 */
Ingredient.prototype._parseConfig = function(ingredientConfig) {
    this.name = ingredientConfig.name;
    this.type = ingredientConfig.type;
};


/**
 * Returns the value of the Ingredient as it should be displayed in a recipe config.
 *
 * @returns {*}
 */
Ingredient.prototype.getConfig = function() {
    return this.value;
};


/**
 * Sets the value of the Ingredient.
 *
 * @param {*} value
 */
Ingredient.prototype.setValue = function(value) {
    this.value = Ingredient.prepare(value, this.type);
};


/**
 * Most values will be strings when they are entered. This function converts them to the correct
 * type.
 *
 * @static
 * @param {*} data
 * @param {string} type - The name of the data type.
*/
Ingredient.prepare = function(data, type) {
    switch (type) {
        case "binaryString":
        case "binaryShortString":
        case "editableOption":
            return Utils.parseEscapedChars(data);
        case "byteArray":
            if (typeof data == "string") {
                data = data.replace(/\s+/g, "");
                return Utils.hexToByteArray(data);
            } else {
                return data;
            }
        case "number":
            var number = parseFloat(data);
            if (isNaN(number)) {
                var sample = Utils.truncate(data.toString(), 10);
                throw "Invalid ingredient value. Not a number: " + sample;
            }
            return number;
        default:
            return data;
    }
};

export default Ingredient;
