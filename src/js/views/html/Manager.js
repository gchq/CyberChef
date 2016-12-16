/**
 * This object controls the Waiters responsible for handling events from all areas of the app.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constructor
 * @param {HTMLApp} app - The main view object for CyberChef.
 */
var Manager = function(app) {
    this.app = app;
    
    // Define custom events
    /**
     * @event Manager#appstart
     */
    this.appstart = new CustomEvent("appstart", {bubbles: true});
    /**
     * @event Manager#operationadd
     */
    this.operationadd = new CustomEvent("operationadd", {bubbles: true});
    /**
     * @event Manager#operationremove
     */
    this.operationremove = new CustomEvent("operationremove", {bubbles: true});
    /**
     * @event Manager#oplistcreate
     */
    this.oplistcreate = new CustomEvent("oplistcreate", {bubbles: true});
    /**
     * @event Manager#statechange
     */
    this.statechange = new CustomEvent("statechange", {bubbles: true});
    
    // Define Waiter objects to handle various areas
    this.window      = new WindowWaiter(this.app);
    this.controls    = new ControlsWaiter(this.app, this);
    this.recipe      = new RecipeWaiter(this.app, this);
    this.ops         = new OperationsWaiter(this.app, this);
    this.input       = new InputWaiter(this.app, this);
    this.output      = new OutputWaiter(this.app, this);
    this.options     = new OptionsWaiter(this.app);
    this.highlighter = new HighlighterWaiter(this.app);
    this.seasonal    = new SeasonalWaiter(this.app, this);
    
    // Object to store dynamic handlers to fire on elements that may not exist yet
    this.dynamic_handlers = {};
    
    this.initialise_event_listeners();
};


/**
 * Sets up the various components and listeners.
 */
Manager.prototype.setup = function() {
    this.recipe.initialise_operation_drag_n_drop();
    this.controls.auto_bake_change();
    this.seasonal.load();
};


/**
 * Main function to handle the creation of the event listeners.
 */
Manager.prototype.initialise_event_listeners = function() {
    // Global
    window.addEventListener("resize", this.window.window_resize.bind(this.window));
    window.addEventListener("blur", this.window.window_blur.bind(this.window));
    window.addEventListener("focus", this.window.window_focus.bind(this.window));
    window.addEventListener("statechange", this.app.state_change.bind(this.app));
    window.addEventListener("popstate", this.app.pop_state.bind(this.app));
    
    // Controls
    document.getElementById("bake").addEventListener("click", this.controls.bake_click.bind(this.controls));
    document.getElementById("auto-bake").addEventListener("change", this.controls.auto_bake_change.bind(this.controls));
    document.getElementById("step").addEventListener("click", this.controls.step_click.bind(this.controls));
    document.getElementById("clr-recipe").addEventListener("click", this.controls.clear_recipe_click.bind(this.controls));
    document.getElementById("clr-breaks").addEventListener("click", this.controls.clear_breaks_click.bind(this.controls));
    document.getElementById("save").addEventListener("click", this.controls.save_click.bind(this.controls));
    document.getElementById("save-button").addEventListener("click", this.controls.save_button_click.bind(this.controls));
    document.getElementById("save-link-recipe-checkbox").addEventListener("change", this.controls.slr_check_change.bind(this.controls));
    document.getElementById("save-link-input-checkbox").addEventListener("change", this.controls.sli_check_change.bind(this.controls));
    document.getElementById("load").addEventListener("click", this.controls.load_click.bind(this.controls));
    document.getElementById("load-delete-button").addEventListener("click", this.controls.load_delete_click.bind(this.controls));
    document.getElementById("load-name").addEventListener("change", this.controls.load_name_change.bind(this.controls));
    document.getElementById("load-button").addEventListener("click", this.controls.load_button_click.bind(this.controls));
    this.add_multi_event_listener("#save-text", "keyup paste", this.controls.save_text_change, this.controls);
    
    // Operations
    this.add_multi_event_listener("#search", "keyup paste search", this.ops.search_operations, this.ops);
    this.add_dynamic_listener(".op_list li.operation", "dblclick", this.ops.operation_dblclick, this.ops);
    document.getElementById("edit-favourites").addEventListener("click", this.ops.edit_favourites_click.bind(this.ops));
    document.getElementById("save-favourites").addEventListener("click", this.ops.save_favourites_click.bind(this.ops));
    document.getElementById("reset-favourites").addEventListener("click", this.ops.reset_favourites_click.bind(this.ops));
    this.add_dynamic_listener(".op_list .op-icon", "mouseover", this.ops.op_icon_mouseover, this.ops);
    this.add_dynamic_listener(".op_list .op-icon", "mouseleave", this.ops.op_icon_mouseleave, this.ops);
    this.add_dynamic_listener(".op_list", "oplistcreate", this.ops.op_list_create, this.ops);
    this.add_dynamic_listener("li.operation", "operationadd", this.recipe.op_add.bind(this.recipe));
    
    // Recipe
    this.add_dynamic_listener(".arg", "keyup", this.recipe.ing_change, this.recipe);
    this.add_dynamic_listener(".arg", "change", this.recipe.ing_change, this.recipe);
    this.add_dynamic_listener(".disable-icon", "click", this.recipe.disable_click, this.recipe);
    this.add_dynamic_listener(".breakpoint", "click", this.recipe.breakpoint_click, this.recipe);
    this.add_dynamic_listener("#rec_list li.operation", "dblclick", this.recipe.operation_dblclick, this.recipe);
    this.add_dynamic_listener("#rec_list li.operation > div", "dblclick", this.recipe.operation_child_dblclick, this.recipe);
    this.add_dynamic_listener("#rec_list .input-group .dropdown-menu a", "click", this.recipe.dropdown_toggle_click, this.recipe);
    this.add_dynamic_listener("#rec_list", "operationremove", this.recipe.op_remove.bind(this.recipe));
    
    // Input
    this.add_multi_event_listener("#input-text", "keyup paste", this.input.input_change, this.input);
    document.getElementById("reset-layout").addEventListener("click", this.app.reset_layout.bind(this.app));
    document.getElementById("clr-io").addEventListener("click", this.input.clear_io_click.bind(this.input));
    document.getElementById("input-text").addEventListener("dragover", this.input.input_dragover.bind(this.input));
    document.getElementById("input-text").addEventListener("dragleave", this.input.input_dragleave.bind(this.input));
    document.getElementById("input-text").addEventListener("drop", this.input.input_drop.bind(this.input));
    document.getElementById("input-text").addEventListener("scroll", this.highlighter.input_scroll.bind(this.highlighter));
    document.getElementById("input-text").addEventListener("mouseup", this.highlighter.input_mouseup.bind(this.highlighter));
    document.getElementById("input-text").addEventListener("mousemove", this.highlighter.input_mousemove.bind(this.highlighter));
    this.add_multi_event_listener("#input-text", "mousedown dblclick select",  this.highlighter.input_mousedown, this.highlighter);
    
    // Output
    document.getElementById("save-to-file").addEventListener("click", this.output.save_click.bind(this.output));
    document.getElementById("switch").addEventListener("click", this.output.switch_click.bind(this.output));
    document.getElementById("undo-switch").addEventListener("click", this.output.undo_switch_click.bind(this.output));
    document.getElementById("output-text").addEventListener("scroll", this.highlighter.output_scroll.bind(this.highlighter));
    document.getElementById("output-text").addEventListener("mouseup", this.highlighter.output_mouseup.bind(this.highlighter));
    document.getElementById("output-text").addEventListener("mousemove", this.highlighter.output_mousemove.bind(this.highlighter));
    document.getElementById("output-html").addEventListener("mouseup", this.highlighter.output_html_mouseup.bind(this.highlighter));
    document.getElementById("output-html").addEventListener("mousemove", this.highlighter.output_html_mousemove.bind(this.highlighter));
    this.add_multi_event_listener("#output-text", "mousedown dblclick select",  this.highlighter.output_mousedown, this.highlighter);
    this.add_multi_event_listener("#output-html", "mousedown dblclick select",  this.highlighter.output_html_mousedown, this.highlighter);
    
    // Options
    document.getElementById("options").addEventListener("click", this.options.options_click.bind(this.options));
    document.getElementById("reset-options").addEventListener("click", this.options.reset_options_click.bind(this.options));
    $(document).on("switchChange.bootstrapSwitch", ".option-item input:checkbox", this.options.switch_change.bind(this.options));
    $(document).on("switchChange.bootstrapSwitch", ".option-item input:checkbox", this.options.set_word_wrap.bind(this.options));
    this.add_dynamic_listener(".option-item input[type=number]", "keyup", this.options.number_change, this.options);
    this.add_dynamic_listener(".option-item input[type=number]", "change", this.options.number_change, this.options);
    this.add_dynamic_listener(".option-item select", "change", this.options.select_change, this.options);
    
    // Misc
    document.getElementById("alert-close").addEventListener("click", this.app.alert_close_click.bind(this.app));
};


/**
 * Adds an event listener to each element in the specified group.
 *
 * @param {string} selector - A selector string for the element group to add the event to, see
 *   this.get_all()
 * @param {string} event_type - The event to listen for
 * @param {function} callback - The function to execute when the event is triggered
 * @param {Object} [scope=this] - The object to bind to the callback function
 *
 * @example
 * // Calls the clickable function whenever any element with the .clickable class is clicked
 * this.add_listeners(".clickable", "click", this.clickable, this);
 */
Manager.prototype.add_listeners = function(selector, event_type, callback, scope) {
    scope = scope || this;
    [].forEach.call(document.querySelectorAll(selector), function(el) {
        el.addEventListener(event_type, callback.bind(scope));
    });
};


/**
 * Adds multiple event listeners to the specified element.
 *
 * @param {string} selector - A selector string for the element to add the events to
 * @param {string} event_types - A space-separated string of all the event types to listen for
 * @param {function} callback - The function to execute when the events are triggered
 * @param {Object} [scope=this] - The object to bind to the callback function
 *
 * @example
 * // Calls the search function whenever the the keyup, paste or search events are triggered on the
 * // search element
 * this.add_multi_event_listener("search", "keyup paste search", this.search, this);
 */
Manager.prototype.add_multi_event_listener = function(selector, event_types, callback, scope) {
    var evs = event_types.split(" ");
    for (var i = 0; i < evs.length; i++) {
        document.querySelector(selector).addEventListener(evs[i], callback.bind(scope));
    }
};


/**
 * Adds multiple event listeners to each element in the specified group.
 *
 * @param {string} selector - A selector string for the element group to add the events to
 * @param {string} event_types - A space-separated string of all the event types to listen for
 * @param {function} callback - The function to execute when the events are triggered
 * @param {Object} [scope=this] - The object to bind to the callback function
 *
 * @example
 * // Calls the save function whenever the the keyup or paste events are triggered on any element
 * // with the .saveable class
 * this.add_multi_event_listener(".saveable", "keyup paste", this.save, this);
 */
Manager.prototype.add_multi_event_listeners = function(selector, event_types, callback, scope) {
    var evs = event_types.split(" ");
    for (var i = 0; i < evs.length; i++) {
        this.add_listeners(selector, evs[i], callback, scope);
    }
};


/**
 * Adds an event listener to the global document object which will listen on dynamic elements which
 * may not exist in the DOM yet.
 *
 * @param {string} selector - A selector string for the element(s) to add the event to
 * @param {string} event_type - The event(s) to listen for
 * @param {function} callback - The function to execute when the event(s) is/are triggered
 * @param {Object} [scope=this] - The object to bind to the callback function
 *
 * @example
 * // Pops up an alert whenever any button is clicked, even if it is added to the DOM after this
 * // listener is created
 * this.add_dynamic_listener("button", "click", alert, this);
 */
Manager.prototype.add_dynamic_listener = function(selector, event_type, callback, scope) {
    var event_config = {
        selector: selector,
        callback: callback.bind(scope || this)
    };
    
    if (this.dynamic_handlers.hasOwnProperty(event_type)) {
        // Listener already exists, add new handler to the appropriate list
        this.dynamic_handlers[event_type].push(event_config);
    } else {
        this.dynamic_handlers[event_type] = [event_config];
        // Set up listener for this new type
        document.addEventListener(event_type, this.dynamic_listener_handler.bind(this));
    }
};


/**
 * Handler for dynamic events. This function is called for any dynamic event and decides which
 * callback(s) to execute based on the type and selector.
 *
 * @param {Event} e - The event to be handled
 */
Manager.prototype.dynamic_listener_handler = function(e) {
    var handlers = this.dynamic_handlers[e.type],
        matches = e.target.matches ||
            e.target.webkitMatchesSelector ||
            e.target.mozMatchesSelector ||
            e.target.msMatchesSelector ||
            e.target.oMatchesSelector;
    
    for (var i = 0; i < handlers.length; i++) {
        if (matches && e.target[matches.name](handlers[i].selector)) {
            handlers[i].callback(e);
        }
    }
};
