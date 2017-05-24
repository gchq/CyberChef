/* globals moment */

/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

/**
 * Main function used to build the CyberChef web app.
 */
var main = function() {
    var default_favourites = [
        "To Base64",
        "From Base64",
        "To Hex",
        "From Hex",
        "To Hexdump",
        "From Hexdump",
        "URL Decode",
        "Regular expression",
        "Entropy",
        "Fork"
    ];
    
    var default_options = {
        update_url          : true,
        show_highlighter    : true,
        treat_as_utf8       : true,
        word_wrap           : true,
        show_errors         : true,
        error_timeout       : 4000,
        auto_bake_threshold : 200,
        attempt_highlight   : true,
        snow                : false,
    };

    document.removeEventListener("DOMContentLoaded", main, false);
    window.app = new HTMLApp(Categories, OperationConfig, default_favourites, default_options);
    window.app.setup();
};

// Fix issues with browsers that don't support console.log()
window.console = console || {log: function() {}, error: function() {}};

window.compile_time = moment.tz("<%= grunt.template.today() %>", "ddd MMM D YYYY HH:mm:ss", "UTC").valueOf();
window.compile_message = "<%= compile_msg %>";

document.addEventListener("DOMContentLoaded", main, false);
