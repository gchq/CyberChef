/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Dish from "./Dish.mjs";
import Ingredient from "./Ingredient.mjs";

/**
 * The Operation specified by the user to be run.
 */
class Operation {

    /**
     * Operation constructor
     */
    constructor() {
        // Private fields
        this._inputType       = -1;
        this._outputType      = -1;
        this._presentType     = -1;
        this._breakpoint      = false;
        this._disabled        = false;
        this._flowControl     = false;
        this._manualBake      = false;
        this._ingList         = [];

        // Public fields
        this.name             = "";
        this.module           = "";
        this.description      = "";
        this.infoURL          = null;
    }


    /**
     * Interface for operation runner
     *
     * @param {*} input
     * @param {Object[]} args
     * @returns {*}
     */
    run(input, args) {
        return input;
    }


    /**
     * Interface for forward highlighter
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
        return false;
    }


    /**
     * Interface for reverse highlighter
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightReverse(pos, args) {
        return false;
    }


    /**
     * Method to be called when displaying the result of an operation in a human-readable
     * format. This allows operations to return usable data from their run() method and
     * only format them when this method is called.
     *
     * The default action is to return the data unchanged, but child classes can override
     * this behaviour.
     *
     * @param {*} data - The result of the run() function
     * @param {Object[]} args - The operation's arguments
     * @returns {*} - A human-readable version of the data
     */
    present(data, args) {
        return data;
    }


    /**
     * Sets the input type as a Dish enum.
     *
     * @param {string} typeStr
     */
    set inputType(typeStr) {
        this._inputType = Dish.typeEnum(typeStr);
    }


    /**
     * Gets the input type as a readable string.
     *
     * @returns {string}
     */
    get inputType() {
        return Dish.enumLookup(this._inputType);
    }


    /**
     * Sets the output type as a Dish enum.
     *
     * @param {string} typeStr
     */
    set outputType(typeStr) {
        this._outputType = Dish.typeEnum(typeStr);
        if (this._presentType < 0) this._presentType = this._outputType;
    }


    /**
     * Gets the output type as a readable string.
     *
     * @returns {string}
     */
    get outputType() {
        return Dish.enumLookup(this._outputType);
    }


    /**
     * Sets the presentation type as a Dish enum.
     *
     * @param {string} typeStr
     */
    set presentType(typeStr) {
        this._presentType = Dish.typeEnum(typeStr);
    }


    /**
     * Gets the presentation type as a readable string.
     *
     * @returns {string}
     */
    get presentType() {
        return Dish.enumLookup(this._presentType);
    }


    /**
     * Sets the args for the current operation.
     *
     * @param {Object[]} conf
     */
    set args(conf) {
        conf.forEach(arg => {
            const ingredient = new Ingredient(arg);
            this.addIngredient(ingredient);
        });
    }


    /**
     * Gets the args for the current operation.
     *
     * @param {Object[]} conf
     */
    get args() {
        return this._ingList.map(ing => {
            const conf = {
                name: ing.name,
                type: ing.type,
                value: ing.defaultValue
            };

            if (ing.toggleValues) conf.toggleValues = ing.toggleValues;
            if (ing.hint) conf.hint = ing.hint;
            if (ing.rows) conf.rows = ing.rows;
            if (ing.disabled) conf.disabled = ing.disabled;
            if (ing.target) conf.target = ing.target;
            if (ing.defaultIndex) conf.defaultIndex = ing.defaultIndex;
            if (typeof ing.min === "number") conf.min = ing.min;
            if (typeof ing.max === "number") conf.max = ing.max;
            if (ing.step) conf.step = ing.step;
            return conf;
        });
    }


    /**
     * Returns the value of the Operation as it should be displayed in a recipe config.
     *
     * @returns {Object}
     */
    get config() {
        return {
            "op": this.name,
            "args": this._ingList.map(ing => ing.config)
        };
    }


    /**
     * Adds a new Ingredient to this Operation.
     *
     * @param {Ingredient} ingredient
     */
    addIngredient(ingredient) {
        this._ingList.push(ingredient);
    }


    /**
     * Set the Ingredient values for this Operation.
     *
     * @param {Object[]} ingValues
     */
    set ingValues(ingValues) {
        ingValues.forEach((val, i) => {
            this._ingList[i].value = val;
        });
    }


    /**
     * Get the Ingredient values for this Operation.
     *
     * @returns {Object[]}
     */
    get ingValues() {
        return this._ingList.map(ing => ing.value);
    }


    /**
     * Set whether this Operation has a breakpoint.
     *
     * @param {boolean} value
     */
    set breakpoint(value) {
        this._breakpoint = !!value;
    }


    /**
     * Returns true if this Operation has a breakpoint set.
     *
     * @returns {boolean}
     */
    get breakpoint() {
        return this._breakpoint;
    }


    /**
     * Set whether this Operation is disabled.
     *
     * @param {boolean} value
     */
    set disabled(value) {
        this._disabled = !!value;
    }


    /**
     * Returns true if this Operation is disabled.
     *
     * @returns {boolean}
     */
    get disabled() {
        return this._disabled;
    }


    /**
     * Returns true if this Operation is a flow control.
     *
     * @returns {boolean}
     */
    get flowControl() {
        return this._flowControl;
    }


    /**
     * Set whether this Operation is a flowcontrol op.
     *
     * @param {boolean} value
     */
    set flowControl(value) {
        this._flowControl = !!value;
    }


    /**
     * Returns true if this Operation should not trigger AutoBake.
     *
     * @returns {boolean}
     */
    get manualBake() {
        return this._manualBake;
    }


    /**
     * Set whether this Operation should trigger AutoBake.
     *
     * @param {boolean} value
     */
    set manualBake(value) {
        this._manualBake = !!value;
    }

}

export default Operation;
