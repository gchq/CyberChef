/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

// Styles
import "./stylesheets/index.js";

// Libs
import "arrive";
import "snackbarjs";
import "bootstrap-material-design/js/index";
import "bootstrap-colorpicker";
import moment from "moment-timezone";
import * as CanvasComponents from "../core/lib/CanvasComponents.mjs";

// CyberChef
import App from "./App.mjs";
import Categories from "../core/config/Categories.json";
import OperationConfig from "../core/config/OperationConfig.json";


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
        "Fork",
        "Magic"
    ];

    const defaultOptions = {
        updateUrl:           true,
        showHighlighter:     true,
        treatAsUtf8:         true,
        wordWrap:            true,
        showErrors:          true,
        errorTimeout:        4000,
        attemptHighlight:    true,
        theme:               "classic",
        useMetaKey:          false,
        ioDisplayThreshold:  512,
        logLevel:            "info",
        autoMagic:           true,
        imagePreview:        true,
        syncTabs:            true
    };

    document.removeEventListener("DOMContentLoaded", main, false);
    window.app = new App(Categories, OperationConfig, defaultFavourites, defaultOptions);
    window.app.setup();
}

window.compileTime = moment.tz(COMPILE_TIME, "DD/MM/YYYY HH:mm:ss z", "UTC").valueOf();
window.compileMessage = COMPILE_MSG;

// Make libs available to operation outputs
window.CanvasComponents = CanvasComponents;

document.addEventListener("DOMContentLoaded", main, false);

