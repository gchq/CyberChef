/**
 * Object to handle the creation of operation ingredients.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constructor
 * @param {Object} config - The configuration object for this ingredient.
 * @param {HTMLApp} app - The main view object for CyberChef.
 * @param {Manager} manager - The CyberChef event manager.
 */
var HTMLIngredient = function(config, app, manager) {
    this.app = app;
    this.manager = manager;
    
    this.name = config.name;
    this.type = config.type;
    this.value = config.value;
    this.disabled = config.disabled || false;
    this.disableArgs = config.disableArgs || false;
    this.placeholder = config.placeholder || false;
    this.target = config.target;
    this.toggleValues = config.toggleValues;
    this.id = "ing-" + this.app.nextIngId();
};


/**
 * Renders the ingredient in HTML.
 *
 * @returns {string}
 */
HTMLIngredient.prototype.toHtml = function() {
    var inline = (this.type === "boolean" ||
                  this.type === "number" ||
                  this.type === "option" ||
                  this.type === "shortString" ||
                  this.type === "binaryShortString"),
        html = inline ? "" : "<div class='clearfix'>&nbsp;</div>",
        i, m;
    
    html += "<div class='arg-group" + (inline ? " inline-args" : "") +
        (this.type === "text" ? " arg-group-text" : "") + "'><label class='arg-label' for='" +
        this.id + "'>" + this.name + "</label>";
    
    switch (this.type) {
        case "string":
        case "binaryString":
        case "byteArray":
            html += "<input type='text' id='" + this.id + "' class='arg arg-input' arg-name='" +
                this.name + "' value='" + this.value + "'" +
                (this.disabled ? " disabled='disabled'" : "") +
                (this.placeholder ? " placeholder='" + this.placeholder + "'" : "") + ">";
            break;
        case "shortString":
        case "binaryShortString":
            html += "<input type='text' id='" + this.id +
                "'class='arg arg-input short-string' arg-name='" + this.name + "'value='" +
                this.value + "'" + (this.disabled ? " disabled='disabled'" : "") +
                (this.placeholder ? " placeholder='" + this.placeholder + "'" : "") + ">";
            break;
        case "toggleString":
            html += "<div class='input-group'><div class='input-group-btn'>\
                <button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown'\
                aria-haspopup='true' aria-expanded='false'" +
                (this.disabled ? " disabled='disabled'" : "") + ">" + this.toggleValues[0] +
                " <span class='caret'></span></button><ul class='dropdown-menu'>";
            for (i = 0; i < this.toggleValues.length; i++) {
                html += "<li><a href='#'>" + this.toggleValues[i] + "</a></li>";
            }
            html += "</ul></div><input type='text' class='arg arg-input toggle-string'" +
                (this.disabled ? " disabled='disabled'" : "") +
                (this.placeholder ? " placeholder='" + this.placeholder + "'" : "") + "></div>";
            break;
        case "number":
            html += "<input type='number' id='" + this.id + "'class='arg arg-input' arg-name='" +
                this.name + "'value='" + this.value + "'" +
                (this.disabled ? " disabled='disabled'" : "") +
                (this.placeholder ? " placeholder='" + this.placeholder + "'" : "") + ">";
            break;
        case "boolean":
            html += "<input type='checkbox' id='" + this.id + "'class='arg' arg-name='" +
                this.name + "'" + (this.value ? " checked='checked' " : "") +
                (this.disabled ? " disabled='disabled'" : "") + ">";
            
            if (this.disableArgs) {
                this.manager.addDynamicListener("#" + this.id, "click", this.toggleDisableArgs, this);
            }
            break;
        case "option":
            html += "<select class='arg' id='" + this.id + "'arg-name='" + this.name + "'" +
                (this.disabled ? " disabled='disabled'" : "") + ">";
            for (i = 0; i < this.value.length; i++) {
                if ((m = this.value[i].match(/\[([a-z0-9 -()^]+)\]/i))) {
                    html += "<optgroup label='" + m[1] + "'>";
                } else if ((m = this.value[i].match(/\[\/([a-z0-9 -()^]+)\]/i))) {
                    html += "</optgroup>";
                } else {
                    html += "<option>" + this.value[i] + "</option>";
                }
            }
            html += "</select>";
            break;
        case "populateOption":
            html += "<select class='arg' id='" + this.id + "'arg-name='" + this.name + "'" +
                (this.disabled ? " disabled='disabled'" : "") + ">";
            for (i = 0; i < this.value.length; i++) {
                if ((m = this.value[i].name.match(/\[([a-z0-9 -()^]+)\]/i))) {
                    html += "<optgroup label='" + m[1] + "'>";
                } else if ((m = this.value[i].name.match(/\[\/([a-z0-9 -()^]+)\]/i))) {
                    html += "</optgroup>";
                } else {
                    html += "<option populate-value='" + this.value[i].value + "'>" +
                        this.value[i].name + "</option>";
                }
            }
            html += "</select>";
            
            this.manager.addDynamicListener("#" + this.id, "change", this.populateOptionChange, this);
            break;
        case "editableOption":
            html += "<div class='editable-option'>";
            html += "<select class='editable-option-select' id='sel-" + this.id + "'" +
                (this.disabled ? " disabled='disabled'" : "") + ">";
            for (i = 0; i < this.value.length; i++) {
                html += "<option value='" + this.value[i].value + "'>" + this.value[i].name + "</option>";
            }
            html += "</select>";
            html += "<input class='arg arg-input editable-option-input' id='" + this.id +
                "'arg-name='" + this.name + "'" + " value='" + this.value[0].value + "'" +
                (this.disabled ? " disabled='disabled'" : "") +
                (this.placeholder ? " placeholder='" + this.placeholder + "'" : "") + ">";
            html += "</div>";
            
            
            this.manager.addDynamicListener("#sel-" + this.id, "change", this.editableOptionChange, this);
            break;
        case "text":
            html += "<textarea id='" + this.id + "' class='arg' arg-name='" +
                this.name + "'" + (this.disabled ? " disabled='disabled'" : "") +
                (this.placeholder ? " placeholder='" + this.placeholder + "'" : "") + ">" +
                this.value + "</textarea>";
            break;
        default:
            break;
    }
    html += "</div>";
    
    return html;
};


/**
 * Handler for argument disable toggle.
 * Toggles disabled state for all arguments in the disableArgs list for this ingredient.
 *
 * @param {event} e
 */
HTMLIngredient.prototype.toggleDisableArgs = function(e) {
    var el = e.target,
        op = el.parentNode.parentNode,
        args = op.querySelectorAll(".arg-group"),
        els;
        
    for (var i = 0; i < this.disableArgs.length; i++) {
        els = args[this.disableArgs[i]].querySelectorAll("input, select, button");
        
        for (var j = 0; j < els.length; j++) {
            if (els[j].getAttribute("disabled")) {
                els[j].removeAttribute("disabled");
            } else {
                els[j].setAttribute("disabled", "disabled");
            }
        }
    }
    
    this.manager.recipe.ingChange();
};


/**
 * Handler for populate option changes.
 * Populates the relevant argument with the specified value.
 *
 * @param {event} e
 */
HTMLIngredient.prototype.populateOptionChange = function(e) {
    var el = e.target,
        op = el.parentNode.parentNode,
        target = op.querySelectorAll(".arg-group")[this.target].querySelector("input, select, textarea");

    target.value = el.childNodes[el.selectedIndex].getAttribute("populate-value");
    
    this.manager.recipe.ingChange();
};


/**
 * Handler for editable option changes.
 * Populates the input box with the selected value.
 *
 * @param {event} e
 */
HTMLIngredient.prototype.editableOptionChange = function(e) {
    var select = e.target,
        input = select.nextSibling;

    input.value = select.childNodes[select.selectedIndex].value;
    
    this.manager.recipe.ingChange();
};
