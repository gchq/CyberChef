/**
 * The Operation specified by the user to be run.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @class
 * @param {string} operation_name
 * @param {Object} operation_config
 */
var Operation = function(operation_name, operation_config) {
    this.name              = operation_name;
    this.description       = "";
    this.input_type        = -1;
    this.output_type       = -1;
    this.run               = null;
    this.highlight         = null;
    this.highlight_reverse = null;
    this.breakpoint        = false;
    this.disabled          = false;
    this.ing_list          = [];
    
    if (operation_config) {
        this._parse_config(operation_config);
    }
};


/**
 * Reads and parses the given config.
 *
 * @private
 * @param {Object} operation_config
 */
Operation.prototype._parse_config = function(operation_config) {
    this.description       = operation_config.description;
    this.input_type        = Dish.type_enum(operation_config.input_type);
    this.output_type       = Dish.type_enum(operation_config.output_type);
    this.run               = operation_config.run;
    this.highlight         = operation_config.highlight;
    this.highlight_reverse = operation_config.highlight_reverse;
    this.flow_control      = operation_config.flow_control;

    for (var a = 0; a < operation_config.args.length; a++) {
        var ingredient_config = operation_config.args[a];
        var ingredient = new Ingredient(ingredient_config);
        this.add_ingredient(ingredient);
    }
};


/**
 * Returns the value of the Operation as it should be displayed in a recipe config.
 *
 * @returns {Object}
 */
Operation.prototype.get_config = function() {
    var ingredient_config = [];
    
    for (var o = 0; o < this.ing_list.length; o++) {
        ingredient_config.push(this.ing_list[o].get_config());
    }
    
    var operation_config = {
        "op": this.name,
        "args": ingredient_config
    };
    
    return operation_config;
};


/**
 * Adds a new Ingredient to this Operation.
 *
 * @param {Ingredient} ingredient
 */
Operation.prototype.add_ingredient = function(ingredient) {
    this.ing_list.push(ingredient);
};


/**
 * Set the Ingredient values for this Operation.
 *
 * @param {Object[]} ing_values
 */
Operation.prototype.set_ing_values = function(ing_values) {
    for (var i = 0; i < ing_values.length; i++) {
        this.ing_list[i].set_value(ing_values[i]);
    }
};


/**
 * Get the Ingredient values for this Operation.
 *
 * @returns {Object[]}
 */
Operation.prototype.get_ing_values = function() {
    var ing_values = [];
    for (var i = 0; i < this.ing_list.length; i++) {
        ing_values.push(this.ing_list[i].value);
    }
    return ing_values;
};


/**
 * Set whether this Operation has a breakpoint.
 *
 * @param {boolean} value
 */
Operation.prototype.set_breakpoint = function(value) {
    this.breakpoint = !!value;
};


/**
 * Returns true if this Operation has a breakpoint set.
 *
 * @returns {boolean}
 */
Operation.prototype.is_breakpoint = function() {
    return this.breakpoint;
};


/**
 * Set whether this Operation is disabled.
 *
 * @param {boolean} value
 */
Operation.prototype.set_disabled = function(value) {
    this.disabled = !!value;
};


/**
 * Returns true if this Operation is disabled.
 *
 * @returns {boolean}
 */
Operation.prototype.is_disabled = function() {
    return this.disabled;
};


/**
 * Returns true if this Operation is a flow control.
 *
 * @returns {boolean}
 */
Operation.prototype.is_flow_control = function() {
    return this.flow_control;
};
