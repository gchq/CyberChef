/**
 * UUID operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var UUID = {

    /**
     * Generate UUID operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runGenerateV4: function(input, args) {
        if (typeof(window.crypto) !== "undefined" && typeof(window.crypto.getRandomValues) !== "undefined") {
            var buf = new Uint32Array(4),
                i = 0;
            window.crypto.getRandomValues(buf);
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
                var r = (buf[i >> 3] >> ((i % 8) * 4)) & 0xf,
                    v = c === "x" ? r : (r & 0x3 | 0x8);
                i++;
                return v.toString(16);
            });
        } else {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0,
                    v = c === "x" ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    },

};
