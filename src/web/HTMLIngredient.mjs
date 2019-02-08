/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

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
        this.target = config.target;
        this.defaultIndex = config.defaultIndex || 0;
        this.toggleValues = config.toggleValues;
        this.id = "ing-" + this.app.nextIngId();
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
                    <label for="${this.id}" class="bmd-label-floating">${this.name}</label>
                    <input type="text"
                        class="form-control arg"
                        id="${this.id}"
                        arg-name="${this.name}"
                        value="${this.value}"
                        ${this.disabled ? "disabled" : ""}>
                    ${this.hint ? "<span class='bmd-help'>" + this.hint + "</span>" : ""}
                </div>`;
                break;
            case "shortString":
            case "binaryShortString":
                html += `<div class="form-group inline">
                    <label for="${this.id}" class="bmd-label-floating inline">${this.name}</label>
                    <input type="text"
                        class="form-control arg inline"
                        id="${this.id}"
                        arg-name="${this.name}"
                        value="${this.value}"
                        ${this.disabled ? "disabled" : ""}>
                    ${this.hint ? "<span class='bmd-help'>" + this.hint + "</span>" : ""}
                </div>`;
                break;
            case "toggleString":
                html += `<div class="form-group input-group">
                    <div class="toggle-string">
                        <label for="${this.id}" class="bmd-label-floating toggle-string">${this.name}</label>
                        <input type="text"
                            class="form-control arg toggle-string"
                            id="${this.id}"
                            arg-name="${this.name}"
                            value="${this.value}"
                            ${this.disabled ? "disabled" : ""}>
                        ${this.hint ? "<span class='bmd-help'>" + this.hint + "</span>" : ""}
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
                    <label for="${this.id}" class="bmd-label-floating inline">${this.name}</label>
                    <input type="number"
                        class="form-control arg inline"
                        id="${this.id}"
                        arg-name="${this.name}"
                        value="${this.value}"
                        ${this.disabled ? "disabled" : ""}>
                    ${this.hint ? "<span class='bmd-help'>" + this.hint + "</span>" : ""}
                </div>`;
                break;
            case "boolean":
                html += `<div class="form-group inline boolean-arg">
                    <div class="checkbox">
                        <label>
                            <input type="checkbox"
                                class="arg"
                                id="${this.id}"
                                arg-name="${this.name}"
                                ${this.value ? " checked" : ""}
                                ${this.disabled ? " disabled" : ""}
                                value="${this.name}"> ${this.name}
                        </label>
                        ${this.hint ? "<span class='bmd-help'>" + this.hint + "</span>" : ""}
                    </div>
                </div>`;
                break;
            case "option":
                html += `<div class="form-group inline">
                    <label for="${this.id}" class="bmd-label-floating inline">${this.name}</label>
                    <select
                        class="form-control arg inline"
                        id="${this.id}"
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
                    ${this.hint ? "<span class='bmd-help'>" + this.hint + "</span>" : ""}
                </div>`;
                break;
            case "populateOption":
            case "populateMultiOption":
                html += `<div class="form-group">
                    <label for="${this.id}" class="bmd-label-floating">${this.name}</label>
                    <select
                        class="form-control arg no-state-change populate-option"
                        id="${this.id}"
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
                        html += `<option populate-value='${val}'>${this.value[i].name}</option>`;
                    }
                }
                html += `</select>
                    ${this.hint ? "<span class='bmd-help'>" + this.hint + "</span>" : ""}
                </div>`;

                eventFn = this.type === "populateMultiOption" ?
                    this.populateMultiOptionChange :
                    this.populateOptionChange;
                this.manager.addDynamicListener("#" + this.id, "change", eventFn, this);
                break;
            case "editableOption":
                html += `<div class="form-group input-group">
                    <label for="${this.id}" class="bmd-label-floating">${this.name}</label>
                    <input type="text"
                        class="form-control arg"
                        id="${this.id}"
                        arg-name="${this.name}"
                        value="${this.value[this.defaultIndex].value}"
                        ${this.disabled ? "disabled" : ""}>
                    ${this.hint ? "<span class='bmd-help'>" + this.hint + "</span>" : ""}
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
                    <label for="${this.id}" class="bmd-label-floating inline">${this.name}</label>
                    <input type="text"
                        class="form-control arg inline"
                        id="${this.id}"
                        arg-name="${this.name}"
                        value="${this.value[this.defaultIndex].value}"
                        ${this.disabled ? "disabled" : ""}>
                    ${this.hint ? "<span class='bmd-help'>" + this.hint + "</span>" : ""}
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
                    <label for="${this.id}" class="bmd-label-floating">${this.name}</label>
                    <textarea
                        class="form-control arg"
                        id="${this.id}"
                        arg-name="${this.name}"
                        ${this.disabled ? "disabled" : ""}>${this.value}</textarea>
                    ${this.hint ? "<span class='bmd-help'>" + this.hint + "</span>" : ""}
                </div>`;
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

        target.value = el.childNodes[el.selectedIndex].getAttribute("populate-value");
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

}

export default HTMLIngredient;
