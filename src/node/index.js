/**
 * Node view for CyberChef.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
require("babel-polyfill");

const Chef = require("../core/Chef.js").default;

const CyberChef = module.exports = {

    bake: function(input, recipeConfig) {
        this.chef = new Chef();
        return this.chef.bake(
            input,
            recipeConfig,
            {},
            0,
            false
        );
    }

};
