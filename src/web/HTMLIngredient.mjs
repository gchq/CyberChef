/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Utils from "../core/Utils.mjs";

/**
 * Object to handle the creation of operation ingredients.
 */
class HTMLIngredient {

    /**
     * HTMLIngredient constructor.
     *
     * @param {Object} config - The configuration object for this ingredient.
     * @param {App} app - The main view object for CyberChef.
     * @param {Manager} manager - The CyberChef event manager.
     */
    constructor(config, app, manager) {
        this.app = app;
        this.manager = manager;

        this.name = config.name;
        this.type = config.type;
        this.value = config.value;
        this.disabled = config.disabled || false;
        this.hint = config.hint || false;
        this.rows = config.rows || false;
        this.target = config.target;
        this.defaultIndex = config.defaultIndex || 0;
        this.toggleValues = config.toggleValues;
        this.ingId = this.app.nextIngId();
        this.id = "ing-" + this.ingId;
        this.tabIndex = this.ingId + 2; // Input = 1, Search = 2
        this.min = (typeof config.min === "number") ? config.min : "";
        this.max = (typeof config.max === "number") ? config.max : "";
        this.step = config.step || 1;
    }


    /**
     * Renders the ingredient in HTML.
     *
     * @returns {string}
     */
    toHtml() {
        let html = "",
            i, m, eventFn;

        switch (this.type) {
            case "string":
            case "binaryString":
            case "byteArray":
                html += `<div class="form-group">
                    <label for="${this.id}"
                        ${this.hint ? `data-toggle="tooltip" title="${this.hint}"` : ""}
                        class="bmd-label-floating">${this.name}</label>
                    <input type="text"
                        class="form-control arg"
                        id="${this.id}"
                        tabindex="${this.tabIndex}"
                        arg-name="${this.name}"
                        value="${this.value}"
                        ${this.disabled ? "disabled" : ""}>
                </div>`;
                break;
            case "shortString":
            case "binaryShortString":
                html += `<div class="form-group inline">
                    <label for="${this.id}"
                        ${this.hint ? `data-toggle="tooltip" title="${this.hint}"` : ""}
                        class="bmd-label-floating inline">${this.name}</label>
                    <input type="text"
                        class="form-control arg inline"
                        id="${this.id}"
                        tabindex="${this.tabIndex}"
                        arg-name="${this.name}"
                        value="${this.value}"
                        ${this.disabled ? "disabled" : ""}>
                </div>`;
                break;
            case "toggleString":
                html += `<div class="form-group input-group">
                    <div class="toggle-string">
                        <label for="${this.id}"
                            ${this.hint ? `data-toggle="tooltip" title="${this.hint}"` : ""}
                            class="bmd-label-floating toggle-string">${this.name}</label>
                        <input type="text"
                            class="form-control arg toggle-string"
                            id="${this.id}"
                            tabindex="${this.tabIndex}"
                            arg-name="${this.name}"
                            value="${this.value}"
                            ${this.disabled ? "disabled" : ""}>
                    </div>
                    <div class="input-group-append">
                        <button class="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${this.toggleValues[0]}</button>
                        <div class="dropdown-menu toggle-dropdown">`;
                for (i = 0; i < this.toggleValues.length; i++) {
                    html += `<a class="dropdown-item" href="#">${this.toggleValues[i]}</a>`;
                }
                html += `</div>
                    </div>

                </div>`;
                break;
            case "number":
                html += `<div class="form-group inline">
                    <label for="${this.id}"
                        ${this.hint ? `data-toggle="tooltip" title="${this.hint}"` : ""}
                        class="bmd-label-floating inline">${this.name}</label>
                    <input type="number"
                        class="form-control arg inline"
                        id="${this.id}"
                        tabindex="${this.tabIndex}"
                        arg-name="${this.name}"
                        value="${this.value}"
                        min="${this.min}"
                        max="${this.max}"
                        step="${this.step}"
                        ${this.disabled ? "disabled" : ""}>
                </div>`;
                break;
            case "boolean":
                html += `<div class="form-group inline boolean-arg">
                    <div class="checkbox">
                        <label ${this.hint ? `data-toggle="tooltip" title="${this.hint}"` : ""}>
                            <input type="checkbox"
                                class="arg"
                                id="${this.id}"
                                tabindex="${this.tabIndex}"
                                arg-name="${this.name}"
                                ${this.value ? " checked" : ""}
                                ${this.disabled ? " disabled" : ""}
                                value="${this.name}"> ${this.name}
                        </label>
                    </div>
                </div>`;
                break;
            case "option":
                html += `<div class="form-group inline">
                    <label for="${this.id}"
                        ${this.hint ? `data-toggle="tooltip" title="${this.hint}"` : ""}
                        class="bmd-label-floating inline">${this.name}</label>
                    <select
                        class="form-control arg inline"
                        id="${this.id}"
                        tabindex="${this.tabIndex}"
                        arg-name="${this.name}"
                        ${this.disabled ? "disabled" : ""}>`;
                for (i = 0; i < this.value.length; i++) {
                    if ((m = this.value[i].match(/\[([a-z0-9 -()^]+)\]/i))) {
                        html += `<optgroup label="${m[1]}">`;
                    } else if ((m = this.value[i].match(/\[\/([a-z0-9 -()^]+)\]/i))) {
                        html += "</optgroup>";
                    } else {
                        html += `<option ${this.defaultIndex === i ? "selected" : ""}>${this.value[i]}</option>`;
                    }
                }
                html += `</select>
                </div>`;
                break;
            case "populateOption":
            case "populateMultiOption":
                html += `<div class="form-group">
                    <label for="${this.id}"
                        ${this.hint ? `data-toggle="tooltip" title="${this.hint}"` : ""}
                        class="bmd-label-floating">${this.name}</label>
                    <select
                        class="form-control arg no-state-change populate-option"
                        id="${this.id}"
                        tabindex="${this.tabIndex}"
                        arg-name="${this.name}"
                        ${this.disabled ? "disabled" : ""}>`;
                for (i = 0; i < this.value.length; i++) {
                    if ((m = this.value[i].name.match(/\[([a-z0-9 -()^]+)\]/i))) {
                        html += `<optgroup label="${m[1]}">`;
                    } else if ((m = this.value[i].name.match(/\[\/([a-z0-9 -()^]+)\]/i))) {
                        html += "</optgroup>";
                    } else {
                        const val = this.type === "populateMultiOption" ?
                            JSON.stringify(this.value[i].value) :
                            this.value[i].value;
                        html += `<option populate-value='${Utils.escapeHtml(val)}'>${this.value[i].name}</option>`;
                    }
                }
                html += `</select>
                </div>`;

                eventFn = this.type === "populateMultiOption" ?
                    this.populateMultiOptionChange :
                    this.populateOptionChange;
                this.manager.addDynamicListener("#" + this.id, "change", eventFn, this);
                break;
            case "editableOption":
                html += `<div class="form-group input-group">
                    <label for="${this.id}"
                        ${this.hint ? `data-toggle="tooltip" title="${this.hint}"` : ""}
                        class="bmd-label-floating">${this.name}</label>
                    <input type="text"
                        class="form-control arg"
                        id="${this.id}"
                        tabindex="${this.tabIndex}"
                        arg-name="${this.name}"
                        value="${this.value[this.defaultIndex].value}"
                        ${this.disabled ? "disabled" : ""}>
                    <div class="input-group-append">
                        <button type="button"
                            class="btn btn-secondary dropdown-toggle dropdown-toggle-split"
                            data-toggle="dropdown"
                            data-boundary="scrollParent"
                            aria-haspopup="true"
                            aria-expanded="false">
                            <span class="sr-only">Toggle Dropdown</span>
                        </button>
                        <div class="dropdown-menu editable-option-menu">`;
                for (i = 0; i < this.value.length; i++) {
                    html += `<a class="dropdown-item" href="#" value="${this.value[i].value}">${this.value[i].name}</a>`;
                }
                html += `</div>
                    </div>
                </div>`;

                this.manager.addDynamicListener(".editable-option-menu a", "click", this.editableOptionClick, this);
                break;
            case "editableOptionShort":
                html += `<div class="form-group input-group inline">
                    <label for="${this.id}"
                        ${this.hint ? `data-toggle="tooltip" title="${this.hint}"` : ""}
                        class="bmd-label-floating inline">${this.name}</label>
                    <input type="text"
                        class="form-control arg inline"
                        id="${this.id}"
                        tabindex="${this.tabIndex}"
                        arg-name="${this.name}"
                        value="${this.value[this.defaultIndex].value}"
                        ${this.disabled ? "disabled" : ""}>
                    <div class="input-group-append inline">
                        <button type="button"
                            class="btn btn-secondary dropdown-toggle dropdown-toggle-split"
                            data-toggle="dropdown"
                            data-boundary="scrollParent"
                            aria-haspopup="true"
                            aria-expanded="false">
                            <span class="sr-only">Toggle Dropdown</span>
                        </button>
                        <div class="dropdown-menu editable-option-menu">`;
                for (i = 0; i < this.value.length; i++) {
                    html += `<a class="dropdown-item" href="#" value="${this.value[i].value}">${this.value[i].name}</a>`;
                }
                html += `</div>
                    </div>
                </div>`;

                this.manager.addDynamicListener(".editable-option-menu a", "click", this.editableOptionClick, this);
                break;
            case "text":
                html += `<div class="form-group">
                    <label for="${this.id}"
                        ${this.hint ? `data-toggle="tooltip" title="${this.hint}"` : ""}
                        class="bmd-label-floating">${this.name}</label>
                    <textarea
                        class="form-control arg"
                        id="${this.id}"
                        tabindex="${this.tabIndex}"
                        arg-name="${this.name}"
                        rows="${this.rows ? this.rows : 3}"
                        ${this.disabled ? "disabled" : ""}>${this.value}</textarea>
                </div>`;
                break;
            case "argSelector":
                html += `<div class="form-group inline">
                    <label for="${this.id}"
                        ${this.hint ? `data-toggle="tooltip" title="${this.hint}"` : ""}
                        class="bmd-label-floating inline">${this.name}</label>
                    <select
                        class="form-control arg inline arg-selector"
                        id="${this.id}"
                        tabindex="${this.tabIndex}"
                        arg-name="${this.name}"
                        ${this.disabled ? "disabled" : ""}>`;
                for (i = 0; i < this.value.length; i++) {
                    html += `<option ${this.defaultIndex === i ? "selected" : ""}
                        turnon="${JSON.stringify(this.value[i].on || [])}"
                        turnoff="${JSON.stringify(this.value[i].off || [])}">
                            ${this.value[i].name}
                        </option>`;
                }
                html += `</select>
                </div>`;

                this.manager.addDynamicListener(".arg-selector", "change", this.argSelectorChange, this);
                break;
            default:
                break;
        }

        return html;
    }


    /**
     * Handler for populate option changes.
     * Populates the relevant argument with the specified value.
     *
     * @param {event} e
     */
    populateOptionChange(e) {
        e.preventDefault();
        e.stopPropagation();

        const el = e.target;
        const op = el.parentNode.parentNode;
        const target = op.querySelectorAll(".arg")[this.target];

        const popVal = el.childNodes[el.selectedIndex].getAttribute("populate-value");
        if (popVal !== "") target.value = popVal;

        const evt = new Event("change");
        target.dispatchEvent(evt);

        this.manager.recipe.ingChange();
    }


    /**
     * Handler for populate multi option changes.
     * Populates the relevant arguments with the specified values.
     *
     * @param {event} e
     */
    populateMultiOptionChange(e) {
        e.preventDefault();
        e.stopPropagation();

        const el = e.target;
        const op = el.parentNode.parentNode;
        const args = op.querySelectorAll(".arg");
        const targets = this.target.map(i => args[i]);
        const vals = JSON.parse(el.childNodes[el.selectedIndex].getAttribute("populate-value"));
        const evt = new Event("change");

        for (let i = 0; i < targets.length; i++) {
            targets[i].value = vals[i];
        }

        // Fire change event after all targets have been assigned
        this.manager.recipe.ingChange();

        // Send change event for each target once all have been assigned, to update the label placement.
        for (const target of targets) {
            target.dispatchEvent(evt);
        }
    }


    /**
     * Handler for editable option clicks.
     * Populates the input box with the selected value.
     *
     * @param {event} e
     */
    editableOptionClick(e) {
        e.preventDefault();
        e.stopPropagation();

        const link = e.target,
            input = link.parentNode.parentNode.parentNode.querySelector("input");

        input.value = link.getAttribute("value");
        const evt = new Event("change");
        input.dispatchEvent(evt);

        this.manager.recipe.ingChange();
    }


    /**
     * Handler for argument selector changes.
     * Shows or hides the relevant arguments for this operation.
     *
     * @param {event} e
     */
    argSelectorChange(e) {
        e.preventDefault();
        e.stopPropagation();

        const option = e.target.options[e.target.selectedIndex];
        const op = e.target.closest(".operation");
        const args = op.querySelectorAll(".ingredients .form-group");
        const turnon = JSON.parse(option.getAttribute("turnon"));
        const turnoff = JSON.parse(option.getAttribute("turnoff"));

        args.forEach((arg, i) => {
            if (turnon.includes(i)) {
                arg.classList.remove("d-none");
            }
            if (turnoff.includes(i)) {
                arg.classList.add("d-none");
            }
        });
    }

}

export default HTMLIngredient;
