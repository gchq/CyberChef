/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

/**
 * Waiter to handle events related to the CyberChef options.
 */
class OptionsWaiter {

    /**
     * OptionsWaiter constructor.
     *
     * @param {App} app - The main view object for CyberChef.
     * @param {Manager} manager - The CyberChef event manager.
     */
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;
    }

    /**
     * Loads options and sets values of switches and inputs to match them.
     *
     * @param {Object} options
     */
    load(options) {
        for (const option in options) {
            this.app.options[option] = options[option];
        }

        // Set options to match object
        const cboxes = document.querySelectorAll("#options-body input[type=checkbox]");
        let i;
        for (i = 0; i < cboxes.length; i++) {
            cboxes[i].checked = this.app.options[cboxes[i].getAttribute("option")];
        }

        const nboxes = document.querySelectorAll("#options-body input[type=number]");
        for (i = 0; i < nboxes.length; i++) {
            nboxes[i].value = this.app.options[nboxes[i].getAttribute("option")];
            nboxes[i].dispatchEvent(new CustomEvent("change", {bubbles: true}));
        }

        const selects = document.querySelectorAll("#options-body select");
        for (i = 0; i < selects.length; i++) {
            const val = this.app.options[selects[i].getAttribute("option")];
            if (val) {
                selects[i].value = val;
                selects[i].dispatchEvent(new CustomEvent("change", {bubbles: true}));
            } else {
                selects[i].selectedIndex = 0;
            }
        }
    }


    /**
     * Handler for options click events.
     * Displays the options pane.
     *
     * @param {event} e
     */
    optionsClick(e) {
        e.preventDefault();
        $("#options-modal").modal();
    }


    /**
     * Handler for reset options click events.
     * Resets options back to their default values.
     */
    resetOptionsClick() {
        this.load(this.app.doptions);
    }


    /**
     * Handler for switch change events.
     *
     * @param {event} e
     */
    switchChange(e) {
        const el = e.target;
        const option = el.getAttribute("option");
        const state = el.checked;

        this.updateOption(option, state);
    }


    /**
     * Handler for number change events.
     *
     * @param {event} e
     */
    numberChange(e) {
        const el = e.target;
        const option = el.getAttribute("option");
        const val = parseInt(el.value, 10);

        this.updateOption(option, val);
    }


    /**
     * Handler for select change events.
     *
     * @param {event} e
     */
    selectChange(e) {
        const el = e.target;
        const option = el.getAttribute("option");

        this.updateOption(option, el.value);
    }

    /**
     * Modifies an option value and saves it to local storage.
     *
     * @param {string} option - The option to be updated
     * @param {string|number|boolean} value - The new value of the option
     */
    updateOption(option, value) {
        log.debug(`Setting ${option} to ${value}`);
        this.app.options[option] = value;

        if (this.app.isLocalStorageAvailable())
            localStorage.setItem("options", JSON.stringify(this.app.options));
    }


    /**
     * Sets or unsets word wrap on the input and output depending on the wordWrap option value.
     */
    setWordWrap() {
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
    }


    /**
     * Theme change event listener
     *
     * @param {Event} e
     */
    themeChange(e) {
        const themeClass = e.target.value;

        this.changeTheme(themeClass);
    }


    /**
     * Changes the theme by setting the class of the <html> element.
     *
     * @param (string} theme
     */
    changeTheme(theme) {
        document.querySelector(":root").className = theme;

        // Update theme selection
        const themeSelect = document.getElementById("theme");
        themeSelect.selectedIndex = themeSelect.querySelector(`option[value="${theme}"`).index;
    }


    /**
     * Changes the console logging level.
     *
     * @param {Event} e
     */
    logLevelChange(e) {
        const level = e.target.value;
        log.setLevel(level, false);
        this.manager.worker.setLogLevel();
        this.manager.input.setLogLevel();
    }
}

export default OptionsWaiter;
