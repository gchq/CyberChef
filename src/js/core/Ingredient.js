/**
 * The arguments to operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @class
 * @param {Object} ingredient_config
 */
var Ingredient = function(ingredient_config) {
    this.name  = "";
    this.type  = "";
    this.value = null;
    
    if (ingredient_config) {
        this._parse_config(ingredient_config);
    }
};


/**
 * Reads and parses the given config.
 *
 * @private
 * @param {Object} ingredient_config
 */
Ingredient.prototype._parse_config = function(ingredient_config) {
    this.name = ingredient_config.name;
    this.type = ingredient_config.type;
};


/**
 * Returns the value of the Ingredient as it should be displayed in a recipe config.
 *
 * @returns {*}
 */
Ingredient.prototype.get_config = function() {
    return this.value;
};


/**
 * Sets the value of the Ingredient.
 *
 * @param {*} value
 */
Ingredient.prototype.set_value = function(value) {
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
        case "binary_string":
        case "binary_short_string":
        case "editable_option":
            return Utils.parse_escaped_chars(data);
        case "byte_array":
            if (typeof data == "string") {
                data = data.replace(/\s+/g, '');
                return Utils.hex_to_byte_array(data);
            } else {
                return data;
            }
            break;
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
