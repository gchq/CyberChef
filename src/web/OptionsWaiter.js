/**
 * Waiter to handle events related to the CyberChef options.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constructor
 * @param {App} app - The main view object for CyberChef.
 */
const OptionsWaiter = function(app) {
    this.app = app;
};


/**
 * Loads options and sets values of switches and inputs to match them.
 *
 * @param {Object} options
 */
OptionsWaiter.prototype.load = function(options) {
    $(".option-item input:checkbox").bootstrapSwitch({
        size: "small",
        animate: false,
    });

    for (const option in options) {
        this.app.options[option] = options[option];
    }

    // Set options to match object
    const cboxes = document.querySelectorAll("#options-body input[type=checkbox]");
    let i;
    for (i = 0; i < cboxes.length; i++) {
        $(cboxes[i]).bootstrapSwitch("state", this.app.options[cboxes[i].getAttribute("option")]);
    }

    const nboxes = document.querySelectorAll("#options-body input[type=number]");
    for (i = 0; i < nboxes.length; i++) {
        nboxes[i].value = this.app.options[nboxes[i].getAttribute("option")];
        nboxes[i].dispatchEvent(new CustomEvent("change", {bubbles: true}));
    }

    const selects = document.querySelectorAll("#options-body select");
    for (i = 0; i < selects.length; i++) {
        selects[i].value = this.app.options[selects[i].getAttribute("option")];
        selects[i].dispatchEvent(new CustomEvent("change", {bubbles: true}));
    }
};


/**
 * Handler for options click events.
 * Dispays the options pane.
 */
OptionsWaiter.prototype.optionsClick = function() {
    $("#options-modal").modal();
};


/**
 * Handler for reset options click events.
 * Resets options back to their default values.
 */
OptionsWaiter.prototype.resetOptionsClick = function() {
    this.load(this.app.doptions);
};


/**
 * Handler for switch change events.
 * Modifies the option state and saves it to local storage.
 *
 * @param {event} e
 * @param {boolean} state
 */
OptionsWaiter.prototype.switchChange = function(e, state) {
    const el = e.target;
    const option = el.getAttribute("option");

    this.app.options[option] = state;
    localStorage.setItem("options", JSON.stringify(this.app.options));
};


/**
 * Handler for number change events.
 * Modifies the option value and saves it to local storage.
 *
 * @param {event} e
 */
OptionsWaiter.prototype.numberChange = function(e) {
    const el = e.target;
    const option = el.getAttribute("option");

    this.app.options[option] = parseInt(el.value, 10);
    localStorage.setItem("options", JSON.stringify(this.app.options));
};


/**
 * Handler for select change events.
 * Modifies the option value and saves it to local storage.
 *
 * @param {event} e
 */
OptionsWaiter.prototype.selectChange = function(e) {
    const el = e.target;
    const option = el.getAttribute("option");

    this.app.options[option] = el.value;
    localStorage.setItem("options", JSON.stringify(this.app.options));
};


/**
 * Sets or unsets word wrap on the input and output depending on the wordWrap option value.
 */
OptionsWaiter.prototype.setWordWrap = function() {
    document.getElementById("input-text").classList.remove("word-wrap");
    document.getElementById("output-text").classList.remove("word-wrap");
    document.getElementById("output-html").classList.remove("word-wrap");
    document.getElementById("input-highlighter").classList.remove("word-wrap");
    document.getElementById("output-highlighter").classList.remove("word-wrap");

    if (!this.app.options.wordWrap) {
        document.getElementById("input-text").classList.add("word-wrap");
        document.getElementById("output-text").classList.add("word-wrap");
        document.getElementById("output-html").classList.add("word-wrap");
        document.getElementById("input-highlighter").classList.add("word-wrap");
        document.getElementById("output-highlighter").classList.add("word-wrap");
    }
};


/**
 * Changes the theme by setting the class of the <html> element.
 */
OptionsWaiter.prototype.themeChange = function (e) {
    const themeClass = e.target.value;

    document.querySelector(":root").className = themeClass;
};

export default OptionsWaiter;
