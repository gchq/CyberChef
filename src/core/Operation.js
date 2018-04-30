import Dish from "./Dish.js";
import Ingredient from "./Ingredient.js";
import OperationConfig from "./config/MetaConfig.js";
import OpModules from "./config/modules/OpModules.js";


/**
 * The Operation specified by the user to be run.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @class
 * @param {string} operationName
 */
const Operation = function(operationName) {
    this.name             = operationName;
    this.module           = "";
    this.description      = "";
    this.inputType        = -1;
    this.outputType       = -1;
    this.run              = null;
    this.highlight        = null;
    this.highlightReverse = null;
    this.breakpoint       = false;
    this.disabled         = false;
    this.ingList          = [];

    if (OperationConfig.hasOwnProperty(this.name)) {
        this._parseConfig(OperationConfig[this.name]);
    }
};


/**
 * Reads and parses the given config.
 *
 * @private
 * @param {Object} operationConfig
 */
Operation.prototype._parseConfig = function(operationConfig) {
    this.module           = operationConfig.module;
    this.description      = operationConfig.description;
    this.inputType        = Dish.typeEnum(operationConfig.inputType);
    this.outputType       = Dish.typeEnum(operationConfig.outputType);
    this.highlight        = operationConfig.highlight;
    this.highlightReverse = operationConfig.highlightReverse;
    this.flowControl      = operationConfig.flowControl;
    this.run              = OpModules[this.module][this.name];

    for (let a = 0; a < operationConfig.args.length; a++) {
        const ingredientConfig = operationConfig.args[a];
        const ingredient = new Ingredient(ingredientConfig);
        this.addIngredient(ingredient);
    }

    if (this.highlight === "func") {
        this.highlight = OpModules[this.module][`${this.name}-highlight`];
    }

    if (this.highlightReverse === "func") {
        this.highlightReverse = OpModules[this.module][`${this.name}-highlightReverse`];
    }
};


/**
 * Returns the value of the Operation as it should be displayed in a recipe config.
 *
 * @returns {Object}
 */
Operation.prototype.getConfig = function() {
    const ingredientConfig = [];

    for (let o = 0; o < this.ingList.length; o++) {
        ingredientConfig.push(this.ingList[o].getConfig());
    }

    const operationConfig = {
        "op": this.name,
        "args": ingredientConfig
    };

    return operationConfig;
};


/**
 * Adds a new Ingredient to this Operation.
 *
 * @param {Ingredient} ingredient
 */
Operation.prototype.addIngredient = function(ingredient) {
    this.ingList.push(ingredient);
};


/**
 * Set the Ingredient values for this Operation.
 *
 * @param {Object[]} ingValues
 */
Operation.prototype.setIngValues = function(ingValues) {
    for (let i = 0; i < ingValues.length; i++) {
        this.ingList[i].setValue(ingValues[i]);
    }
};


/**
 * Get the Ingredient values for this Operation.
 *
 * @returns {Object[]}
 */
Operation.prototype.getIngValues = function() {
    const ingValues = [];
    for (let i = 0; i < this.ingList.length; i++) {
        ingValues.push(this.ingList[i].value);
    }
    return ingValues;
};


/**
 * Set whether this Operation has a breakpoint.
 *
 * @param {boolean} value
 */
Operation.prototype.setBreakpoint = function(value) {
    this.breakpoint = !!value;
};


/**
 * Returns true if this Operation has a breakpoint set.
 *
 * @returns {boolean}
 */
Operation.prototype.isBreakpoint = function() {
    return this.breakpoint;
};


/**
 * Set whether this Operation is disabled.
 *
 * @param {boolean} value
 */
Operation.prototype.setDisabled = function(value) {
    this.disabled = !!value;
};


/**
 * Returns true if this Operation is disabled.
 *
 * @returns {boolean}
 */
Operation.prototype.isDisabled = function() {
    return this.disabled;
};


/**
 * Returns true if this Operation is a flow control.
 *
 * @returns {boolean}
 */
Operation.prototype.isFlowControl = function() {
    return this.flowControl;
};

export default Operation;
