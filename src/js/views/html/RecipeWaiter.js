/* globals Sortable */

/**
 * Waiter to handle events related to the recipe.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constructor
 * @param {HTMLApp} app - The main view object for CyberChef.
 * @param {Manager} manager - The CyberChef event manager.
 */
var RecipeWaiter = function(app, manager) {
    this.app = app;
    this.manager = manager;
    this.remove_intent = false;
};


/**
 * Sets up the drag and drop capability for operations in the operations and recipe areas.
 */
RecipeWaiter.prototype.initialise_operation_drag_n_drop = function() {
    var rec_list = document.getElementById("rec_list");
    
    
    // Recipe list
    Sortable.create(rec_list, {
        group: "recipe",
        sort: true,
        animation: 0,
        delay: 0,
        filter: ".arg-input,.arg", // Relies on commenting out a line in Sortable.js which calls evt.preventDefault()
        setData: function(dataTransfer, drag_el) {
            dataTransfer.setData("Text", drag_el.querySelector(".arg-title").textContent);
        },
        onEnd: function(evt) {
            if (this.remove_intent) {
                evt.item.remove();
                evt.target.dispatchEvent(this.manager.operationremove);
            }
        }.bind(this)
    });
    
    Sortable.utils.on(rec_list, "dragover", function() {
        this.remove_intent = false;
    }.bind(this));
    
    Sortable.utils.on(rec_list, "dragleave", function() {
        this.remove_intent = true;
        this.app.progress = 0;
    }.bind(this));

    Sortable.utils.on(rec_list, "touchend", function(e) {
        var loc = e.changedTouches[0],
            target = document.elementFromPoint(loc.clientX, loc.clientY);

        this.remove_intent = !rec_list.contains(target);
    }.bind(this));
    
    // Favourites category
    document.querySelector("#categories a").addEventListener("dragover", this.fav_dragover.bind(this));
    document.querySelector("#categories a").addEventListener("dragleave", this.fav_dragleave.bind(this));
    document.querySelector("#categories a").addEventListener("drop", this.fav_drop.bind(this));
};


/**
 * Creates a drag-n-droppable seed list of operations.
 *
 * @param {element} list_el - The list the initialise
 */
RecipeWaiter.prototype.create_sortable_seed_list = function(list_el) {
    Sortable.create(list_el, {
        group: {
            name: "recipe",
            pull: "clone",
            put: false
        },
        sort: false,
        setData: function(dataTransfer, drag_el) {
            dataTransfer.setData("Text", drag_el.textContent);
        },
        onStart: function(evt) {
            $(evt.item).popover("destroy");
            evt.item.setAttribute("data-toggle", "popover-disabled");
        },
        onEnd: this.op_sort_end.bind(this)
    });
};


/**
 * Handler for operation sort end events.
 * Removes the operation from the list if it has been dropped outside. If not, adds it to the list
 * at the appropriate place and initialises it.
 *
 * @fires Manager#operationadd
 * @param {event} evt
 */
RecipeWaiter.prototype.op_sort_end = function(evt) {
    if (this.remove_intent) {
        if (evt.item.parentNode.id === "rec_list") {
            evt.item.remove();
        }
        return;
    }
    
    // Reinitialise the popover on the original element in the ops list because for some reason it
    // gets destroyed and recreated.
    $(evt.clone).popover();
    $(evt.clone).children("[data-toggle=popover]").popover();
    
    if (evt.item.parentNode.id !== "rec_list") {
        return;
    }
    
    this.build_recipe_operation(evt.item);
    evt.item.dispatchEvent(this.manager.operationadd);
};


/**
 * Handler for favourite dragover events.
 * If the element being dragged is an operation, displays a visual cue so that the user knows it can
 * be dropped here.
 *
 * @param {event} e
 */
RecipeWaiter.prototype.fav_dragover = function(e) {
    if (e.dataTransfer.effectAllowed !== "move")
        return false;
    
    e.stopPropagation();
    e.preventDefault();
    if (e.target.className && e.target.className.indexOf("category-title") > -1) {
        // Hovering over the a
        e.target.classList.add("favourites-hover");
    } else if (e.target.parentNode.className && e.target.parentNode.className.indexOf("category-title") > -1) {
        // Hovering over the Edit button
        e.target.parentNode.classList.add("favourites-hover");
    } else if (e.target.parentNode.parentNode.className && e.target.parentNode.parentNode.className.indexOf("category-title") > -1) {
        // Hovering over the image on the Edit button
        e.target.parentNode.parentNode.classList.add("favourites-hover");
    }
};


/**
 * Handler for favourite dragleave events.
 * Removes the visual cue.
 *
 * @param {event} e
 */
RecipeWaiter.prototype.fav_dragleave = function(e) {
    e.stopPropagation();
    e.preventDefault();
    document.querySelector("#categories a").classList.remove("favourites-hover");
};


/**
 * Handler for favourite drop events.
 * Adds the dragged operation to the favourites list.
 *
 * @param {event} e
 */
RecipeWaiter.prototype.fav_drop = function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.target.classList.remove("favourites-hover");
    
    var op_name = e.dataTransfer.getData("Text");
    this.app.add_favourite(op_name);
};


/**
 * Handler for ingredient change events.
 *
 * @fires Manager#statechange
 */
RecipeWaiter.prototype.ing_change = function() {
    window.dispatchEvent(this.manager.statechange);
};


/**
 * Handler for disable click events.
 * Updates the icon status.
 *
 * @fires Manager#statechange
 * @param {event} e
 */
RecipeWaiter.prototype.disable_click = function(e) {
    var icon = e.target;
    
    if (icon.getAttribute("disabled") === "false") {
        icon.setAttribute("disabled", "true");
        icon.classList.add("disable-icon-selected");
        icon.parentNode.parentNode.classList.add("disabled");
    } else {
        icon.setAttribute("disabled", "false");
        icon.classList.remove("disable-icon-selected");
        icon.parentNode.parentNode.classList.remove("disabled");
    }
    
    this.app.progress = 0;
    window.dispatchEvent(this.manager.statechange);
};


/**
 * Handler for breakpoint click events.
 * Updates the icon status.
 *
 * @fires Manager#statechange
 * @param {event} e
 */
RecipeWaiter.prototype.breakpoint_click = function(e) {
    var bp = e.target;

    if (bp.getAttribute("break") === "false") {
        bp.setAttribute("break", "true");
        bp.classList.add("breakpoint-selected");
    } else {
        bp.setAttribute("break", "false");
        bp.classList.remove("breakpoint-selected");
    }
    
    window.dispatchEvent(this.manager.statechange);
};


/**
 * Handler for operation doubleclick events.
 * Removes the operation from the recipe and auto bakes.
 *
 * @fires Manager#statechange
 * @param {event} e
 */
RecipeWaiter.prototype.operation_dblclick = function(e) {
    e.target.remove();
    window.dispatchEvent(this.manager.statechange);
};


/**
 * Handler for operation child doubleclick events.
 * Removes the operation from the recipe.
 *
 * @fires Manager#statechange
 * @param {event} e
 */
RecipeWaiter.prototype.operation_child_dblclick = function(e) {
    e.target.parentNode.remove();
    window.dispatchEvent(this.manager.statechange);
};


/**
 * Generates a configuration object to represent the current recipe.
 *
 * @returns {recipe_config}
 */
RecipeWaiter.prototype.get_config = function() {
    var config = [], ingredients, ing_list, disabled, bp, item,
        operations = document.querySelectorAll("#rec_list li.operation");
    
    for (var i = 0; i < operations.length; i++) {
        ingredients = [];
        disabled = operations[i].querySelector(".disable-icon");
        bp = operations[i].querySelector(".breakpoint");
        ing_list = operations[i].querySelectorAll(".arg");
        
        for (var j = 0; j < ing_list.length; j++) {
            if (ing_list[j].getAttribute("type") === "checkbox") {
                // checkbox
                ingredients[j] = ing_list[j].checked;
            } else if (ing_list[j].classList.contains("toggle-string")) {
                // toggle_string
                ingredients[j] = {
                    option: ing_list[j].previousSibling.children[0].textContent.slice(0, -1),
                    string: ing_list[j].value
                };
            } else {
                // all others
                ingredients[j] = ing_list[j].value;
            }
        }
        
        item = {
            op: operations[i].querySelector(".arg-title").textContent,
            args: ingredients
        };
        
        if (disabled && disabled.getAttribute("disabled") === "true") {
            item.disabled = true;
        }
        
        if (bp && bp.getAttribute("break") === "true") {
            item.breakpoint = true;
        }
        
        config.push(item);
    }
    
    return config;
};


/**
 * Moves or removes the breakpoint indicator in the recipe based on the position.
 *
 * @param {number} position
 */
RecipeWaiter.prototype.update_breakpoint_indicator = function(position) {
    var operations = document.querySelectorAll("#rec_list li.operation");
    for (var i = 0; i < operations.length; i++) {
        if (i === position) {
            operations[i].classList.add("break");
        } else {
            operations[i].classList.remove("break");
        }
    }
};


/**
 * Given an operation stub element, this function converts it into a full recipe element with
 * arguments.
 *
 * @param {element} el - The operation stub element from the operations pane
 */
RecipeWaiter.prototype.build_recipe_operation = function(el) {
    var op_name = el.textContent;
    var op = new HTMLOperation(op_name, this.app.operations[op_name], this.app, this.manager);
    el.innerHTML = op.to_full_html();
    
    if (this.app.operations[op_name].flow_control) {
        el.classList.add("flow-control-op");
    }
    
    // Disable auto-bake if this is a manual op - this should be moved to the 'operationadd'
    // handler after event restructuring
    if (op.manual_bake && this.app.auto_bake_) {
        this.manager.controls.set_auto_bake(false);
        this.app.alert("Auto-Bake is disabled by default when using this operation.", "info", 5000);
    }
};

/**
 * Adds the specified operation to the recipe.
 *
 * @fires Manager#operationadd
 * @param {string} name - The name of the operation to add
 * @returns {element}
 */
RecipeWaiter.prototype.add_operation = function(name) {
    var item = document.createElement("li");
    
    item.classList.add("operation");
    item.innerHTML = name;
    this.build_recipe_operation(item);
    document.getElementById("rec_list").appendChild(item);
    
    item.dispatchEvent(this.manager.operationadd);
    return item;
};


/**
 * Removes all operations from the recipe.
 *
 * @fires Manager#operationremove
 */
RecipeWaiter.prototype.clear_recipe = function() {
    var rec_list = document.getElementById("rec_list");
    while (rec_list.firstChild) {
        rec_list.removeChild(rec_list.firstChild);
    }
    rec_list.dispatchEvent(this.manager.operationremove);
};


/**
 * Handler for operation dropdown events from toggle_string arguments.
 * Sets the selected option as the name of the button.
 *
 * @param {event} e
 */
RecipeWaiter.prototype.dropdown_toggle_click = function(e) {
    var el = e.target,
        button = el.parentNode.parentNode.previousSibling;
        
    button.innerHTML = el.textContent + " <span class='caret'></span>";
    this.ing_change();
};


/**
 * Handler for operationadd events.
 *
 * @listens Manager#operationadd
 * @fires Manager#statechange
 * @param {event} e
 */
RecipeWaiter.prototype.op_add = function(e) {
    window.dispatchEvent(this.manager.statechange);
};


/**
 * Handler for operationremove events.
 *
 * @listens Manager#operationremove
 * @fires Manager#statechange
 * @param {event} e
 */
RecipeWaiter.prototype.op_remove = function(e) {
    window.dispatchEvent(this.manager.statechange);
};
