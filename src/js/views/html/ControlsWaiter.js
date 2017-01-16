/**
 * Waiter to handle events related to the CyberChef controls (i.e. Bake, Step, Save, Load etc.)
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constructor
 * @param {HTMLApp} app - The main view object for CyberChef.
 * @param {Manager} manager - The CyberChef event manager.
 */
var ControlsWaiter = function(app, manager) {
    this.app = app;
    this.manager = manager;
};


/**
 * Adjusts the display properties of the control buttons so that they fit within the current width
 * without wrapping or overflowing.
 */
ControlsWaiter.prototype.adjust_width = function() {
    var controls       = document.getElementById("controls"),
        step           = document.getElementById("step"),
        clr_breaks     = document.getElementById("clr-breaks"),
        save_img       = document.querySelector("#save img"),
        load_img       = document.querySelector("#load img"),
        step_img       = document.querySelector("#step img"),
        clr_recip_img  = document.querySelector("#clr-recipe img"),
        clr_breaks_img = document.querySelector("#clr-breaks img");
    
    if (controls.clientWidth < 470) {
        step.childNodes[1].nodeValue = " Step";
    } else {
        step.childNodes[1].nodeValue = " Step through";
    }
        
    if (controls.clientWidth < 400) {
        save_img.style.display = "none";
        load_img.style.display = "none";
        step_img.style.display = "none";
        clr_recip_img.style.display = "none";
        clr_breaks_img.style.display = "none";
    } else {
        save_img.style.display = "inline";
        load_img.style.display = "inline";
        step_img.style.display = "inline";
        clr_recip_img.style.display = "inline";
        clr_breaks_img.style.display = "inline";
    }
    
    if (controls.clientWidth < 330) {
        clr_breaks.childNodes[1].nodeValue = " Clear breaks";
    } else {
        clr_breaks.childNodes[1].nodeValue = " Clear breakpoints";
    }
};


/**
 * Checks or unchecks the Auto Bake checkbox based on the given value.
 *
 * @param {boolean} value - The new value for Auto Bake.
 */
ControlsWaiter.prototype.set_auto_bake = function(value) {
    var auto_bake_checkbox = document.getElementById("auto-bake");
    
    if (auto_bake_checkbox.checked !== value) {
        auto_bake_checkbox.click();
    }
};


/**
 * Handler to trigger baking.
 */
ControlsWaiter.prototype.bake_click = function() {
    this.app.bake();
    $("#output-text").selectRange(0);
};


/**
 * Handler for the 'Step through' command. Executes the next step of the recipe.
 */
ControlsWaiter.prototype.step_click = function() {
    this.app.bake(true);
    $("#output-text").selectRange(0);
};


/**
 * Handler for changes made to the Auto Bake checkbox.
 */
ControlsWaiter.prototype.auto_bake_change = function() {
    var auto_bake_label    = document.getElementById("auto-bake-label"),
        auto_bake_checkbox = document.getElementById("auto-bake");
        
    this.app.auto_bake_ = auto_bake_checkbox.checked;
    
    if (auto_bake_checkbox.checked) {
        auto_bake_label.classList.remove("btn-default");
        auto_bake_label.classList.add("btn-success");
    } else {
        auto_bake_label.classList.remove("btn-success");
        auto_bake_label.classList.add("btn-default");
    }
};


/**
 * Handler for the 'Clear recipe' command. Removes all operations from the recipe.
 */
ControlsWaiter.prototype.clear_recipe_click = function() {
    this.manager.recipe.clear_recipe();
};


/**
 * Handler for the 'Clear breakpoints' command. Removes all breakpoints from operations in the
 * recipe.
 */
ControlsWaiter.prototype.clear_breaks_click = function() {
    var bps = document.querySelectorAll("#rec_list li.operation .breakpoint");
    
    for (var i = 0; i < bps.length; i++) {
        bps[i].setAttribute("break", "false");
        bps[i].classList.remove("breakpoint-selected");
    }
};


/**
 * Populates the save disalog box with a URL incorporating the recipe and input.
 *
 * @param {Object[]} [recipe_config] - The recipe configuration object array.
 */
ControlsWaiter.prototype.initialise_save_link = function(recipe_config) {
    recipe_config = recipe_config || this.app.get_recipe_config();
    
    var include_recipe = document.getElementById("save-link-recipe-checkbox").checked,
        include_input = document.getElementById("save-link-input-checkbox").checked,
        save_link_el = document.getElementById("save-link"),
        save_link = this.generate_state_url(include_recipe, include_input, recipe_config);
    
    save_link_el.innerHTML = Utils.truncate(save_link, 120);
    save_link_el.setAttribute("href", save_link);
};


/**
 * Generates a URL containing the current recipe and input state.
 *
 * @param {boolean} include_recipe - Whether to include the recipe in the URL.
 * @param {boolean} include_input - Whether to include the input in the URL.
 * @param {Object[]} [recipe_config] - The recipe configuration object array.
 * @returns {string}
 */
ControlsWaiter.prototype.generate_state_url = function(include_recipe, include_input, recipe_config) {
    recipe_config = recipe_config || this.app.get_recipe_config();
    
    var link = window.location.protocol + "//" +
                window.location.host +
                window.location.pathname,
        recipe_str = JSON.stringify(recipe_config),
        input_str = Utils.to_base64(this.app.get_input(), "A-Za-z0-9+/"); // B64 alphabet with no padding
        
    include_recipe = include_recipe && (recipe_config.length > 0);
    include_input = include_input && (input_str.length > 0) && (input_str.length < 8000);

    if (include_recipe) {
        link += "?recipe=" + encodeURIComponent(recipe_str);
    }
    
    if (include_recipe && include_input) {
        link += "&input=" + encodeURIComponent(input_str);
    } else if (include_input) {
        link += "?input=" + encodeURIComponent(input_str);
    }
    
    return link;
};


/**
 * Handler for changes made to the save dialog text area. Re-initialises the save link.
 */
ControlsWaiter.prototype.save_text_change = function() {
    try {
        var recipe_config = JSON.parse(document.getElementById("save-text").value);
        this.initialise_save_link(recipe_config);
    } catch(err) {}
};


/**
 * Handler for the 'Save' command. Pops up the save dialog box.
 */
ControlsWaiter.prototype.save_click = function() {
    var recipe_config = this.app.get_recipe_config();
    var recipe_str = JSON.stringify(recipe_config).replace(/},{/g, "},\n{");
    document.getElementById("save-text").value = recipe_str;
    
    this.initialise_save_link(recipe_config);
    $("#save-modal").modal();
};


/**
 * Handler for the save link recipe checkbox change event.
 */
ControlsWaiter.prototype.slr_check_change = function() {
    this.initialise_save_link();
};


/**
 * Handler for the save link input checkbox change event.
 */
ControlsWaiter.prototype.sli_check_change = function() {
    this.initialise_save_link();
};


/**
 * Handler for the 'Load' command. Pops up the load dialog box.
 */
ControlsWaiter.prototype.load_click = function() {
    this.populate_load_recipes_list();
    $("#load-modal").modal();
};


/**
 * Saves the recipe specified in the save textarea to local storage.
 */
ControlsWaiter.prototype.save_button_click = function() {
    var recipe_name = document.getElementById("save-name").value,
        recipe_str  = document.getElementById("save-text").value;
    
    if (!recipe_name) {
        this.app.alert("Please enter a recipe name", "danger", 2000);
        return;
    }
    
    var saved_recipes = localStorage.saved_recipes ?
            JSON.parse(localStorage.saved_recipes) : [],
        recipe_id = localStorage.recipe_id || 0;
    
    saved_recipes.push({
        id: ++recipe_id,
        name: recipe_name,
        recipe: recipe_str
    });
    
    localStorage.saved_recipes = JSON.stringify(saved_recipes);
    localStorage.recipe_id = recipe_id;
    
    this.app.alert("Recipe saved as \"" + recipe_name + "\".", "success", 2000);
};


/**
 * Populates the list of saved recipes in the load dialog box from local storage.
 */
ControlsWaiter.prototype.populate_load_recipes_list = function() {
    var load_name_el = document.getElementById("load-name");
        
    // Remove current recipes from select
    var i = load_name_el.options.length;
    while (i--) {
        load_name_el.remove(i);
    }

    // Add recipes to select
    var saved_recipes = localStorage.saved_recipes ?
            JSON.parse(localStorage.saved_recipes) : [];
    
    for (i = 0; i < saved_recipes.length; i++) {
        var opt = document.createElement("option");
        opt.value = saved_recipes[i].id;
        opt.innerHTML = saved_recipes[i].name;
        
        load_name_el.appendChild(opt);
    }
    
    // Populate textarea with first recipe
    document.getElementById("load-text").value = saved_recipes.length ? saved_recipes[0].recipe : "";
};


/**
 * Removes the currently selected recipe from local storage.
 */
ControlsWaiter.prototype.load_delete_click = function() {
    var id = parseInt(document.getElementById("load-name").value, 10),
        saved_recipes = localStorage.saved_recipes ?
            JSON.parse(localStorage.saved_recipes) : [];
        
    saved_recipes = saved_recipes.filter(function(r) {
        return r.id !== id;
    });
    
    localStorage.saved_recipes = JSON.stringify(saved_recipes);
    this.populate_load_recipes_list();
};


/**
 * Displays the selected recipe in the load text box.
 */
ControlsWaiter.prototype.load_name_change = function(e) {
    var el = e.target,
        saved_recipes = localStorage.saved_recipes ?
            JSON.parse(localStorage.saved_recipes) : [],
        id = parseInt(el.value, 10);
        
    var recipe = saved_recipes.filter(function(r) {
        return r.id === id;
    })[0];
    
    document.getElementById("load-text").value = recipe.recipe;
};


/**
 * Loads the selected recipe and populates the Recipe with its operations.
 */
ControlsWaiter.prototype.load_button_click = function() {
    try {
        var recipe_config = JSON.parse(document.getElementById("load-text").value);
        this.app.set_recipe_config(recipe_config);

        $("#rec_list [data-toggle=popover]").popover();
    } catch(e) {
        this.app.alert("Invalid recipe", "danger", 2000);
    }
};
