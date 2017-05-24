/**
 * Numberwang operations.
 *
 * @author Unknown Male 282
 * @namespace
 */
var Numberwang = {

    /**
     * Numberwang operation. Remain indoors.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run: function(input, args) {
        if (!input) return "Let's play Wangernumb!";
        var match = input.match(/\d+/);
        if (match) {
            return match[0] + "! That's Numberwang!";
        } else {
            // That's a bad miss!
            return "Sorry, that's not Numberwang. Let's rotate the board!";
        }
    },
    
};
