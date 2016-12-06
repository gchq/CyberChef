/* globals Sortable */

/**
 * Waiter to handle events related to the operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constructor
 * @param {HTMLApp} app - The main view object for CyberChef.
 * @param {Manager} manager - The CyberChef event manager.
 */
var OperationsWaiter = function(app, manager) {
    this.app = app;
    this.manager = manager;
    
    this.options = {};
    this.remove_intent = false;
};


/**
 * Handler for search events.
 * Finds operations which match the given search term and displays them under the search box.
 *
 * @param {event} e
 */
OperationsWaiter.prototype.search_operations = function(e) {
    var ops, selected;
    
    if (e.type == "search") { // Search
        e.preventDefault();
        ops = document.querySelectorAll("#search-results li");
        if (ops.length) {
            selected = this.get_selected_op(ops);
            if (selected > -1) {
                this.manager.recipe.add_operation(ops[selected].innerHTML);
                this.app.auto_bake();
            }
        }
    }
    
    if (e.keyCode == 13) { // Return
        e.preventDefault();
    } else if (e.keyCode == 40) { // Down
        e.preventDefault();
        ops = document.querySelectorAll("#search-results li");
        if (ops.length) {
            selected = this.get_selected_op(ops);
            if (selected > -1) {
                ops[selected].classList.remove("selected-op");
            }
            if (selected == ops.length-1) selected = -1;
            ops[selected+1].classList.add("selected-op");
        }
    } else if (e.keyCode == 38) { // Up
        e.preventDefault();
        ops = document.querySelectorAll("#search-results li");
        if (ops.length) {
            selected = this.get_selected_op(ops);
            if (selected > -1) {
                ops[selected].classList.remove("selected-op");
            }
            if (selected === 0) selected = ops.length;
            ops[selected-1].classList.add("selected-op");
        }
    } else {
        var search_results_el = document.getElementById("search-results"),
            el = e.target,
            str = el.value;
        
        while (search_results_el.firstChild) {
            $(search_results_el.firstChild).popover("destroy");
            search_results_el.removeChild(search_results_el.firstChild);
        }
        
        $("#categories .in").collapse("hide");
        if (str) {
            var matched_ops = this.filter_operations(str, true),
                matched_ops_html = "";
            
            for (var i = 0; i < matched_ops.length; i++) {
                matched_ops_html += matched_ops[i].to_stub_html();
            }
            
            search_results_el.innerHTML = matched_ops_html;
            search_results_el.dispatchEvent(this.manager.oplistcreate);
        }
    }
};


/**
 * Filters operations based on the search string and returns the matching ones.
 *
 * @param {string} search_str
 * @param {boolean} highlight - Whether or not to highlight the matching string in the operation
 *   name and description
 * @returns {string[]}
 */
OperationsWaiter.prototype.filter_operations = function(search_str, highlight) {
    var matched_ops = [],
        matched_descs = [];
    
    search_str = search_str.toLowerCase();
    
    for (var op_name in this.app.operations) {
        var op = this.app.operations[op_name],
            name_pos = op_name.toLowerCase().indexOf(search_str),
            desc_pos = op.description.toLowerCase().indexOf(search_str);
        
        if (name_pos >= 0 || desc_pos >= 0) {
            var operation = new HTMLOperation(op_name, this.app.operations[op_name], this.app, this.manager);
            if (highlight) {
                operation.highlight_search_string(search_str, name_pos, desc_pos);
            }
            
            if (name_pos < 0) {
                matched_ops.push(operation);
            } else {
                matched_descs.push(operation);
            }
        }
    }
    
    return matched_descs.concat(matched_ops);
};


/**
 * Finds the operation which has been selected using keyboard shortcuts. This will have the class
 * 'selected-op' set. Returns the index of the operation within the given list.
 *
 * @param {element[]} ops
 * @returns {number}
 */
OperationsWaiter.prototype.get_selected_op = function(ops) {
    for (var i = 0; i < ops.length; i++) {
        if (ops[i].classList.contains("selected-op")) {
            return i;
        }
    }
    return -1;
};


/**
 * Handler for oplistcreate events.
 *
 * @listens Manager#oplistcreate
 * @param {event} e
 */
OperationsWaiter.prototype.op_list_create = function(e) {
    this.manager.recipe.create_sortable_seed_list(e.target);
    $("[data-toggle=popover]").popover();
};


/**
 * Handler for operation doubleclick events.
 * Adds the operation to the recipe and auto bakes.
 *
 * @param {event} e
 */
OperationsWaiter.prototype.operation_dblclick = function(e) {
    var li = e.target;
    
    this.manager.recipe.add_operation(li.textContent);
    this.app.auto_bake();
};


/**
 * Handler for edit favourites click events.
 * Sets up the 'Edit favourites' pane and displays it.
 *
 * @param {event} e
 */
OperationsWaiter.prototype.edit_favourites_click = function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Add favourites to modal
    var fav_cat = this.app.categories.filter(function(c) {
        return c.name == "Favourites";
    })[0];
    
    var html = "";
    for (var i = 0; i < fav_cat.ops.length; i++) {
        var op_name = fav_cat.ops[i];
        var operation = new HTMLOperation(op_name, this.app.operations[op_name], this.app, this.manager);
        html += operation.to_stub_html(true);
    }
    
    var edit_favourites_list = document.getElementById("edit-favourites-list");
    edit_favourites_list.innerHTML = html;
    this.remove_intent = false;
    
    var editable_list = Sortable.create(edit_favourites_list, {
        filter: '.remove-icon',
        onFilter: function (evt) {
            var el = editable_list.closest(evt.item);
            if (el) {
                $(el).popover("destroy");
                el.parentNode.removeChild(el);
            }
        },
        onEnd: function(evt) {
            if (this.remove_intent) evt.item.remove();
        }.bind(this),
    });
    
    Sortable.utils.on(edit_favourites_list, "dragleave", function() {
         this.remove_intent = true;
    }.bind(this));
    
    Sortable.utils.on(edit_favourites_list, "dragover", function() {
         this.remove_intent = false;
    }.bind(this));
    
    $("#edit-favourites-list [data-toggle=popover]").popover();
    $("#favourites-modal").modal();
};


/**
 * Handler for save favourites click events.
 * Saves the selected favourites and reloads them.
 */
OperationsWaiter.prototype.save_favourites_click = function() {
    var favourites_list = [],
        favs = document.querySelectorAll("#edit-favourites-list li");
    
    for (var i = 0; i < favs.length; i++) {
        favourites_list.push(favs[i].textContent);
    }

    this.app.save_favourites(favourites_list);
    this.app.load_favourites();
    this.app.populate_operations_list();
    this.manager.recipe.initialise_operation_drag_n_drop();
};


/**
 * Handler for reset favourites click events.
 * Resets favourites to their defaults.
 */
OperationsWaiter.prototype.reset_favourites_click = function() {
    this.app.reset_favourites();
};


/**
 * Handler for op_icon mouseover events.
 * Hides any popovers already showing on the operation so that there aren't two at once.
 *
 * @param {event} e
 */
OperationsWaiter.prototype.op_icon_mouseover = function(e) {
    var op_el = e.target.parentNode;
    if (e.target.getAttribute("data-toggle") == "popover") {
        $(op_el).popover("hide");
    }
};


/**
 * Handler for op_icon mouseleave events.
 * If this icon created a popover and we're moving back to the operation element, display the
 *   operation popover again.
 *
 * @param {event} e
 */
OperationsWaiter.prototype.op_icon_mouseleave = function(e) {
    var op_el = e.target.parentNode,
        to_el = e.toElement || e.relatedElement;
    
    if (e.target.getAttribute("data-toggle") == "popover" && to_el === op_el) {
        $(op_el).popover("show");
    }
};
