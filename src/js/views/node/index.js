/**
 * Node view for CyberChef.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

var Chef = require("../../core/Chef.js");

module.exports = {

    bake: function(input, recipeConfig) {
        this.chef = new Chef();
        return this.chef.bake(input, recipeConfig, {}, 0, false);
    }

};
