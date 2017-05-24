/**
 * The Recipe controls a list of Operations and the Dish they operate on.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @class
 * @param {Object} recipe_config
 */
var Recipe = function(recipe_config) {
    this.op_list = [];
    
    if (recipe_config) {
        this._parse_config(recipe_config);
    }
};


/**
 * Reads and parses the given config.
 *
 * @private
 * @param {Object} recipe_config
 */
Recipe.prototype._parse_config = function(recipe_config) {
    for (var c = 0; c < recipe_config.length; c++) {
        var operation_name = recipe_config[c].op;
        var operation_config = OperationConfig[operation_name];
        var operation = new Operation(operation_name, operation_config);
        operation.set_ing_values(recipe_config[c].args);
        operation.set_breakpoint(recipe_config[c].breakpoint);
        operation.set_disabled(recipe_config[c].disabled);
        this.add_operation(operation);
    }
};


/**
 * Returns the value of the Recipe as it should be displayed in a recipe config.
 *
 * @returns {*}
 */
Recipe.prototype.get_config = function() {
    var recipe_config = [];
    
    for (var o = 0; o < this.op_list.length; o++) {
        recipe_config.push(this.op_list[o].get_config());
    }
    
    return recipe_config;
};


/**
 * Adds a new Operation to this Recipe.
 *
 * @param {Operation} operation
 */
Recipe.prototype.add_operation = function(operation) {
    this.op_list.push(operation);
};


/**
 * Adds a list of Operations to this Recipe.
 *
 * @param {Operation[]} operations
 */
Recipe.prototype.add_operations = function(operations) {
    this.op_list = this.op_list.concat(operations);
};


/**
 * Set a breakpoint on a specified Operation.
 *
 * @param {number} position - The index of the Operation
 * @param {boolean} value
 */
Recipe.prototype.set_breakpoint = function(position, value) {
    try {
        this.op_list[position].set_breakpoint(value);
    } catch (err) {
        // Ignore index error
    }
};


/**
 * Remove breakpoints on all Operations in the Recipe up to the specified position. Used by Flow
 * Control Fork operation.
 *
 * @param {number} pos
 */
Recipe.prototype.remove_breaks_up_to = function(pos) {
    for (var i = 0; i < pos; i++) {
        this.op_list[i].set_breakpoint(false);
    }
};


/**
 * Returns true if there is an Flow Control Operation in this Recipe.
 *
 * @returns {boolean}
 */
Recipe.prototype.contains_flow_control = function() {
    for (var i = 0; i < this.op_list.length; i++) {
        if (this.op_list[i].is_flow_control()) return true;
    }
    return false;
};


/**
 * Returns the index of the last Operation index that will be executed, taking into account disabled
 * Operations and breakpoints.
 *
 * @param {number} [start_index=0] - The index to start searching from
 * @returns (number}
 */
Recipe.prototype.last_op_index = function(start_index) {
    var i = start_index + 1 || 0,
        op;
        
    for (; i < this.op_list.length; i++) {
        op = this.op_list[i];
        if (op.is_disabled()) return i-1;
        if (op.is_breakpoint()) return i-1;
    }
    
    return i-1;
};


/**
 * Executes each operation in the recipe over the given Dish.
 *
 * @param {Dish} dish
 * @param {number} [start_from=0] - The index of the Operation to start executing from
 * @returns {number} - The final progress through the recipe
 */
Recipe.prototype.execute = function(dish, start_from) {
    start_from = start_from || 0;
    var op, input, output, num_jumps = 0;
    
    for (var i = start_from; i < this.op_list.length; i++) {
        op = this.op_list[i];
        if (op.is_disabled()) {
            continue;
        }
        if (op.is_breakpoint()) {
            return i;
        }
        
        try {
            input = dish.get(op.input_type);
            
            if (op.is_flow_control()) {
                // Package up the current state
                var state = {
                    "progress" : i,
                    "dish"     : dish,
                    "op_list"  : this.op_list,
                    "num_jumps" : num_jumps
                };
                
                state = op.run(state);
                i = state.progress;
                num_jumps = state.num_jumps;
            } else {
                output = op.run(input, op.get_ing_values());
                dish.set(output, op.output_type);
            }
        } catch (err) {
            var e = typeof err == "string" ? { message: err } : err;

            e.progress = i;
            e.display_str = op.name + " - ";
            if (e.fileName) {
                e.display_str += e.name + " in " + e.fileName +
                    " on line " + e.lineNumber +
                    ".<br><br>Message: " + e.message;
            } else {
                e.display_str += e.message;
            }
            
            throw e;
        }
    }
    
    return this.op_list.length;
};


/**
 * Returns the recipe configuration in string format.
 *
 * @returns {string}
 */
Recipe.prototype.to_string = function() {
    return JSON.stringify(this.get_config());
};


/**
 * Creates a Recipe from a given configuration string.
 *
 * @param {string} recipe_str
 */
Recipe.prototype.from_string = function(recipe_str) {
    var recipe_config = JSON.parse(recipe_str);
    this._parse_config(recipe_config);
};
