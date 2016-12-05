/* globals UAS_parser */

/**
 * Javascript Obfscate operations.
 *
 * @author G047 [drgoatyt@gmail.com]
 * @copyright Crown Copyright 2016
 * @license MIT
 *
 * @namespace
 */
var JavascriptObfscate = {
    
	obfuscator : require('javascript-obfuscator'), //Needs to be installed with the package.json

    /**
     * Obfscate javascript operation.
     *
     * @param {string} source
     * @returns {string}
     */

	obfscate : function (source) {
	    var obfuscationResult = this.obfuscate(source, {
	        compact: true,
	        debugProtection: true,
	        debugProtectionInterval: true,
	        selfDefending: true,
	    });
	    source = obfuscationResult.getObfuscatedCode();
		return source;
	}


};

module.exports = JavascriptObfscate;