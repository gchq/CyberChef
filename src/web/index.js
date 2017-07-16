/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

// Styles
import "./stylesheets/index.js";

// Libs
import "babel-polyfill";
import "bootstrap";
import "bootstrap-switch";
import "bootstrap-colorpicker";
import CanvasComponents from "../core/lib/canvascomponents.js";

// CyberChef
import App from "./App.js";
import Categories from "../core/config/Categories.js";
import OperationConfig from "value-loader?name=default!../core/config/MetaConfig.js";


/**
 * Main function used to build the CyberChef web app.
 */
function main() {
    const defaultFavourites = [
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

    const defaultOptions = {
        updateUrl         : true,
        showHighlighter   : true,
        treatAsUtf8       : true,
        wordWrap          : true,
        showErrors        : true,
        errorTimeout      : 4000,
        autoBakeThreshold : 200,
        attemptHighlight  : true,
        theme             : "classic",
    };

    document.removeEventListener("DOMContentLoaded", main, false);
    window.app = new App(Categories, OperationConfig, defaultFavourites, defaultOptions);
    window.app.setup();
}

// Fix issues with browsers that don't support console.log()
window.console = console || {log: function() {}, error: function() {}};

window.compileTime = moment.tz(COMPILE_TIME, "DD/MM/YYYY HH:mm:ss z", "UTC").valueOf();
window.compileMessage = COMPILE_MSG;

// Make libs available to operation outputs
window.CanvasComponents = CanvasComponents;

document.addEventListener("DOMContentLoaded", main, false);
