/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

var HTMLApp = require("./HTMLApp.js"),
    Categories = require("../../config/Categories.js"),
    OperationConfig = require("../../config/OperationConfig.js"),
    CanvasComponents = require("../../lib/canvascomponents.js");;

/**
 * Main function used to build the CyberChef web app.
 */
var main = function() {
    var defaultFavourites = [
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

    var defaultOptions = {
        updateUrl         : true,
        showHighlighter   : true,
        treatAsUtf8       : true,
        wordWrap          : true,
        showErrors        : true,
        errorTimeout      : 4000,
        autoBakeThreshold : 200,
        attemptHighlight  : true,
    };

    document.removeEventListener("DOMContentLoaded", main, false);
    window.app = new HTMLApp(Categories, OperationConfig, defaultFavourites, defaultOptions);
    window.app.setup();
};

// Fix issues with browsers that don't support console.log()
window.console = console || {log: function() {}, error: function() {}};

window.compileTime = moment.tz("<%= compileTime %>", "DD/MM/YYYY HH:mm:ss z", "UTC").valueOf();
window.compileMessage = "<%= compileMsg %>";

document.addEventListener("DOMContentLoaded", main, false);
