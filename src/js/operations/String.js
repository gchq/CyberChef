/**
 * String operations.
 * Namespace is appended with an underscore to prevent overwriting the global String object.
 *
 * @author Vel0x
 * @namespace
 */
var String_ = {

    /**
     * @constant
     * @default
     */
    REPLACEMENTS: [
        {"escaped": "\\\\", "unescaped":"\\"}, // Must be first
        {"escaped": "\\'", "unescaped":"'"},
        {"escaped": "\\\"", "unescaped":"\""},
        {"escaped": "\\n", "unescaped":"\n"},
        {"escaped": "\\r", "unescaped":"\r"},
    ],
    
    /**
     * Escapes a string for embedding in another string.
     *
     * Example: "Don't do that" -> "Don\'t do that"
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_escape: function(input, args) {
        return String_._replace_by_keys(input, "unescaped", "escaped")
    },
    
    /**
     * Unescapes a string that was part of another string
     *
     * Example: "Don\'t do that" -> "Don't do that"
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_unescape: function(input, args) {
        return String_._replace_by_keys(input, "escaped", "unescaped")
    },
    
    /**
     * Replaces all matching tokens in REPLACEMENTS with the correction. The 
     * ordering is determined by the pattern_key and the replacement_key.
     *
     * @param {string} input
     * @param {string} pattern_key
     * @param {string} replacement_key
     * @returns {string}
     */
    _replace_by_keys: function(input, pattern_key, replacement_key) {
        var output = input;
        var replacementsLength = String_.REPLACEMENTS.length;
        for (var i = 0; i < replacementsLength; i++) {
            var replacement = String_.REPLACEMENTS[i];
            output = output.split(replacement[pattern_key]).join(replacement[replacement_key]);
        }
        return output
    },
    
};
